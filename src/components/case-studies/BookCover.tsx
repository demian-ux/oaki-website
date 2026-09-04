import type { ReactNode } from "react";
import { collectionDisplay } from "@/lib/collection-label";

/**
 * The book-cover template (1b — full-bleed render + typographic band).
 * Shared by the case-studies grid and the nav mega menu so every cover
 * reads the same: image on top, ocre seam, then the band — collection in
 * the serif coord voice, the title in the volume voice, client · year and
 * the word mark on the baseline. Scales with font-size on .book-cover
 * (children are sized in em), so contexts only set one size.
 */
export default function BookCover({
  collection,
  title,
  clientYear,
  children,
}: {
  collection?: string | null;
  title: string;
  clientYear?: string | null;
  children: ReactNode;
}) {
  // Collection color code — tints only the image mat (the top box).
  const key = collection
    ?.toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\s+collection$/, "")
    .trim();

  return (
    <div className="book-cover" data-collection={key}>
      <div className="book-cover-image">
        <div className="book-cover-plate">{children}</div>
      </div>
      <div className="book-cover-band">
        {collection && (
          <p className="book-cover-collection">{collectionDisplay(collection)}</p>
        )}
        <h3 className="book-cover-title">{title.toUpperCase()}</h3>
        <div className="book-cover-foot">
          <span className="book-cover-meta">{clientYear}</span>
          <span className="logotipo book-cover-mark" aria-hidden>
            oaki<span className="dot">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
