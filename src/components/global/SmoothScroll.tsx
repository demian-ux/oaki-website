"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Module-level handle so motion components can read the live Lenis instance
// (e.g. velocity) without prop-drilling. null when reduced-motion is on.
let lenisInstance: Lenis | null = null;
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Global smooth-scroll engine. Wires Lenis to the GSAP ticker so Lenis and
 * ScrollTrigger stay in sync (the brief's "one smooth-scroll engine" rule —
 * never run ScrollSmoother alongside this). Renders nothing.
 *
 * Disabled entirely under prefers-reduced-motion: the page falls back to
 * native scroll and GSAP scroll-triggers still resolve against it.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // lerp 0.1 is Lenis's own default: present, not floaty.
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000); // ticker time is seconds
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
