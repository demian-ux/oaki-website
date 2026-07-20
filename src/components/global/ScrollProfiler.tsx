"use client";

import { useEffect } from "react";

interface LoafScript {
  sourceURL?: string;
  functionName?: string;
  invoker?: string;
  duration: number;
}
interface LoafEntry extends PerformanceEntry {
  blockingDuration?: number;
  scripts?: LoafScript[];
}

/**
 * Perf debugging only, dormant without the ?debugscroll flag. Records every
 * long animation frame (anything that blocks rendering) with the script
 * attribution the browser provides, into window.__loafLog, so a real user
 * scroll on a real machine can tell us exactly which code caused which
 * stutter. Renders nothing, costs nothing when idle.
 */
export default function ScrollProfiler() {
  useEffect(() => {
    if (!window.location.search.includes("debugscroll")) return;
    type LogRow = {
      t: number;
      dur: number;
      block: number;
      scrollY: number;
      scripts: { src: string; fn: string; invoker: string; dur: number }[];
    };
    const log: LogRow[] = [];
    (window as unknown as { __loafLog?: LogRow[] }).__loafLog = log;
    let po: PerformanceObserver | null = null;
    try {
      po = new PerformanceObserver((list) => {
        for (const e of list.getEntries() as LoafEntry[]) {
          log.push({
            t: Math.round(e.startTime),
            dur: Math.round(e.duration),
            block: Math.round(e.blockingDuration ?? 0),
            scrollY: Math.round(window.scrollY),
            scripts: (e.scripts ?? []).slice(0, 4).map((s) => ({
              src: (s.sourceURL ?? "").split("/").pop() ?? "",
              fn: s.functionName ?? "",
              invoker: s.invoker ?? "",
              dur: Math.round(s.duration),
            })),
          });
          if (log.length > 300) log.shift();
        }
      });
      po.observe({ type: "long-animation-frame", buffered: true });
    } catch {
      /* older browsers: no LoAF support, the log just stays empty */
    }
    return () => po?.disconnect();
  }, []);

  return null;
}
