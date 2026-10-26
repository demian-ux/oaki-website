import { homeProjects } from "./home-projects";
import { HIDDEN_PROJECT_SLUGS } from "./hidden-projects";
import { getCaseDraft, getCaseDraftCards } from "./case-drafts";
import type { Project } from "./types";

/**
 * The "Next project" of every public case study comes from ONE ordered
 * chain through all the public cases, never from a per-file `next:`.
 * A single cycle cannot contain a pair (A -> B -> A), cannot point at a
 * hidden case, and gives every case exactly one predecessor. The order is
 * the home shelf's (01 ... 12), then the remaining public cases
 * alphabetically, then any Sanity-only project. The per-file `next:` stays
 * for the curated selected-work sets, which carry their own chain.
 */
export function getNextCase(
  slug: string,
  projects: Project[]
): { slug: string; title: string } | null {
  const shelf = homeProjects
    .map((p) => p.href.replace(/^\/case-studies\//, ""))
    .filter((s) => !s.startsWith("http"));
  // the same public set the library lists: drafts with library images
  const drafts = getCaseDraftCards().map((d) => d.slug).sort();
  const sanity = projects.map((p) => p.slug);
  const chain: string[] = [];
  for (const s of [...shelf, ...drafts, ...sanity]) {
    if (HIDDEN_PROJECT_SLUGS.has(s) || chain.includes(s)) continue;
    // only cases the library lists (a draft with images, or a project)
    if (!drafts.includes(s) && !projects.some((p) => p.slug === s)) continue;
    chain.push(s);
  }
  const i = chain.indexOf(slug);
  if (i === -1 || chain.length < 2) return null;
  const nextSlug = chain[(i + 1) % chain.length];
  const title = getCaseDraft(nextSlug)?.title ?? projects.find((p) => p.slug === nextSlug)?.title ?? nextSlug;
  return { slug: nextSlug, title };
}
