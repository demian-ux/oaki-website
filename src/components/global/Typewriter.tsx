"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  charDelay?: number;
  startDelay?: number;
  waitForLoad?: boolean;
  onDone?: () => void;
}

declare global {
  interface Window {
    __oakiReady?: boolean;
  }
}

export default function Typewriter({
  text,
  charDelay = 28,
  startDelay = 0,
  waitForLoad = true,
  onDone,
}: TypewriterProps) {
  const [n, setN] = useState(0);
  const [armed, setArmed] = useState(!waitForLoad);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!waitForLoad) return;
    if (typeof window !== "undefined" && window.__oakiReady) {
      setArmed(true);
      return;
    }
    const onReady = () => setArmed(true);
    window.addEventListener("oaki:loaded", onReady);
    return () => window.removeEventListener("oaki:loaded", onReady);
  }, [waitForLoad]);

  useEffect(() => {
    if (!armed) return;
    setN(0);
    setDone(false);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const begin = setTimeout(function tick() {
      if (cancelled) return;
      setN((p) => {
        const next = p + 1;
        if (next >= text.length) {
          setDone(true);
          if (onDone) onDone();
          return text.length;
        }
        timer = setTimeout(tick, charDelay);
        return next;
      });
    }, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(begin);
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, text]);

  return (
    <>
      {text.slice(0, n)}
      <span className={`tw-caret ${done ? "done" : ""}`} aria-hidden="true" />
    </>
  );
}
