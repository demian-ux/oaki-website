"use client";

import { useEffect } from "react";

/**
 * Warms below-the-fold images while the viewer is still on the hero. Lazy
 * images normally fetch + decode when they approach the viewport, which lands
 * that work in the middle of the first scroll and makes it stutter. Instead,
 * once the page has loaded (the hero's own eager images included), every
 * remaining image is fetched and decoded one at a time during idle frames, so
 * scrolling only ever composites already-decoded bitmaps. Renders nothing.
 */
export default function WarmupAssets() {
  useEffect(() => {
    let cancelled = false;

    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => cb(), { timeout: 500 });
      } else {
        window.setTimeout(cb, 100);
      }
    };

    const warm = () => {
      if (cancelled) return;
      const imgs = Array.from(document.images);
      // Promote every pending lazy image at once so all fetches start now,
      // off-screen; the network layer prioritizes on its own.
      for (const img of imgs) {
        if (!img.complete) img.loading = "eager";
      }
      // Decode in small idle-spaced batches. Each decode races a timeout so
      // one hung promise (e.g. a throttled background tab) can't stall the
      // rest of the chain.
      let i = 0;
      const next = () => {
        if (cancelled || i >= imgs.length) return;
        const batch = imgs.slice(i, (i += 4));
        Promise.allSettled(
          batch.map((img) =>
            typeof img.decode === "function"
              ? Promise.race([
                  img.decode().catch(() => {}),
                  new Promise((r) => setTimeout(r, 1500)),
                ])
              : Promise.resolve()
          )
        ).then(() => idle(next));
      };
      next();
    };

    if (document.readyState === "complete") {
      idle(warm);
    } else {
      const onLoad = () => idle(warm);
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
