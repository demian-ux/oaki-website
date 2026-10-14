"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/global/Button";
import { bookingRequestSchema } from "@/lib/booking";

// Three quiet steps on one surface: a day, a time, then who you are. The
// month grid only lights the days that have an open slot; every time is
// shown in the visitor's own zone (slots arrive as UTC from the API).

type Availability = { mode: "live" | "mock"; slotMinutes: number; slots: string[] };
type Booked = { start: string; meetLink: string | null; email: string };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inputBase =
  "w-full border-b bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 placeholder:text-muted";

/** YYYY-MM-DD of an instant in a zone (en-CA formats that way). */
function dayKey(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" }).format(new Date(iso));
}

/** Monday-first grid cells for a month: null pads, then 1..n. */
function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const pad = (first + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(pad).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)] as (
    | number
    | null
  )[];
}

const keyOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function BookingPicker() {
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState("");
  const [timeZone, setTimeZone] = useState("UTC");
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<string | null>(null);
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
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setLoadError("");
        setTimeZone(tz);
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
  const zoneLabel = timeZone.replace(/_/g, " ").split("/").pop();

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
        load();
      }
      if (!res.ok) throw new Error(json.error ?? "We could not book that time.");
      setBooked({ start: json.start, meetLink: json.meetLink, email: parsed.data.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not book that time.");
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      // Studio voice, like the page hero: coord eyebrow, the volume
      // headline with its ocre dot, a coord line for the facts, lede body.
      <div className="py-16">
        <p className="coord mb-6">Call booked</p>
        <h2 className="text-statement text-volume mb-6">
          See you {fmt(booked.start, { weekday: "long", month: "long", day: "numeric" })}
          <span className="dot">.</span>
        </h2>
        <p className="coord mb-10">
          {timeLabel(booked.start)} · {data?.slotMinutes ?? 30} min · Video · {zoneLabel} time
        </p>
        <span className="ocre-rule mb-6" aria-hidden />
        <p className="text-lede text-muted max-w-md">
          The invite with the video link is on its way to {booked.email}.
        </p>
        {data?.mode === "mock" && (
          <p className="text-meta text-warm-deep mt-8">
            Preview mode: Google Calendar is not connected, so nothing was booked.
          </p>
        )}
      </div>
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

  // Step 3: the visitor's details for a chosen slot.
  if (slot) {
    return (
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-baseline justify-between gap-6 pb-6 mb-10 border-b border-line">
          <div>
            <p className="text-label text-muted mb-2">
              {data.slotMinutes} minute call · video
            </p>
            <p className="text-body text-ink">{longLabel(slot)}</p>
            <p className="text-meta text-muted mt-1">{zoneLabel} time</p>
          </div>
          <button
            type="button"
            onClick={() => setSlot(null)}
            className="text-meta text-muted hover:text-ink transition-colors duration-200 shrink-0"
          >
            Change time
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {(["name", "email"] as const).map((f) => (
            <div key={f}>
              <label htmlFor={`book-${f}`} className="text-label text-muted block mb-2">
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
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="book-note" className="text-label text-muted block mb-2">
            Anything we should look at before the call?
          </label>
          <textarea
            id="book-note"
            rows={4}
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            className={`${inputBase} resize-none`}
            placeholder="The project, a link, a deadline…"
          />
        </div>

        {error && (
          <p role="alert" className="text-meta mt-8" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}

        <div className="flex items-center justify-end mt-16 pt-8 border-t border-line">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Booking…" : "Confirm the call"}
          </Button>
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
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_11rem] gap-12">
      <div>
        <div className="flex items-baseline justify-between mb-6">
          <p className="text-body text-ink">
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
              new Date(Date.UTC(view.y, view.m, 1))
            )}
          </p>
          <div className="flex gap-5">
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
                className="text-body text-ink disabled:text-line transition-colors duration-200"
              >
                {b.glyph}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 text-center" role="grid" aria-label="Pick a day">
          {WEEKDAYS.map((w) => (
            <span key={w} className="text-label text-muted pb-3">
              {w}
            </span>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <span key={`pad-${i}`} />;
            const k = keyOf(view.y, view.m, d);
            const open = byDay.has(k);
            const selected = k === day;
            return (
              <button
                key={k}
                type="button"
                disabled={!open}
                onClick={() => setDay(k)}
                aria-pressed={selected}
                aria-label={`${d}${open ? ", times available" : ""}`}
                className={`aspect-square flex items-center justify-center text-body tabular-nums transition-colors duration-200 ${
                  selected
                    ? "bg-ink text-paper"
                    : open
                    ? "text-ink hover:bg-gris"
                    : "text-muted opacity-40"
                }`}
              >
                <span className={open && !selected ? "border-b border-warm pb-px" : undefined}>{d}</span>
              </button>
            );
          })}
        </div>
        <p className="text-meta text-muted mt-6">
          {data.slotMinutes} minutes on video. Times in {zoneLabel}.
        </p>
      </div>

      <div aria-live="polite">
        {day ? (
          <>
            <p className="text-label text-muted mb-4">
              {fmt(daySlots[0], { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <ul className="flex flex-col gap-2 max-h-[22rem] overflow-y-auto" data-lenis-prevent>
              {daySlots.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => setSlot(s)}
                    className="w-full py-3 border border-line text-body text-ink tabular-nums hover:border-ink transition-colors duration-200"
                  >
                    {timeLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-meta text-muted sm:pt-12">
            {byDay.size ? "Pick a day to see the open times." : "No open times in the next weeks. Write to us instead."}
          </p>
        )}
      </div>
    </div>
  );
}
