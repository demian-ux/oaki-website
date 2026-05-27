"use client";

import { useRef, useState } from "react";
import SectionLabel from "@/components/global/SectionLabel";

interface DurationSliderProps {
  startWeeks: number;
  endWeeks: number;
  onChange: (v: { startWeeks: number; endWeeks: number }) => void;
  minWeeks?: number;
  maxWeeks?: number;
  weeksPerStep?: number;
}

type Drag = "start" | "end" | "range" | null;

export default function DurationSlider({
  startWeeks,
  endWeeks,
  onChange,
  minWeeks = 2,
  maxWeeks = 52,
  weeksPerStep = 1,
}: DurationSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag>(null);
  const liveRef = useRef({ start: startWeeks, end: endWeeks });
  liveRef.current = { start: startWeeks, end: endWeeks };

  const todayRef = useRef(new Date());
  const dateAt = (w: number) => {
    const d = new Date(todayRef.current);
    d.setDate(d.getDate() + Math.round(w * 7));
    return d;
  };
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtMonth = (d: Date) => d.toLocaleDateString("en-US", { month: "short" });

  const clampStep = (w: number) => {
    const v = Math.round(w / weeksPerStep) * weeksPerStep;
    return Math.max(0, Math.min(maxWeeks, v));
  };

  const weeksFromClientX = (x: number) => {
    if (!trackRef.current) return 0;
    const r = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (x - r.left) / r.width));
    return clampStep(pct * maxWeeks);
  };

  const beginDrag = (mode: Drag) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(mode);
    const startClientX = e.clientX;
    const snapshot = { ...liveRef.current };

    const move = (ev: PointerEvent) => {
      const { start, end } = liveRef.current;
      if (mode === "start") {
        const w = weeksFromClientX(ev.clientX);
        const next = Math.min(end - minWeeks, w);
        if (next !== start) onChange({ startWeeks: Math.max(0, next), endWeeks: end });
      } else if (mode === "end") {
        const w = weeksFromClientX(ev.clientX);
        const next = Math.max(start + minWeeks, w);
        if (next !== end) onChange({ startWeeks: start, endWeeks: Math.min(maxWeeks, next) });
      } else if (mode === "range" && trackRef.current) {
        const r = trackRef.current.getBoundingClientRect();
        const deltaW = clampStep(((ev.clientX - startClientX) / r.width) * maxWeeks);
        const dur = snapshot.end - snapshot.start;
        let ns = snapshot.start + deltaW;
        let ne = snapshot.end + deltaW;
        if (ns < 0) { ns = 0; ne = dur; }
        if (ne > maxWeeks) { ne = maxWeeks; ns = maxWeeks - dur; }
        if (ns !== snapshot.start || ne !== snapshot.end) {
          onChange({ startWeeks: ns, endWeeks: ne });
        }
      }
    };
    const up = () => {
      setDrag(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if (drag) return;
    const target = e.target as HTMLElement;
    if (target.closest(".ds-handle, .ds-range")) return;
    const w = weeksFromClientX(e.clientX);
    const distStart = Math.abs(w - startWeeks);
    const distEnd = Math.abs(w - endWeeks);
    if (distStart <= distEnd) {
      onChange({ startWeeks: Math.min(w, endWeeks - minWeeks), endWeeks });
    } else {
      onChange({ startWeeks, endWeeks: Math.max(w, startWeeks + minWeeks) });
    }
  };

  const onKey = (mode: "start" | "end") => (e: React.KeyboardEvent) => {
    const k = e.key;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(k)) return;
    e.preventDefault();
    const big = e.shiftKey ? 4 : 1;
    if (mode === "start") {
      let w = startWeeks;
      if (k === "ArrowLeft") w -= big;
      if (k === "ArrowRight") w += big;
      if (k === "Home") w = 0;
      if (k === "End") w = endWeeks - minWeeks;
      onChange({
        startWeeks: Math.max(0, Math.min(endWeeks - minWeeks, w)),
        endWeeks,
      });
    } else {
      let w = endWeeks;
      if (k === "ArrowLeft") w -= big;
      if (k === "ArrowRight") w += big;
      if (k === "Home") w = startWeeks + minWeeks;
      if (k === "End") w = maxWeeks;
      onChange({
        startWeeks,
        endWeeks: Math.max(startWeeks + minWeeks, Math.min(maxWeeks, w)),
      });
    }
  };

  const startPct = (startWeeks / maxWeeks) * 100;
  const endPct = (endWeeks / maxWeeks) * 100;
  const midPct = (startPct + endPct) / 2;
  const duration = endWeeks - startWeeks;
  const startDate = dateAt(startWeeks);
  const endDate = dateAt(endWeeks);

  const ticks: { w: number; label: string }[] = [];
  for (let w = 0; w <= maxWeeks; w += 4) {
    ticks.push({ w, label: fmtMonth(dateAt(w)) });
  }

  return (
    <div className="duration-slider" data-drag={drag || ""}>
      <div className="ds-header">
        <SectionLabel as="span">Project timeline</SectionLabel>
        <span className="text-meta text-muted ds-helper">
          Drag the edges. Drag the bar to shift it.
        </span>
      </div>

      <div className="ds-floating" style={{ left: `${midPct}%` }}>
        <span className="ds-weeks">{duration}</span>
        <span className="ds-weeks-label text-label">
          {duration === 1 ? "week" : "weeks"} of work
        </span>
      </div>

      <div ref={trackRef} className="ds-track" onPointerDown={onTrackPointerDown}>
        <div className="ds-rail" />
        <div className="ds-ticks">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="ds-tick"
              style={{ left: `${(t.w / maxWeeks) * 100}%` }}
            />
          ))}
        </div>

        <div
          className="ds-range"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
          onPointerDown={beginDrag("range")}
          role="slider"
          aria-label="Project timeline window"
          aria-valuetext={`${duration} weeks, from ${fmtDate(startDate)} to ${fmtDate(endDate)}`}
        />

        <button
          type="button"
          className="ds-handle ds-handle-start"
          style={{ left: `${startPct}%` }}
          onPointerDown={beginDrag("start")}
          onKeyDown={onKey("start")}
          aria-label="Project start"
          aria-valuemin={0}
          aria-valuemax={endWeeks - minWeeks}
          aria-valuenow={startWeeks}
          aria-valuetext={`Starts ${fmtDate(startDate)}`}
          tabIndex={0}
        />
        <button
          type="button"
          className="ds-handle ds-handle-end"
          style={{ left: `${endPct}%` }}
          onPointerDown={beginDrag("end")}
          onKeyDown={onKey("end")}
          aria-label="Project delivery"
          aria-valuemin={startWeeks + minWeeks}
          aria-valuemax={maxWeeks}
          aria-valuenow={endWeeks}
          aria-valuetext={`Delivers ${fmtDate(endDate)}`}
          tabIndex={0}
        />
      </div>

      <div className="ds-tick-labels">
        {ticks
          .filter((_, i) => i % 2 === 0)
          .map((t, i) => (
            <span
              key={i}
              className="text-meta text-muted"
              style={{ left: `${(t.w / maxWeeks) * 100}%` }}
            >
              {t.label}
            </span>
          ))}
      </div>

      <div className="ds-readouts">
        <div className="ds-readout">
          <span className="text-label text-muted">Start</span>
          <span className="ds-readout-value">{fmtDate(startDate)}</span>
        </div>
        <div className="ds-readout ds-readout-end">
          <span className="text-label text-muted">Deliver by</span>
          <span className="ds-readout-value">{fmtDate(endDate)}</span>
        </div>
      </div>
    </div>
  );
}
