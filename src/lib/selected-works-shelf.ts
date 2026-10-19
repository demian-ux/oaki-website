import { getProjectImages } from "./journal-images";
import type { HomeProject } from "./home-projects";
import { SELECTED_BASE, selectedWorks } from "./selected-works";

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

/** One card per project for the hero: the index cover, the project's own
 *  collection line, title and client · year, exactly as the public shelf
 *  captions them. The Point carries its loop, as on the homepage. */
export function getSelectedShelf(): HomeProject[] {
  return selectedWorks.flatMap((work, i) => {
    const video = work.slug === "the-point";
    const img = video
      ? "/video/the-point/hero-tall-poster.webp"
      : coverSrc(work.cover.project, work.cover.name, 1920);
    if (!img) return [];
    return [
      {
        n: String(i + 1).padStart(2, "0"),
        collection: work.collection,
        title: work.title,
        client: work.client,
        year: work.year,
        img,
        description: work.blurb,
        href: `${SELECTED_BASE}/${work.slug}`,
        ...(video
          ? { video: { mp4: "/video/the-point/hero-tall.mp4", webm: "/video/the-point/hero-tall.webm" } }
          : {}),
      },
    ];
  });
}
