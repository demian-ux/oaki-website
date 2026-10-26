"use client";

import { useEffect, useState } from "react";

/**
 * True when the primary input is a finger (iPad, phone), false for a mouse
 * or trackpad. Starts false so the server and the first client render agree
 * (the desktop code path), then updates after mount and on changes (an iPad
 * with a Magic Keyboard still reports coarse: the primary input stays touch).
 * This is the JS half of the iPad tier (IPAD_AUDIT_2026-10.md): behaviour
 * forks on this flag, never on the viewport width, so desktop is untouched.
 */
export default function useCoarsePointer(tabletOnly = false): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    // tabletOnly: iPad and up, phones excluded (they keep their own rules)
    const mq = window.matchMedia(
      tabletOnly ? "(pointer: coarse) and (min-width: 768px)" : "(pointer: coarse)"
    );
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [tabletOnly]);
  return coarse;
}
