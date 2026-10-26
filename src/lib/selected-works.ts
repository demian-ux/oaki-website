// Selected work: the private sample sets shown to prospects (BDNY 2026 and
// one-to-one), served under /selected-works. Same editorial case template
// and the same chrome as the public site, its own curated index per set
// and its own next-project chain. This module is pure data (the header
// imports it on the client); the shelf helpers that read the image
// manifests live in selected-works-shelf.ts.
//
// Sets: the default set lives at /selected-works (the BDNY three). A
// client-specific set lives at /selected-works/for/<key> with its own
// intro and order; its cases are the same /selected-works/<slug> pages,
// chained inside the set. Every case here is cleared for private viewing
// only, so it is hidden from the public surfaces
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

export interface SelectedSet {
  /** URL key: /selected-works/for/<key>. The default set has none. */
  key: string;
  /** The set's landing path. */
  path: string;
  /** Who it was made for, for the page title. */
  title: string;
  /** Two sentences under the hero. */
  intro: string;
  /** Case slugs, in order. The chain follows this order and loops. */
  slugs: string[];
}

export const DEFAULT_SET_KEY = "bdny";

export const selectedSets: SelectedSet[] = [
  {
    key: DEFAULT_SET_KEY,
    path: SELECTED_BASE,
    title: "Selected work",
    intro: SELECTED_INTRO,
    slugs: ["the-point", "pavilion-grove", "goldman"],
  },
  {
    // Perkins Eastman, senior living campus on the Hudson (Oct 2026):
    // three phases, one Revit model and two massings, an aerial on a
    // drone photograph. Chosen for scale and for modeling from a massing.
    key: "perkins-eastman",
    path: `${SELECTED_BASE}/for/perkins-eastman`,
    title: "Selected work for Perkins Eastman",
    intro:
      "Four projects, chosen after our conversation. A hotel built out from a massing, and a city block set into its aerial photograph. A tower in the city's own photographs, and a market under the pines.",
    slugs: ["ski-center", "murray-city", "raghsa-tower", "numa"],
  },
];

export const selectedWorks: SelectedWork[] = [
  {
    slug: "the-point",
    title: "The Point",
    short: "The Point",
    coord: "Sochi",
    client: "Gregory Tuck Architecture",
    year: "2024",
    collection: "The Hospitality Collection",
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
  {
    // Location and developer withheld at the client's request (Sep 2025):
    // never name the state or the region on this case.
    slug: "ski-center",
    title: "Ski Center",
    short: "Ski Center",
    coord: "Undisclosed location",
    client: "Undisclosed",
    year: "2025",
    collection: "The Hospitality Collection",
    blurb: "Three buildings on a slope, built out from a massing model into a hotel, in winter and in summer.",
    cover: { project: "ski-center", name: "view-02-ski-beach" },
  },
  {
    slug: "murray-city",
    title: "Murray City",
    short: "Murray City",
    coord: "Murray City, Utah",
    client: "Maddproject",
    year: "2026",
    collection: "The Masterplan Collection",
    blurb: "A city block modeled whole and set into its aerial photograph, with the street by day and by night, in nine days.",
    cover: { project: "murray-city", name: "view-01-aerial" },
  },
  {
    slug: "raghsa-tower",
    title: "Ranu",
    short: "Ranu",
    coord: "Buenos Aires",
    client: "AFT",
    year: "2026",
    collection: "The Competition Collection",
    blurb: "A competition won. The tower in the city's own photographs, then walked from the street to the elevated lobby.",
    cover: { project: "raghsa-tower", name: "View 09_Aerial night" },
  },
  {
    slug: "numa",
    title: "Numa",
    short: "Numa",
    coord: "For AFT",
    client: "AFT",
    year: "2024",
    collection: "The Retail Collection",
    blurb: "A market hall and two bars of shops and offices under the pines, six views from the road to the hall at dusk.",
    cover: { project: "numa", name: "view-06-dusk" },
  },
];

export const selectedWorkSlugs = selectedWorks.map((w) => w.slug);

export function getSelectedWork(slug: string): SelectedWork | undefined {
  return selectedWorks.find((w) => w.slug === slug);
}

export function getSelectedSet(key: string): SelectedSet | undefined {
  return selectedSets.find((s) => s.key === key);
}

/** The set a case belongs to (the first that lists it), the default otherwise. */
export function getSetForSlug(slug: string): SelectedSet {
  return selectedSets.find((s) => s.slugs.includes(slug)) ?? selectedSets[0];
}

/** The set's cases, in the set's order. */
export function worksInSet(set: SelectedSet): SelectedWork[] {
  return set.slugs.map((slug) => getSelectedWork(slug)).filter((w): w is SelectedWork => !!w);
}

/** The set a path belongs to: its landing, one of its cases, else the
 *  default (contact and anything else). */
export function setFromPathname(pathname: string): SelectedSet {
  const forSet = pathname.match(/^\/selected-works\/for\/([^/]+)/);
  if (forSet) return getSelectedSet(forSet[1]) ?? selectedSets[0];
  const caseSlug = pathname.match(/^\/selected-works\/([^/]+)\/?$/)?.[1];
  if (caseSlug && getSelectedWork(caseSlug)) return getSetForSlug(caseSlug);
  return selectedSets[0];
}

/** The chain: each case hands over to the next in its set, the last back
 *  to the first. */
export function getNextSelectedWork(slug: string): { slug: string; title: string } | null {
  const set = getSetForSlug(slug);
  const i = set.slugs.indexOf(slug);
  if (i < 0) return null;
  const n = getSelectedWork(set.slugs[(i + 1) % set.slugs.length]);
  return n ? { slug: n.slug, title: n.title } : null;
}
