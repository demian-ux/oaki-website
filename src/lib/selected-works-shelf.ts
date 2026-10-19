import { getProjectImages } from "./journal-images";
import type { HomeProject } from "./home-projects";
import { SELECTED_BASE, getSelectedWork } from "./selected-works";

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

/** Seven books for the hero shelf: the three projects seen through several
 *  of their frames, so the shelf reads full and the drift never shows the
 *  same cover twice in one viewport. The caption's first line names the
 *  frame; title and client · year name the project. Index 3 is the one the
 *  ticker lands on. */
const shelfBooks: { work: string; name: string; caption: string; video?: boolean }[] = [
  { work: "pavilion-grove", name: "view-09-water-path", caption: "The path in, over the water" },
  { work: "goldman", name: "view-14-the-mixer-night", caption: "The Mixer, night" },
  { work: "the-point", name: "05-bar", caption: "The bar, evening" },
  { work: "pavilion-grove", name: "view-13-padel-drone", caption: "The court under the canopy" },
  { work: "goldman", name: "view-01-gateway", caption: "The Gateway, street approach" },
  { work: "the-point", name: "01-colonnade-pool", caption: "The colonnade pool", video: true },
  { work: "pavilion-grove", name: "view-24-bedroom", caption: "The bedroom, open to the court" },
];

export function getSelectedShelf(): HomeProject[] {
  return shelfBooks.flatMap((b, i) => {
    const work = getSelectedWork(b.work);
    if (!work) return [];
    const img = b.video
      ? "/video/the-point/hero-tall-poster.webp"
      : coverSrc(work.cover.project, b.name, 960);
    if (!img) return [];
    return [
      {
        n: String(i + 1).padStart(2, "0"),
        collection: b.caption,
        title: work.title,
        client: work.client,
        year: work.year,
        img,
        description: b.caption,
        href: `${SELECTED_BASE}/${work.slug}`,
        ...(b.video
          ? { video: { mp4: "/video/the-point/hero-tall.mp4", webm: "/video/the-point/hero-tall.webm" } }
          : {}),
      },
    ];
  });
}
