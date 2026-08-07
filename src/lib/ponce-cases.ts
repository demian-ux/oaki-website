import { type Project } from "./types";

// The three case studies built for the 1505 Ponce / DaGrosa proposal.
// They live as a separate static site (1505-ponce-portfolio.vercel.app);
// the library lists them as external cards. Copy mirrors that site's index.
const PONCE_BASE = "https://1505-ponce-portfolio.vercel.app";

export const ponceCases: Project[] = [
  {
    _id: "ponce-dilido",
    title: "220 W Dilido",
    slug: "220-w-dilido",
    collectionLabel: "Residential Collection",
    subtitle:
      "The full program: exteriors, interiors and film for a waterfront residence.",
    city: "Miami Beach",
    country: "United States",
    year: "2025",
    clientName: "",
    clientVisibility: "Hidden",
    projectType: "Residential",
    mainGoal: "Sales and stakeholder approval",
    featured: false,
    externalUrl: `${PONCE_BASE}/220w-dillido.html`,
    coverSrc: "/images/ponce/dilido-cover.jpg",
    coverSize: { width: 4000, height: 3008 },
  },
  {
    _id: "ponce-the-point",
    title: "The Point",
    slug: "the-point",
    collectionLabel: "Residential Collection",
    subtitle:
      "A complete interior program, another designer's intent kept exact across every image.",
    city: "Sochi",
    country: "Russia",
    year: "",
    clientName: "",
    clientVisibility: "Hidden",
    projectType: "Residential",
    mainGoal: "Design development",
    featured: false,
    externalUrl: `${PONCE_BASE}/sochi.html`,
    coverSrc: "/images/ponce/the-point-cover.webp",
    coverSize: { width: 4000, height: 3000 },
  },
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
