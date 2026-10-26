"use client";

import { useEffect, useRef } from "react";

// The cover summary is ONE line on desktop (01-plantilla-v4.md). Rather than
// trusting a vw size tuned to one sentence, the line measures itself and
// steps its size down (never under 15px) until it fits the column; on phones
// it simply wraps.

const DESKTOP = 821;
const MIN = 12;

export default function CaseMagazineSummary({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = "";
      el.style.whiteSpace = "";
      if (window.innerWidth < DESKTOP) return;
      let size = parseFloat(getComputedStyle(el).fontSize);
      let guard = 0;
      while (el.scrollWidth > el.clientWidth && size > MIN && guard++ < 60) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
      // A sentence that cannot fit even at the floor wraps rather than
      // running off the page (the longest editorial subtitles, narrow desktops).
      if (el.scrollWidth > el.clientWidth) el.style.whiteSpace = "normal";
    };
    fit();
    const onFonts = () => fit();
    document.fonts?.ready.then(onFonts);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {text}
    </p>
  );
}
