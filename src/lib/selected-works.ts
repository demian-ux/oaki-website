// Selected work: the private sample set shown to prospects (BDNY 2026 and
// one-to-one), served under /selected-works. Same editorial case template
// and the same chrome as the public site, its own curated index and its
// own next-project chain. This module is pure data (the header imports it
// on the client); the shelf helpers that read the image manifests live in
// selected-works-shelf.ts. Goldman and Pavilion Grove are cleared for
// private viewing only, so they are hidden from every public surface
// (src/lib/hidden-projects.ts) and reachable here alone.

export const SELECTED_BASE = "/selected-works";
export const SELECTED_CONTACT = `${SELECTED_BASE}/contact`;

/** Two sentences for someone who has already talked with Demi. */
export const SELECTED_INTRO =
  "Three projects, chosen after our conversation. Stills and film, built to outlast the meeting they were made for.";

export interface SelectedWork {
  slug: string;
  title: string;
  /** Short title for the nav. */
  short: string;
  /** The coord line on the index card ("For Koda", "New York"). */
  coord: string;
  client: string;
  year: string;
  collection: string;
  /** One sentence under the title on the index. */
  blurb: string;
  /** Image-library project and master for the index cover. */
  cover: { project: string; name: string };
}

export const selectedWorks: SelectedWork[] = [
  {
    slug: "the-point",
    title: "The Point",
    short: "The Point",
    coord: "Sochi",
    client: "Gregory Tuck Architecture",
    year: "2024",
    collection: "The Residential Collection",
    blurb: "A complete interior program, another designer's intent kept exact across every image.",
    cover: { project: "the-point", name: "01-colonnade-pool" },
  },
  {
    slug: "pavilion-grove",
    title: "Pavilion Grove",
    short: "Pavilion Grove",
    coord: "For Koda",
    client: "Koda",
    year: "2026",
    collection: "The Residential Collection",
    blurb: "Six images in ten days, then an eighty-second film built from the same frames.",
    cover: { project: "pavilion-grove", name: "view-13-padel-drone" },
  },
  {
    slug: "goldman",
    title: "Goldman",
    short: "Goldman",
    coord: "New York",
    client: "Undisclosed",
    year: "2025",
    collection: "The Workplace Collection",
    blurb: "Work at institutional name scale, chosen by a practice with visualization in-house.",
    cover: { project: "goldman", name: "view-01-gateway" },
  },
];

export const selectedWorkSlugs = selectedWorks.map((w) => w.slug);

export function getSelectedWork(slug: string): SelectedWork | undefined {
  return selectedWorks.find((w) => w.slug === slug);
}

/** The chain: each case hands over to the next, the last back to the first. */
export function getNextSelectedWork(slug: string): { slug: string; title: string } | null {
  const i = selectedWorks.findIndex((w) => w.slug === slug);
  if (i < 0) return null;
  const n = selectedWorks[(i + 1) % selectedWorks.length];
  return { slug: n.slug, title: n.title };
}
