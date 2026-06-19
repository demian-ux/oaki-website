"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Drives the §07 "rise" on every element tagged `.reveal`: each rises + fades
 * in the first time it enters the viewport. One observer for the whole page,
 * re-scanned on navigation. Reduced-motion reveals everything immediately, and
 * a safety timer guarantees nothing stays hidden.
 */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-in)")
    );
    if (els.length === 0) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
