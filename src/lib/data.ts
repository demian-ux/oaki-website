import { draftMode } from "next/headers";
import {
  type JournalPost,
  type Project,
  type SanityImage,
  type SiteSettings,
  type TeamMember,
} from "./types";
import { placeholderProjects } from "./placeholder-data";
import { journalPostsMock } from "./journal-mock";
import { HIDDEN_JOURNAL_SLUGS } from "./hidden-projects";
import { applyTaxonomy } from "./project-taxonomy";

const hasSanityConfig =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "";

async function isPreview(): Promise<boolean> {
  try {
    const dm = await draftMode();
    return dm.isEnabled;
  } catch {
    return false;
  }
}

async function getSanityData<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!hasSanityConfig) return null;
  try {
    const preview = await isPreview();
    const { sanityFetch } = await import("@/sanity/client");
    return await sanityFetch<T>({ query, params: params ?? {}, preview });
  } catch {
    return null;
  }
}

/* Library covers for the Sanity projects whose old Sanity "book cover"
   assets are retired (2026-08-26) — the card template now uses these
   renders instead. The Sanity coverImage stays untouched as data. */
const coverOverrides: Record<string, { coverSrc: string; title?: string }> = {
  "raghsa-tower": { coverSrc: "/images/raghsa-tower/web/View%2002_Exterior_Libertador-1920.webp" },
  "ny-penthouse": {
    coverSrc: "/images/ny-penthouse/web/Living%20Piano%20Stage-1920.webp",
    // Public name confirmed by Demi 2026-08-26 (matches the home shelf).
    title: "Central Park West",
  },
  "windsor-residence": { coverSrc: "/images/windsor-residence/web/View%2006-1920.webp" },
};

const withCoverOverrides = (projects: Project[]): Project[] =>
  projects.map((p) =>
    applyTaxonomy(coverOverrides[p.slug] ? { ...p, ...coverOverrides[p.slug] } : p)
  );

export async function getAllProjects(): Promise<Project[]> {
  if (hasSanityConfig) {
    const { allProjectsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<Project[]>(allProjectsQuery);
    if (data && data.length > 0) return withCoverOverrides(data);
  }
  return withCoverOverrides(placeholderProjects);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  if (hasSanityConfig) {
    const { featuredProjectsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<Project[]>(featuredProjectsQuery);
    if (data && data.length > 0) return withCoverOverrides(data);
  }
  return withCoverOverrides(placeholderProjects.filter((p) => p.featured));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (hasSanityConfig) {
    const { projectBySlugQuery } = await import("@/sanity/queries");
    const data = await getSanityData<Project>(projectBySlugQuery, { slug });
    if (data) return withCoverOverrides([data])[0];
  }
  const local = placeholderProjects.find((p) => p.slug === slug);
  return local ? withCoverOverrides([local])[0] : null;
}

export async function getAllProjectSlugs(): Promise<string[]> {
  if (hasSanityConfig) {
    const { allProjectSlugsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<{ slug: string }[]>(allProjectSlugsQuery);
    if (data && data.length > 0) return data.map((d) => d.slug);
  }
  return placeholderProjects.map((p) => p.slug);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (hasSanityConfig) {
    const { siteSettingsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<SiteSettings>(siteSettingsQuery);
    if (data) return data;
  }
  return {
    showJournal: false,
    showClientNames: false,
    socialLinks: { instagram: "#", linkedin: "#" },
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (hasSanityConfig) {
    const { teamMembersQuery } = await import("@/sanity/queries");
    const data = await getSanityData<TeamMember[]>(teamMembersQuery);
    if (data && data.length > 0) return data;
  }
  return [
    { _id: "tm-01", name: "Demian Szklar", role: "Founder / Creative Direction", order: 1 },
    { _id: "tm-02", name: "Team Member", role: "Art Direction", order: 2 },
    { _id: "tm-03", name: "Team Member", role: "CGI Artist", order: 3 },
    { _id: "tm-04", name: "Team Member", role: "Production", order: 4 },
  ];
}

// ── Journal ──────────────────────────────────────────────
// Sanity when configured, journalPostsMock otherwise. readMins comes from a
// GROQ expression over the body — normalize it to ≥1 so a short post never
// shows "0 min read".

function normalizeJournalPost(post: JournalPost): JournalPost {
  return { ...post, readMins: Math.max(1, Math.round(post.readMins ?? 1)) };
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  if (hasSanityConfig) {
    const { allJournalPostsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<JournalPost[]>(allJournalPostsQuery);
    if (data && data.length > 0)
      return data
        .filter((p) => !HIDDEN_JOURNAL_SLUGS.has(p.slug))
        .map(normalizeJournalPost);
    // Sanity is live: an empty journal is an empty journal, not a reason to
    // show placeholder entries whose links resolve to mock-only content.
    if (data) return [];
  }
  return journalPostsMock;
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  if (HIDDEN_JOURNAL_SLUGS.has(slug)) return null;
  if (hasSanityConfig) {
    const { journalPostBySlugQuery } = await import("@/sanity/queries");
    const data = await getSanityData<JournalPost>(journalPostBySlugQuery, { slug });
    if (data) return normalizeJournalPost(data);
    return null;
  }
  return journalPostsMock.find((p) => p.slug === slug) ?? null;
}

// Private client preview: fetches regardless of the published flag. Sanity
// only — mock entries have no private-review use. Callers sit behind an
// unguessable token and mark themselves noindex.
export async function getJournalPostForPreview(slug: string): Promise<JournalPost | null> {
  if (!hasSanityConfig) return null;
  const { journalPostPreviewBySlugQuery } = await import("@/sanity/queries");
  const data = await getSanityData<JournalPost>(journalPostPreviewBySlugQuery, { slug });
  return data ? normalizeJournalPost(data) : null;
}

export async function getAllJournalSlugs(): Promise<string[]> {
  if (hasSanityConfig) {
    const { allJournalSlugsQuery } = await import("@/sanity/queries");
    const data = await getSanityData<{ slug: string }[]>(allJournalSlugsQuery);
    return (data ?? [])
      .map((d) => d.slug)
      .filter((s) => !HIDDEN_JOURNAL_SLUGS.has(s));
  }
  return journalPostsMock.map((p) => p.slug);
}

export function getNextProject(currentSlug: string, projects: Project[]): Project | null {
  const idx = projects.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return null;
  return projects[(idx + 1) % projects.length];
}

// ── Page singletons ──────────────────────────────────────
// Each returns a partial — pages should treat all fields as optional and
// fall back to baked-in copy when Sanity hasn't been filled out yet.

export type HomePageData = {
  heroLabel?: string;
  heroTitle?: string;
  heroSubtext?: string;
  heroImage?: SanityImage | null;
  heroVideo?: {
    asset?: {
      url?: string;
      mimeType?: string;
      size?: number;
    } | null;
  } | null;
  heroPrimaryCta?: string;
  heroSecondaryCta?: string;
  featuredLabel?: string;
  featuredHeading?: string;
  featuredViewAllLabel?: string;
  conceptLabel?: string;
  conceptHeading?: string;
  conceptBody?: string;
  positioningHeading?: string;
  positioningParagraph1?: string;
  positioningParagraph2?: string;
  positioningStatement?: string;
  fasesLabel?: string;
  fasesButtonLabel?: string;
  peerBandHeading?: string;
  peerBandQuote?: string;
  peerBandAuthorName?: string;
  peerBandAuthorTitle?: string;
  clientMarks?: string[];
  factStrip?: string;
  aboutLabel?: string;
  aboutHeading?: string;
  aboutBody?: string;
  aboutButtonLabel?: string;
  finalCtaHeading?: string;
  finalCtaButtonLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function getHomePage(): Promise<HomePageData> {
  if (hasSanityConfig) {
    const { homePageQuery } = await import("@/sanity/queries");
    const data = await getSanityData<HomePageData>(homePageQuery);
    if (data) return data;
  }
  return {};
}

export type AboutPageData = {
  heroLabel?: string;
  heroTitle?: string;
  heroText?: string;
  statementHeading?: string;
  statementParagraph1?: string;
  statementParagraph2?: string;
  studioStatement?: string;
  studioText?: string;
  teamLabel?: string;
  workWithLabel?: string;
  workWithItems?: string[];
  ctaHeading?: string;
  ctaButtonLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function getAboutPage(): Promise<AboutPageData> {
  if (hasSanityConfig) {
    const { aboutPageQuery } = await import("@/sanity/queries");
    const data = await getSanityData<AboutPageData>(aboutPageQuery);
    if (data) return data;
  }
  return {};
}

export type ProcessStep = { number: string; title: string; body: string };
export type ProcessPageData = {
  heroLabel?: string;
  heroTitle?: string;
  heroText?: string;
  steps?: ProcessStep[];
  fasesLabel?: string;
  fasesHeading?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function getProcessPage(): Promise<ProcessPageData> {
  if (hasSanityConfig) {
    const { processPageQuery } = await import("@/sanity/queries");
    const data = await getSanityData<ProcessPageData>(processPageQuery);
    if (data) return data;
  }
  return {};
}

export type ContactPageData = {
  heroLabel?: string;
  heroTitle?: string;
  heroText?: string;
  stepTitles?: string[];
  continueLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  messagePrompt?: string;
  services?: string[];
  goals?: string[];
  projectTypeOptions?: string[];
  projectStageOptions?: string[];
  budgetOptions?: string[];
  thankYouHeading?: string;
  successMessage?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function getContactPage(): Promise<ContactPageData> {
  if (hasSanityConfig) {
    const { contactPageQuery } = await import("@/sanity/queries");
    const data = await getSanityData<ContactPageData>(contactPageQuery);
    if (data) return data;
  }
  return {};
}
