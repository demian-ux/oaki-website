"use client";

import { useInView } from "./useInView";

/**
 * The stripe rule (§02) with the §07 "wipe" gesture: it draws in
 * left-to-right the first time it enters the viewport.
 *
 * The observer watches an UN-clipped wrapper (the inner stripe's clip-path
 * would otherwise report zero intersection); the inner stripe holds
 * `.pre-wipe` until then. Reduced-motion shows it full immediately.
 */
export default function StripeRule({ className = "" }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div className={`stripe-rule ${inView ? "anim-wipe" : "pre-wipe"}`} />
    </div>
  );
}
