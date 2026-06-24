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
export const homeProjects: HomeProject[] = [
  { n: "01", collection: "The Competition Collection", title: "Raghsa Tower",        client: "AFT",                         year: "2026", img: "/images/01.jpg", description: "Tower massing read against the skyline" },
  { n: "02", collection: "The Competition Collection", title: "Cazouls les Bézier",  client: "Naos",                        year: "2025", img: "/images/02.jpg", description: "Garden court and low pavilions" },
  { n: "03", collection: "The Residential Collection", title: "Dillido Residence",   client: "Ceïba",                       year: "2024", img: "/images/03.jpg", description: "Palm and pool in island light" },
  { n: "04", collection: "The Residential Collection", title: "Manhattan Apartment", client: "TBD Architecture + Design",   year: "2024", img: "/images/04.jpg", description: "Library wall and the Central Park view" },
  { n: "05", collection: "The Residential Collection", title: "NY Penthouse",        client: "TBD Architecture + Design",   year: "2024", img: "/images/05.jpg", description: "Open kitchen under city light" },
  { n: "06", collection: "The Residential Collection", title: "Windsor Residence",   client: "KoDA",                        year: "2024", img: "/images/06.jpg", description: "Pool terrace and planting" },
  { n: "07", collection: "The Residential Collection", title: "803 Hunter Rd",       client: "TBD Architecture + Design",   year: "2025", img: "/images/07.jpg", description: "Warm interior in layered timber" },
];
