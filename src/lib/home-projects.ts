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
};

// Order = shelf order (01 … 07). 04 (Manhattan) is the one the hero ticker
// lands on and that stays centred.
// img points at the image-library 1920 WebP derivatives (2026-08-05);
// 03 (= maison-rive-gauche) and 05 (ny-penthouse) keep the legacy files
// until Demi loads those masters.
export const homeProjects: HomeProject[] = [
  { n: "01", collection: "The Competition Collection", title: "Raghsa Tower",        client: "AFT",                         year: "2026", img: "/images/raghsa-tower/web/View%2002_Exterior_Libertador-1920.webp", description: "Tower massing read against the skyline" },
  { n: "02", collection: "The Competition Collection", title: "Cazouls les Bézier",  client: "Naos",                        year: "2025", img: "/images/cazouls-les-bezier/web/View%2002-1920.webp", description: "Garden court and low pavilions" },
  { n: "03", collection: "The Residential Collection", title: "Dillido Residence",   client: "Ceïba",                       year: "2024", img: "/images/03.jpg", description: "Palm and pool in island light" },
  { n: "04", collection: "The Residential Collection", title: "Manhattan Apartment", client: "TBD Architecture + Design",   year: "2024", img: "/images/2w-29th/web/Living-1920.webp", description: "Library wall and the Central Park view" },
  { n: "05", collection: "The Residential Collection", title: "NY Penthouse",        client: "TBD Architecture + Design",   year: "2024", img: "/images/05.jpg", description: "Open kitchen under city light" },
  { n: "06", collection: "The Residential Collection", title: "Windsor Residence",   client: "KoDA",                        year: "2024", img: "/images/windsor-residence/web/View%2006-1920.webp", description: "Pool terrace and planting" },
  { n: "07", collection: "The Residential Collection", title: "803 Hunter Rd",       client: "TBD Architecture + Design",   year: "2025", img: "/images/803-hunter-rd/web/View%2003_Living-1920.webp", description: "Warm interior in layered timber" },
];
