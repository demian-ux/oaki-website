// Shared homepage project set — the source for both the hero shelf and the
// gallery slider so their captions (collection / title / client · year) match.
// `description` is the gallery image caption (the bottom-left tab).
export type HomeProject = {
  n: string;
  collection: string;
  title: string;
  client: string;
  year: string;
  img: string;
  description: string;
  /** The project's case study. Absolute URLs (Ponce portfolio) open in a new
   *  tab; projects without a public case study yet fall back to the library. */
  href: string;
  /** Optional looping cover video (portrait). `img` doubles as the ticker
   *  frame and the fallback while the video loads. */
  video?: { mp4: string; webm?: string };
};

// Order = shelf order (01 … 07). 04 (Manhattan) is the one the hero ticker
// lands on and that stays centred.
// img points at the image-library 1920 WebP derivatives (2026-08-05).
export const homeProjects: HomeProject[] = [
  { n: "01", collection: "The Competition Collection", title: "Raghsa Tower",        client: "AFT",                         year: "2026", img: "/images/raghsa-tower/web/View%2002_Exterior_Libertador-1920.webp", description: "Tower massing read against the skyline", href: "/case-studies/raghsa-tower" },
  { n: "02", collection: "The Competition Collection", title: "Cazouls les Bézier",  client: "Naos",                        year: "2025", img: "/images/cazouls-les-bezier/web/View%2002-1920.webp", description: "Garden court and low pavilions", href: "/case-studies/cazouls-les-bezier" },
  { n: "03", collection: "The Residential Collection", title: "Dillido Residence",   client: "Ceïba",                       year: "2024", img: "/images/dillido-residence/web/view-01-front-facade-1920.webp", description: "Palm and pool in island light", href: "/case-studies/dillido-residence" },
  { n: "04", collection: "The Residential Collection", title: "Manhattan Apartment", client: "TBD Architecture + Design",   year: "2024", img: "/images/2w-29th/web/Living-1920.webp", description: "Library wall and the Central Park view", href: "/case-studies/manhattan-apartment" },
  { n: "05", collection: "The Residential Collection", title: "Central Park West",   client: "TBD Architecture + Design",   year: "2024", img: "/images/ny-penthouse/web/Living%20Piano%20Stage-1920.webp", description: "The living room as a stage", href: "/case-studies/ny-penthouse" },
  { n: "06", collection: "The Residential Collection", title: "Windsor Residence",   client: "Koda",                        year: "2024", img: "/images/windsor-residence/web/View%2006-1920.webp", description: "Pool terrace and planting", href: "/case-studies/windsor-residence" },
  { n: "07", collection: "The Residential Collection", title: "803 Hunter Rd",       client: "TBD Architecture + Design",   year: "2025", img: "/images/803-hunter-rd/web/View%2003_Living-1920.webp", description: "Warm interior in layered timber", href: "/case-studies/803-hunter-rd" },
  { n: "08", collection: "The Residential Collection", title: "The Point",           client: "Gregory Tuck Architecture",   year: "2024", img: "/video/the-point/hero-tall-poster.webp", description: "The interior program in motion", href: "/case-studies/the-point", video: { mp4: "/video/the-point/hero-tall.mp4", webm: "/video/the-point/hero-tall.webm" } },
  { n: "09", collection: "The Residential Collection", title: "Oak House",           client: "Koda",                        year: "2026", img: "/images/oak-house/web/View%2001_Facade_a05-1920.webp", description: "The house holding back around the oaks", href: "/case-studies/oak-house" },
  { n: "10", collection: "The Residential Collection", title: "Moncayo", client: "Koda",                      year: "2024", img: "/images/moncayo/web/View%2030-1920.webp", description: "The garden entry framing the sea", href: "/case-studies/moncayo" },
  { n: "11", collection: "The Residential Collection", title: "K Villa",             client: "Portia Fox Design",           year: "2025",     img: "/images/k-villa/web/View%2001_Formal%20Entrance-1920.webp", description: "The formal entrance, dressed turnkey", href: "/case-studies/k-villa" },
  // Temporarily hidden (see src/lib/hidden-projects.ts) — restore by uncommenting:
  // { n: "12", collection: "The Retail Collection",      title: "Level Shoes",         client: "Koda",                        year: "2026", img: "/images/level-shoes/web/View%2004_Mens%20Area-1920.webp", description: "The men's area at Bal Harbour", href: "/case-studies/level-shoes" },
  // { n: "13", collection: "The Workplace Collection",   title: "Goldman, with Journey", client: "",                          year: "",     img: "/images/ponce/goldman-cover-1920.webp", description: "The canopy entrance at street level", href: "https://1505-ponce-portfolio.vercel.app/goldman.html" },
];
