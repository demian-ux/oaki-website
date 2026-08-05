import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Reader for the site-wide image library manifests
// (public/images/<project-slug>/web/manifest.json, written by
// scripts/optimize-images.mjs). Server-side only.
//
// The library is organized BY PROJECT; journal articles map to their
// project's folder below. Case studies and the homepage read the same
// manifests directly by project slug.

export interface JournalImageSource {
  width: number;
  height: number;
  src: string;
}

export interface JournalImage {
  name: string;
  /** Set subfolder inside original/ (e.g. "stills", "film"), null if flat. */
  set: string | null;
  naturalWidth: number;
  naturalHeight: number;
  widths: number[];
  avif: JournalImageSource[];
  webp: JournalImageSource[];
}

export interface JournalLocalImages {
  hero: JournalImage | null;
  /** Up to 3 support images, per the journal format. */
  supports: JournalImage[];
}

/** Journal article slug → image-library project slug. */
export const articleImageProject: Record<string, string> = {
  "oak-house-aia-florida-2026": "oak-house",
  "prismatic-parasol-architizer": "prismatic-parasol",
  "cdg34-juvignac-competition-win": "cdg34-juvignac",
  "miac-aia-miami-2023": "miac",
  "sf-housing-aiasf-merit": "sf-housing-schemes",
  "maison-rive-gauche-sale": "maison-rive-gauche",
  "94-s-hibiscus-sale": "94-s-hibiscus",
  "icnyc-campaign": "icnyc",
  "level-shoes-bal-harbour": "level-shoes",
  "moncayo-puerto-rico": "moncayo",
  "bay-house-geiger-site": "bay-house",
  "8-rockledge-gardens": "8-rockledge",
  "dixon-house-gardens": "dixon-house",
  "icrave-sapphire-lounges": "icrave-sapphire",
  "icrave-ballys-chicago": "icrave-ballys-chicago",
  "icrave-southwest-lounges": "icrave-southwest",
};

/**
 * Editorial hero/support picks per article, by master filename (manifest
 * `name`, no extension). Chosen 2026-08-05 against the draft heroNotes;
 * picks marked ambiguous in the execute report await Demi's confirmation.
 * Articles absent here fall back to hero* / first-alphabetical.
 */
export const articleImagePicks: Record<
  string,
  { hero: string; supports?: string[] }
> = {
  "oak-house-aia-florida-2026": { hero: "View 01_Facade_a05", supports: ["View 02_Interior_a05", "View 05_a01"] },
  "cdg34-juvignac-competition-win": { hero: "View 01_A", supports: ["View 02_A", "View 03_A"] },
  "miac-aia-miami-2023": { hero: "View 03_a03", supports: ["View 01_a04", "Close up detail mtl"] },
  "icnyc-campaign": { hero: "View 02", supports: ["View 03", "View 08_Cafe", "View 10 - Update"] },
  "level-shoes-bal-harbour": { hero: "View 04_Mens Area", supports: ["View 01", "View 08_Whitespace"] },
  "moncayo-puerto-rico": { hero: "View 01_Rear Facade_Final", supports: ["View 11_a02", "View 19_a03"] },
  "bay-house-geiger-site": { hero: "View 01_a05", supports: ["View 03_a05"] },
  "8-rockledge-gardens": { hero: "View 02", supports: ["View 01"] },
  "icrave-sapphire-lounges": { hero: "View 02_Lounge", supports: ["View 03_Bar", "View 04_La ventanita"] },
  "icrave-ballys-chicago": { hero: "View 01 -", supports: ["View 04"] },
  "icrave-southwest-lounges": { hero: "View 01_Dining", supports: ["View 05_DenArea"] },
};

export function getProjectImages(projectSlug: string): JournalImage[] {
  const manifestPath = resolve(
    process.cwd(),
    "public",
    "images",
    projectSlug,
    "web",
    "manifest.json"
  );
  if (!existsSync(manifestPath)) return [];
  try {
    const { images } = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
      images: JournalImage[];
    };
    return images ?? [];
  } catch {
    return [];
  }
}

/** Hero + supports for a journal article, resolved through the project map. */
export function getJournalLocalImages(articleSlug: string): JournalLocalImages {
  const project = articleImageProject[articleSlug];
  if (!project) return { hero: null, supports: [] };
  const images = getProjectImages(project);
  if (images.length === 0) return { hero: null, supports: [] };
  // Explicit editorial pick first; else a master named hero*; else the
  // first (alphabetical).
  const pick = articleImagePicks[articleSlug];
  const byName = (n: string) => images.find((i) => i.name === n);
  const hero =
    (pick && byName(pick.hero)) ??
    images.find((i) => i.name.toLowerCase().startsWith("hero")) ??
    images[0];
  const supports = pick?.supports
    ? (pick.supports.map(byName).filter(Boolean) as JournalImage[]).slice(0, 3)
    : images.filter((i) => i !== hero).slice(0, 3);
  return { hero, supports };
}
