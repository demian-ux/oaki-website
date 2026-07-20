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
