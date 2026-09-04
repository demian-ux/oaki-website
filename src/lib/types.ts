import type { PortableTextBlock } from "@portabletext/react";

export type ClientVisibility = "Public" | "Undisclosed" | "Hidden";

export type LayoutType =
  | "Fullscreen"
  | "Split Text Image"
  | "Image Grid"
  | "Horizontal Gallery"
  | "Pinned Scroll"
  | "Quote"
  | "Material Study"
  | "Contact Sheet"
  | "Video";

export interface Phase {
  _id: string;
  phaseNumber: string;
  phaseTitle: string;
  description: string;
  whatItIs: string;
  whatItContains: string;
  introText?: string;
  quote?: string;
  mainImage?: SanityImage | null;
  gallery?: SanityImage[];
  video?: string;
  materials?: string[];
  colorPalette?: string[];
  layoutType: LayoutType;
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref?: string;
    _type: "reference" | "sanity.imageAsset";
    _id?: string;
    url?: string;
    metadata?: { lqip?: string; dimensions?: { width: number; height: number } };
  };
  alt?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  collectionLabel: string;
  /** All collections the project belongs to, primary first. See project-taxonomy. */
  collections?: string[];
  subtitle: string;
  shortDescription?: string;
  coverImage?: SanityImage | null;
  heroMedia?: SanityImage | null;
  projectType?: string;
  country?: string;
  city: string;
  year: string;
  clientName: string;
  clientVisibility: ClientVisibility;
  mainGoal: string;
  featured: boolean;
  sortOrder?: number;
  /** Case study hosted outside the site (e.g. the Ponce portfolio) — the card links here instead of /case-studies/[slug]. */
  externalUrl?: string;
  /** Local /public cover path for external cases with no Sanity asset. Rendered at natural ratio, never cropped. */
  coverSrc?: string;
  /** Intrinsic pixel size of coverSrc, so the card reserves the right ratio. */
  coverSize?: { width: number; height: number };
  // Detail-page fields
  introText?: string;
  resultText?: string;
  architect?: string;
  interiorDesigner?: string;
  developer?: string;
  services?: string[];
  seoTitle?: string;
  seoDescription?: string;
  phases?: Phase[];
  testimonial?: Testimonial | null;
  credits?: { label: string; value: string }[];
  relatedProjects?: Project[];
}

export interface Testimonial {
  _id: string;
  quote: string;
  shortQuote?: string;
  personName?: string;
  personTitle?: string;
  company?: string;
  displayName?: string;
  approved: boolean;
  tone?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  portrait?: SanityImage | null;
  shortBio?: string;
  longBio?: string;
  order?: number;
}

export interface JournalPost {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  /** One sentence under the headline: what the project is and where. */
  dek?: string;
  excerpt?: string;
  /** Which render is the intended hero while the image is pending; placeholder label. */
  heroNote?: string;
  /** Fixed-format credit block, rendered in order. */
  credits?: { _key?: string; label: string; value: string }[];
  /** Source line: primary sources for the story. */
  sourceLinks?: { _key?: string; label: string; url: string }[];
  coverImage?: SanityImage | null;
  /** Local /public image path — fallback for mock entries with no Sanity asset. */
  img?: string;
  author?: { name: string; role?: string; portrait?: SanityImage | null } | null;
  /** ISO date from Sanity, e.g. "2026-07-29". Format for display with formatJournalDate. */
  date?: string;
  /** Computed in GROQ from body length; ≥1 after normalization in the data layer. */
  readMins?: number;
  body?: PortableTextBlock[];
  project?: { title: string; slug: string } | null;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteSettings {
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  contactEmail?: string;
  showJournal: boolean;
  showClientNames: boolean;
  socialLinks?: { instagram?: string; linkedin?: string };
  studioTagline?: string;
  preloaderText?: string;
  headerCtaLabel?: string;
  navLabels?: {
    caseStudies?: string;
    process?: string;
    about?: string;
    contact?: string;
  };
  footerCopyright?: string;
  footerCities?: string;
}
