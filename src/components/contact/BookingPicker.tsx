"use client";

import { useEffect, useMemo, useState } from "react";
import Received from "@/components/contact/Received";
import { DISABLED, FOCUS, HAIRLINE, MOTION, OCRE_ON_NEGRO } from "@/components/contact/ui";
import { bookingRequestSchema } from "@/lib/booking";
import type { Lead } from "@/lib/lead-source";
import { track } from "@vercel/analytics";

// Three quiet steps on one surface: a day, a time, then who you are. The
// month is a ruled grid (handoff 1e "The grid plate"): only days with an
// open slot carry the ocre tick. Slots arrive as UTC from the API.

type Availability = { mode: "live" | "mock"; slotMinutes: number; slots: string[] };
type Booked = { start: string; meetLink: string | null; email: string };

// Every time on the picker reads in US Eastern (the clients' clock), for
// every visitor. America/New_York follows EST/EDT on its own.
const DISPLAY_TZ = "America/New_York";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inputBase = `w-full border-b bg-transparent py-3 text-[16px] text-ink focus:border-ink placeholder:text-muted ${MOTION} ${FOCUS}`;

/** YYYY-MM-DD of an instant in a zone (en-CA formats that way). */
function dayKey(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" }).format(new Date(iso));
}

/** Monday-first grid cells for a month: null pads, 1..n, then null pads
 *  to close the last week (an open cell would show the hairline ground). */
function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const pad = (first + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const tail = (7 - ((pad + days) % 7)) % 7;
  return [
    ...Array(pad).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
    ...Array(tail).fill(null),
  ] as (number | null)[];
}

const keyOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

interface BookingPickerProps {
  /** Where the lead came from (selected work passes source and from);
   *  goes to the API, the notification mail and the calendar event. */
  lead?: Lead;
}

export default function BookingPicker({ lead }: BookingPickerProps = {}) {
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState("");
  const timeZone = DISPLAY_TZ;
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<string | null>(null);
  // `pick` is the time highlighted in the column; `slot` is the one the
  // visitor confirmed, which opens step 3.
  const [pick, setPick] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<Booked | null>(null);

  const load = () => {
    fetch("/api/booking/availability", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Could not load the calendar");
        const tz = DISPLAY_TZ;
        setLoadError("");
        setData(json);
        const first = json.slots[0] ? dayKey(json.slots[0], tz) : null;
        const [y, m] = (first ?? dayKey(new Date().toISOString(), tz)).split("-").map(Number);
        setView({ y, m: m - 1 });
      })
      .catch((e: Error) => setLoadError(e.message));
  };
  useEffect(load, []);

  // Slots grouped by the visitor's calendar day.
  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of data?.slots ?? []) {
      const k = dayKey(s, timeZone);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [data, timeZone]);

  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone, ...opts }).format(new Date(iso));
  const timeLabel = (iso: string) => fmt(iso, { hour: "numeric", minute: "2-digit" });
  const longLabel = (iso: string) =>
    `${fmt(iso, { weekday: "long", month: "long", day: "numeric" })}, ${timeLabel(iso)}`;
  const zoneLabel = "ET";

  // Months that hold slots bound the prev/next arrows.
  const months = useMemo(() => {
    const keys = [...byDay.keys()].sort();
    return { first: keys[0]?.slice(0, 7), last: keys[keys.length - 1]?.slice(0, 7) };
  }, [byDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    setError("");
    const parsed = bookingRequestSchema.safeParse({
      start: slot,
      name: form.name.trim(),
      email: form.email.trim(),
      note: form.note.trim() || undefined,
      ...(lead?.source ? { source: lead.source } : {}),
      ...(lead?.from ? { from: lead.from } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the details.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // The slot went while they were typing: refresh and send them back.
        setSlot(null);
        setPick(null);
        load();
      }
      if (!res.ok) throw new Error(json.error ?? "We could not book that time.");
      // Two properties at most: Vercel Web Analytics on Pro keeps only two
      // per custom event, so source and from travel as one origin string
      // ("selected-works/goldman", "selected-works/booth", "site").
      track("Call booked", {
        origin: lead?.source ? [lead.source, lead.from].filter(Boolean).join("/") : "site",
        mode: data?.mode ?? null,
      });
      setBooked({ start: json.start, meetLink: json.meetLink, email: parsed.data.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not book that time.");
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <>
        <Received
          heading={`See you ${fmt(booked.start, { weekday: "long", month: "long", day: "numeric" })}`}
          detail={`${timeLabel(booked.start)} ${zoneLabel} · ${data?.slotMinutes ?? 30} minutes on video`}
        >
          The invite with the video link is on its way to {booked.email}.
        </Received>
        {data?.mode === "mock" && (
          <p className="text-meta text-warm-deep -mt-8 pb-16">
            Preview mode: Google Calendar is not connected, so nothing was booked.
          </p>
        )}
      </>
    );
  }

  if (loadError) {
    return (
      <p role="alert" className="text-meta" style={{ color: "var(--color-error)" }}>
        {loadError}. Write to{" "}
        <a href="mailto:info@oaki.studio" className="underline underline-offset-4">
          info@oaki.studio
        </a>{" "}
        and we will find a time.
      </p>
    );
  }

  if (!data || !view) {
    return <p className="text-meta text-muted py-10">Loading the calendar…</p>;
  }

  // Step 3: the visitor's details for a chosen slot, on the same rules
  // as the grid plate: a 2px negro rule over the summary, 1px hairlines.
  if (slot) {
    return (
      <form onSubmit={handleSubmit} noValidate>
        {lead?.source && <input type="hidden" name="source" value={lead.source} />}
        {lead?.from && <input type="hidden" name="from" value={lead.from} />}
        <div className="flex items-baseline justify-between gap-6 border-t-2 border-ink pt-4 pb-6 mb-10">
          <div>
            <p className="coord mb-3">{data.slotMinutes} minute call · video</p>
            <p className="text-[22px] font-light text-ink">{longLabel(slot)}</p>
            <p className="text-meta text-muted mt-1">Eastern Time ({zoneLabel})</p>
          </div>
          <button
            type="button"
            onClick={() => setSlot(null)}
            className={`text-[14px] text-ink border-b border-ink shrink-0 hover:text-warm-deep ${MOTION} ${FOCUS}`}
          >
            Change time
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {(["name", "email"] as const).map((f) => (
            <div key={f}>
              <label htmlFor={`book-${f}`} className="coord block mb-2.5" style={{ fontSize: 10, color: "var(--color-muted)" }}>
                {f === "name" ? "Name" : "Email"}
                <span className="text-warm-deep ml-1">*</span>
              </label>
              <input
                id={`book-${f}`}
                type={f === "email" ? "email" : "text"}
                autoComplete={f}
                value={form[f]}
                onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                required
                className={inputBase}
                style={{ borderColor: HAIRLINE }}
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="book-note" className="coord block mb-2.5" style={{ fontSize: 10, color: "var(--color-muted)" }}>
            Anything we should look at before the call?
          </label>
          <textarea
            id="book-note"
            rows={4}
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            className={`${inputBase} resize-none`}
            style={{ borderColor: HAIRLINE }}
            placeholder="The project, a link, a deadline…"
          />
        </div>

        {error && (
          <p role="alert" className="text-meta mt-8" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        <div className="flex justify-end mt-12">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto sm:min-w-[240px] flex justify-between gap-8 bg-ink px-[18px] py-4 coord disabled:opacity-40 ${FOCUS}`}
            style={{ color: "var(--color-paper)", letterSpacing: "0.16em" }}
          >
            <span>{submitting ? "Booking…" : "Confirm the call"}</span>
            <span aria-hidden style={{ color: OCRE_ON_NEGRO }}>→</span>
          </button>
        </div>
      </form>
    );
  }

  // Steps 1 and 2: the month, then the day's times.
  const cells = monthCells(view.y, view.m);
  const monthKey = `${view.y}-${String(view.m + 1).padStart(2, "0")}`;
  const shift = (n: number) => {
    const d = new Date(Date.UTC(view.y, view.m + n, 1));
    setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const daySlots = day ? byDay.get(day) ?? [] : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-10">
      <div>
        <div className="flex items-baseline justify-between mb-5">
          <p className="text-volume text-[28px] leading-none">
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
              new Date(Date.UTC(view.y, view.m, 1))
            )}
          </p>
          <div className="flex gap-4 text-[20px]">
            {[
              { n: -1, label: "Previous month", glyph: "←", off: !months.first || monthKey <= months.first },
              { n: 1, label: "Next month", glyph: "→", off: !months.last || monthKey >= months.last },
            ].map((b) => (
              <button
                key={b.n}
                type="button"
                onClick={() => shift(b.n)}
                disabled={b.off}
                aria-label={b.label}
                // tablet: (iPad tier) the 15x32 glyph gets a 44px finger
                // target; the padding is cancelled by the margin, so the
                // arrows do not move. A mouse never matches the variant.
                className={`text-ink tablet:p-3 tablet:-m-3 ${MOTION} ${FOCUS}`}
                style={b.off ? { color: DISABLED } : undefined}
              >
                {b.glyph}
              </button>
            ))}
          </div>
        </div>

        {/* A ruled table: the 1px gap lets the hairline ground show through. */}
        <div
          className="grid grid-cols-7 gap-px border"
          style={{ background: HAIRLINE, borderColor: HAIRLINE }}
          role="grid"
          aria-label="Pick a day"
        >
          {WEEKDAYS.map((w) => (
            <span key={w} className="bg-paper px-2 py-2.5 coord" style={{ fontSize: 10, color: "var(--color-muted)" }}>
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <span key={`pad-${i}`} className="bg-paper" />;
            const k = keyOf(view.y, view.m, d);
            const open = byDay.has(k);
            const selected = k === day;
            return (
              <button
                key={k}
                type="button"
                disabled={!open}
                onClick={() => {
                  setDay(k);
                  setPick(null);
                }}
                aria-pressed={selected}
                aria-label={`${d}${open ? ", times available" : ""}`}
                className={`h-16 p-2 flex flex-col justify-between items-start text-left text-[18px] tabular-nums ${MOTION} ${FOCUS} ${
                  selected ? "bg-ink text-paper" : open ? "bg-paper text-ink hover:bg-gris" : "bg-paper"
                }`}
                style={!open ? { color: DISABLED } : undefined}
              >
                <span>{d}</span>
                {open && <span aria-hidden className="block w-3.5 h-0.5 bg-warm" />}
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-muted mt-3.5">
          {data.slotMinutes} minutes on video. Times in Eastern Time ({zoneLabel}).
        </p>
      </div>

      <div className="flex flex-col" aria-live="polite">
        <p className="coord mb-3.5">
          {day && daySlots[0]
            ? new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", day: "numeric", month: "short" }).format(
                new Date(daySlots[0])
              )
            : "Open times"}
        </p>
        <div className="border-t-2 border-ink flex-1">
          {day ? (
            <ul className="max-h-[22rem] overflow-y-auto" data-lenis-prevent>
              {daySlots.map((s) => {
                const chosen = s === pick;
                return (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setPick(s)}
                      aria-pressed={chosen}
                      className={`w-full flex justify-between px-3 py-3.5 border-b text-[16px] text-left tabular-nums ${MOTION} ${FOCUS} ${
                        chosen ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-gris"
                      }`}
                      style={{ borderColor: HAIRLINE }}
                    >
                      <span>{timeLabel(s)}</span>
                      <span aria-hidden>{chosen ? "✓" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-[15px] leading-[1.5] text-muted">
              {byDay.size ? "Pick a day to see the open times." : "No open times in the next weeks. Write to us instead."}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!pick}
          onClick={() => pick && setSlot(pick)}
          className={`mt-5 flex justify-between bg-ink px-[18px] py-4 coord disabled:opacity-40 ${FOCUS}`}
          style={{ color: "var(--color-paper)", letterSpacing: "0.16em" }}
        >
          <span>Confirm</span>
          <span aria-hidden style={{ color: OCRE_ON_NEGRO }}>→</span>
        </button>
      </div>
    </div>
  );
}
