"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import JournalPicture from "@/components/journal/JournalPicture";
import type { CaseEditorialImage } from "@/lib/case-drafts";

// Lightbox for the editorial case template. Every image on the page is a
// figure in one ordered gallery; clicking opens it over the negro ground at
// its natural ratio, capped to the viewport (re-scaled, never cropped),
// with the 3840 master available for the browser to pick. Arrows and keys
// step through the page order; Esc or a click closes. No numbers, no
// captions: the images stay clean here too.

const Ctx = createContext<(index: number) => void>(() => {});

export function CaseEditorialGallery({
  images,
  children,
}: {
  images: CaseEditorialImage[];
  children: ReactNode;
}) {
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

  const active = open !== null ? images[open] : null;

  return (
    <Ctx.Provider value={setOpen}>
      {children}
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
          {images.length > 1 && (
            <>
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
            </>
          )}
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
    </Ctx.Provider>
  );
}

/** One page image: renders the picture as a zoom button into the gallery. */
export function CaseEditorialFigure({
  img,
  index,
  sizes,
  priority = false,
}: {
  img: CaseEditorialImage;
  index: number;
  sizes: string;
  priority?: boolean;
}) {
  const open = useContext(Ctx);
  return (
    <button
      type="button"
      onClick={() => open(index)}
      aria-label={`View full size: ${img.alt}`}
      style={{ display: "block", width: "100%", padding: 0, border: 0, background: "none", cursor: "zoom-in" }}
    >
      <JournalPicture image={img.image} alt={img.alt} sizes={sizes} priority={priority} />
    </button>
  );
}
