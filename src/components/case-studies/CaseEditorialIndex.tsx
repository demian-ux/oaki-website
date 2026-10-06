"use client";

import { useCallback, useEffect, useState } from "react";
import JournalPicture from "@/components/journal/JournalPicture";
import type { CaseEditorialImage } from "@/lib/case-drafts";
import s from "./CaseEditorialIndex.module.css";

// The Index block of the editorial template (v3): a band on the warm grey
// with "Index" centered, then thumbnails all at one height, each as wide
// as its ratio asks, wrapping and centered, numbered underneath. A click
// opens the full image over the negro ground, natural ratio capped to the
// viewport, with arrows, keys, a "03 / 13" counter and close on Esc or a
// click outside. The index set is separate from the body images.

export default function CaseEditorialIndex({ images }: { images: CaseEditorialImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (d: number) =>
      setOpen((cur) => (cur === null ? cur : (cur + d + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  if (images.length === 0) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const active = open !== null ? images[open] : null;

  return (
    <section className={`page-x ${s.band}`}>
      <h2 className={`font-serif ${s.heading}`}>Index</h2>
      <div className={s.grid}>
        {images.map((img, i) => (
          <button
            key={`${img.image.set ?? ""}/${img.image.name}`}
            type="button"
            className={s.thumb}
            style={{ aspectRatio: String(img.ratio) }}
            onClick={() => setOpen(i)}
            aria-label={`View ${img.alt} full size`}
          >
            <JournalPicture image={img.image} alt={img.alt} sizes="(min-width: 1024px) 240px, 30vw" />
            <span className={s.num}>{pad(i + 1)}</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="case-index-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={() => setOpen(null)}
        >
          <JournalPicture
            image={active.image}
            alt={active.alt}
            sizes="100vw"
            priority
            className="case-index-lightbox-img"
          />
          <span className={`coord ${s.counter}`}>
            {pad((open as number) + 1)} / {pad(images.length)}
          </span>
          <button
            type="button"
            className="case-index-lightbox-nav case-index-lightbox-prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="case-index-lightbox-nav case-index-lightbox-next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            →
          </button>
          <button
            type="button"
            className="case-index-lightbox-nav case-index-lightbox-close"
            aria-label="Close"
            onClick={() => setOpen(null)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
