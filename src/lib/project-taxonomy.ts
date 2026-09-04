import type { Project } from "./types";

// The six public collections. A project can belong to more than one; the
// first entry is its primary collection (the label the card and the case
// study page show).
export const COLLECTIONS = [
  "Competition",
  "Hospitality",
  "Cultural",
  "Landscape",
  "Residential",
  "Workplace",
] as const;
export type Collection = (typeof COLLECTIONS)[number];

const COLLECTIONS_BY_SLUG: Record<string, Collection[]> = {
  "8-rockledge": ["Landscape", "Residential"],
  "803-hunter-rd": ["Residential"],
  "94-s-hibiscus": ["Residential", "Landscape"],
  alderbrook: ["Residential"],
  "bay-house": ["Residential"],
  "cazouls-les-bezier": ["Competition", "Cultural"],
  "cdg34-juvignac": ["Competition", "Workplace"],
  "dillido-residence": ["Residential"],
  "dixon-house": ["Residential", "Landscape"],
  goldman: ["Workplace"],
  icnyc: ["Cultural"],
  "icrave-ballys-chicago": ["Hospitality"],
  "icrave-sapphire": ["Hospitality"],
  "icrave-southwest": ["Hospitality"],
  "k-villa": ["Residential"],
  "level-shoes": ["Hospitality"],
  "manhattan-apartment": ["Residential"],
  miac: ["Cultural", "Competition"],
  moncayo: ["Residential"],
  "ny-penthouse": ["Residential"],
  "oak-house": ["Residential"],
  "prismatic-parasol": ["Competition", "Cultural"],
  "raghsa-tower": ["Competition", "Workplace"],
  "sf-housing-schemes": ["Competition", "Residential"],
  "the-point": ["Hospitality", "Residential"],
  "windsor-residence": ["Residential"],
};

// Location is shown at city level only (no street, island or neighbourhood).
// Miami Beach, its islands and the Grove all read as Miami.
const CITY_BY_SLUG: Record<string, { city: string; country: string }> = {
  "8-rockledge": { city: "Laguna Beach", country: "United States" },
  "803-hunter-rd": { city: "Upstate New York", country: "United States" },
  "94-s-hibiscus": { city: "Miami", country: "United States" },
  "bay-house": { city: "Miami", country: "United States" },
  "cazouls-les-bezier": { city: "Cazouls-lès-Béziers", country: "France" },
  "cdg34-juvignac": { city: "Juvignac", country: "France" },
  "dillido-residence": { city: "Miami", country: "United States" },
  "dixon-house": { city: "Miami", country: "United States" },
  goldman: { city: "New York", country: "United States" },
  icnyc: { city: "New York", country: "United States" },
  "icrave-ballys-chicago": { city: "Chicago", country: "United States" },
  "k-villa": { city: "Dubai", country: "United Arab Emirates" },
  "level-shoes": { city: "Miami", country: "United States" },
  "manhattan-apartment": { city: "New York", country: "United States" },
  miac: { city: "Miami", country: "United States" },
  moncayo: { city: "Fajardo", country: "Puerto Rico" },
  "ny-penthouse": { city: "New York", country: "United States" },
  "oak-house": { city: "Miami", country: "United States" },
  "prismatic-parasol": { city: "Marou Village", country: "Fiji" },
  "raghsa-tower": { city: "Buenos Aires", country: "Argentina" },
  "sf-housing-schemes": { city: "San Francisco", country: "United States" },
  "the-point": { city: "Sochi", country: "Russia" },
  "windsor-residence": { city: "Miami", country: "United States" },
};

function fromLabel(label?: string | null): Collection[] {
  if (!label) return [];
  const hit = COLLECTIONS.find((c) => new RegExp(`\b${c}\b`, "i").test(label));
  return hit ? [hit] : [];
}

export function collectionsFor(project: Pick<Project, "slug" | "collectionLabel">): Collection[] {
  return COLLECTIONS_BY_SLUG[project.slug] ?? fromLabel(project.collectionLabel);
}

/** Normalises collections (multi-membership, primary first) and the
 *  city-level location for every project source (Sanity, repo drafts,
 *  external cases). */
export function applyTaxonomy<T extends Project>(project: T): T {
  const collections = collectionsFor(project);
  const loc = CITY_BY_SLUG[project.slug];
  return {
    ...project,
    collections,
    collectionLabel: collections.length ? `The ${collections[0]} Collection` : project.collectionLabel,
    city: loc?.city ?? project.city,
    country: loc?.country ?? project.country,
  };
}
