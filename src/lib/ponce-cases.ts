import { type Project } from "./types";

// Case studies built for the 1505 Ponce / DaGrosa proposal that still live
// only on the separate static site (1505-ponce-portfolio.vercel.app).
// Dillido Residence and The Point migrated into the site as native repo case
// studies (content/cases/, 11-Aug-2026); only Goldman remains external.
const PONCE_BASE = "https://1505-ponce-portfolio.vercel.app";

export const ponceCases: Project[] = [
  {
    _id: "ponce-goldman",
    title: "Goldman, with Journey",
    slug: "goldman",
    collectionLabel: "Workplace Collection",
    subtitle:
      "Work at institutional name scale, chosen by a practice with visualization in-house.",
    city: "New York",
    country: "United States",
    year: "",
    clientName: "",
    clientVisibility: "Hidden",
    projectType: "Workplace",
    mainGoal: "Competition",
    featured: false,
    externalUrl: `${PONCE_BASE}/goldman.html`,
    coverSrc: "/images/ponce/goldman-cover.webp",
    coverSize: { width: 3200, height: 1800 },
  },
];
