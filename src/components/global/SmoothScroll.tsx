"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // A reload should start at the top with the hero opening playing, not drop
  // you back where you left off mid-page. Next's App Router never touches
  // history.scrollRestoration, so opting out of the browser's restore is not
  // fighting it; Link-driven navigation keeps its own scroll handling. This
  // effect is declared first so the reset lands before Lenis reads the
  // starting scroll position below.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    // covers the case where the browser already restored before hydration
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Next resets window scroll on navigation, but Lenis keeps its internal
  // scroll state and would write the old position back on the next frame.
  // Reset it in the same moment. Keyed on pathname only, so same-page
  // anchor jumps are left alone.
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // lerp 0.1 is Lenis's own default: present, not floaty. wheelMultiplier
    // 0.8 caps how fast a flick can cross the page — past that speed the GPU
    // can't rasterize tiles fast enough and frames drop, so the ceiling also
    // sets the site's reading pace.
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.8 });
    lenisInstance = lenis;
    // Perf debugging hook: ?debugscroll exposes the instance so frame-time
    // measurements can drive a scripted scroll. No effect otherwise.
    if (window.location.search.includes("debugscroll")) {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

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
