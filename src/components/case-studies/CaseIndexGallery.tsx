"use client";

import { useCallback, useEffect, useState } from "react";
import type { JournalImage } from "@/lib/journal-images";
import JournalPicture from "@/components/journal/JournalPicture";

// The case index grid with a full-size viewer. Clicking a mat opens the
// image over a negro ground at its natural ratio, capped to the viewport
// (re-scaled, never cropped). Esc or a click closes; arrows/keys navigate.

export default function CaseIndexGallery({ images }: { images: JournalImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (d: number) => {
      setOpen((cur) =>
        cur === null ? cur : (cur + d + images.length) % images.length
      );
    },
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

  const active = open !== null ? images[open] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {images.map((img, i) => (
          <button
            key={`${img.set ?? ""}/${img.name}`}
            type="button"
            className="case-index-mat"
            onClick={() => setOpen(i)}
            aria-label={`View ${img.name} full size`}
          >
            <JournalPicture
              image={img}
              alt={img.name}
              sizes="(min-width: 1024px) 250px, 45vw"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="case-index-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          onClick={() => setOpen(null)}
        >
          <JournalPicture
            image={active}
            alt={active.name}
            sizes="100vw"
            priority
            className="case-index-lightbox-img"
          />
          <span className="tag-negro case-index-lightbox-tag">
            {String((open as number) + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")} · {active.name}
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
    </>
  );
}
