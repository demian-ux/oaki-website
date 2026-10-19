import { z } from "zod";
import { leadLabel, leadPath } from "./lead-source";

// The intro-call picker on /contact. Availability is read from Demi's
// Google Calendar (freeBusy) and a booking becomes a real event with a Meet
// link and an invite to the visitor. No SDK: three plain REST calls.
//
// Env (all three required for live mode):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
//   GOOGLE_CALENDAR_ID (optional, defaults to "primary")
// Get the refresh token once with `node scripts/google-refresh-token.mjs`.
//
// Without them, development runs in mock mode (every slot free, bookings
// are not written anywhere) and production hides the booking path.

/** Working hours, read in the studio's own time zone. Edit here. */
export const BOOKING = {
  timeZone: "America/Argentina/Buenos_Aires",
  slotMinutes: 30,
  /** 1 = Monday … 5 = Friday. */
  days: [1, 2, 3, 4, 5],
  startHour: 10,
  endHour: 18,
  /** No slot closer than this to now. */
  minNoticeHours: 12,
  /** How far ahead the calendar opens. */
  horizonDays: 30,
} as const;

export const bookingRequestSchema = z.object({
  start: z.iso.datetime(),
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.email("That email does not look right"),
  note: z.string().trim().max(1000, "Keep the note under 1,000 characters").optional(),
  // Where the lead came from (src/lib/lead-source.ts).
  source: z.string().max(64).optional(),
  from: z.string().max(64).optional(),
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export function bookingMode(): "live" | "mock" | "off" {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) return "live";
  return process.env.NODE_ENV === "production" ? "off" : "mock";
}

// ── Time zone math (no library) ──────────────────────────────────────────

/** Wall-clock parts of an instant in a time zone. */
function wallParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    year: +get("year"),
    month: +get("month"),
    day: +get("day"),
    hour: +get("hour"),
    minute: +get("minute"),
    second: +get("second"),
    weekday,
  };
}

/** The UTC instant at which the zone's wall clock reads y-m-d h:min. */
function zonedToUtc(y: number, m: number, d: number, h: number, min: number, timeZone: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const offsetAt = (t: number) => {
    const p = wallParts(new Date(t), timeZone);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - t;
  };
  // Two passes settle the offset across a DST edge.
  let t = guess - offsetAt(guess);
  t = guess - offsetAt(t);
  return new Date(t);
}

/** Every slot start inside working hours, from min notice to the horizon. */
function candidateSlots(now = new Date()): Date[] {
  const { timeZone, slotMinutes, days, startHour, endHour, minNoticeHours, horizonDays } = BOOKING;
  const earliest = now.getTime() + minNoticeHours * 3600_000;
  const today = wallParts(now, timeZone);
  const out: Date[] = [];
  for (let i = 0; i <= horizonDays; i++) {
    // Walk calendar days in the studio zone; Date.UTC normalises overflow.
    const ref = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12));
    const y = ref.getUTCFullYear();
    const m = ref.getUTCMonth() + 1;
    const d = ref.getUTCDate();
    if (!(days as readonly number[]).includes(ref.getUTCDay())) continue;
    for (let min = startHour * 60; min + slotMinutes <= endHour * 60; min += slotMinutes) {
      const start = zonedToUtc(y, m, d, Math.floor(min / 60), min % 60, timeZone);
      if (start.getTime() >= earliest) out.push(start);
    }
  }
  return out;
}

// ── Google Calendar ──────────────────────────────────────────────────────

let token: { value: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

const calendarId = () => process.env.GOOGLE_CALENDAR_ID || "primary";

async function google<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google Calendar ${path} failed (${res.status}) ${detail.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

type Busy = { start: number; end: number }[];

async function busyBetween(from: Date, to: Date): Promise<Busy> {
  if (bookingMode() !== "live") return [];
  const id = calendarId();
  const data = await google<{
    calendars: Record<string, { busy: { start: string; end: string }[]; errors?: unknown[] }>;
  }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id }] }),
  });
  const cal = data.calendars[id];
  if (!cal || cal.errors?.length) throw new Error("Google Calendar returned no free/busy data");
  return cal.busy.map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
}

const overlaps = (start: number, end: number, busy: Busy) =>
  busy.some((b) => start < b.end && end > b.start);

/** Free slot starts as ISO strings (UTC). */
export async function availableSlots(): Promise<string[]> {
  const slots = candidateSlots();
  if (slots.length === 0) return [];
  const ms = BOOKING.slotMinutes * 60_000;
  const busy = await busyBetween(slots[0], new Date(slots[slots.length - 1].getTime() + ms));
  return slots
    .filter((s) => !overlaps(s.getTime(), s.getTime() + ms, busy))
    .map((s) => s.toISOString());
}

export class SlotTakenError extends Error {}

/** Re-checks the slot, then writes the event and invites the visitor. */
export async function book(req: BookingRequest) {
  const start = new Date(req.start);
  const ms = BOOKING.slotMinutes * 60_000;
  const end = new Date(start.getTime() + ms);

  // Only slots the picker could have offered are bookable.
  const valid = candidateSlots().some((s) => s.getTime() === start.getTime());
  if (!valid) throw new SlotTakenError("That time is no longer open. Please pick another.");
  if (overlaps(start.getTime(), end.getTime(), await busyBetween(start, end))) {
    throw new SlotTakenError("Someone just took that time. Please pick another.");
  }

  if (bookingMode() !== "live") {
    return { mock: true as const, start: start.toISOString(), meetLink: null };
  }

  const event = await google<{ hangoutLink?: string; htmlLink: string }>(
    `/calendars/${encodeURIComponent(calendarId())}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: `oaki studio · Intro call with ${req.name}`,
        description: [
          `Booked from oaki.studio${leadPath(req)}`,
          leadLabel(req) && `Source: ${leadLabel(req)}`,
          `Name: ${req.name}`,
          `Email: ${req.email}`,
          req.note && `\nNote:\n${req.note}`,
        ]
          .filter(Boolean)
          .join("\n"),
        start: { dateTime: start.toISOString(), timeZone: BOOKING.timeZone },
        end: { dateTime: end.toISOString(), timeZone: BOOKING.timeZone },
        attendees: [{ email: req.email, displayName: req.name }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );
  return { mock: false as const, start: start.toISOString(), meetLink: event.hangoutLink ?? null };
}
