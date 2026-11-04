import { getProjectImages } from "./journal-images";
import type { HomeProject } from "./home-projects";
import { SELECTED_BASE, worksInSet, type SelectedSet } from "./selected-works";

// Server-side helpers for the selected-work landing: they read the image
// library manifests (node:fs), so they stay out of selected-works.ts,
// which client components import.

/** Largest-first webp source for a library master, for plain <img> covers. */
export function coverSrc(project: string, name: string, maxWidth = 1920): string | null {
  const image = getProjectImages(project).find((i) => i.name === name && i.set === null);
  if (!image) return null;
  const fit = image.webp.filter((w) => w.width <= maxWidth).sort((a, b) => b.width - a.width)[0];
  return (fit ?? image.webp[image.webp.length - 1])?.src ?? null;
}

/** Every webp derivative up to maxWidth as a srcset, so a phone fetches the
 *  960 instead of the 1920 master for a 340px-wide cover. */
export function coverSrcSet(project: string, name: string, maxWidth = 1920): string | undefined {
  const image = getProjectImages(project).find((i) => i.name === name && i.set === null);
  const fits = image?.webp.filter((w) => w.width <= maxWidth) ?? [];
  if (fits.length < 2) return undefined;
  return fits.map((w) => `${w.src} ${w.width}w`).join(", ");
}

/** One card per project for the hero: the index cover, the project's own
 *  collection line, title and client · year, exactly as the public shelf
 *  captions them. Stills only (Demi 2026-11-04: The Point no longer
 *  carries its loop here; its card is the index cover). */
export function getSelectedShelf(set: SelectedSet): HomeProject[] {
  return worksInSet(set).flatMap((work, i) => {
    const img = coverSrc(work.cover.project, work.cover.name, 1920);
    if (!img) return [];
    return [
      {
        n: String(i + 1).padStart(2, "0"),
        collection: work.collection,
        title: work.title,
        client: work.client,
        year: work.year,
        img,
        srcSet: coverSrcSet(work.cover.project, work.cover.name, 1920),
        description: work.blurb,
        href: `${SELECTED_BASE}/${work.slug}`,
      },
    ];
  });
}
