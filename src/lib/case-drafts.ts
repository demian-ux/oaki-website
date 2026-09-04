import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getProjectImages, type JournalImage } from "./journal-images";
import { HIDDEN_PROJECT_SLUGS } from "./hidden-projects";
import type { Project } from "./types";

// Case-study DRAFTS: repo-only content under content/cases/*.md, rendered
// exclusively through the private token previews so Demi reviews prose in
// place. Nothing here reaches Sanity, the public routes, or the sitemap
// until the drafts are approved and the site gate lifts.
//
// Frontmatter is the journal's simple `key: value` form. The image arc is
// ten `imgN: <master name or GAP> :: <slot description>` slots resolved
// against the image library; GAP renders a labeled placeholder so the
// review page reads complete.

export interface CaseImageSlot {
  n: number;
  /** Manifest name of the library master, or null for a GAP slot. */
  image: JournalImage | null;
  label: string;
}

export interface CaseSection {
  heading: string;
  paragraphs: string[];
}

export interface CaseVideo {
  src: string;
  poster?: string;
  label: string;
}

export interface CaseDraft {
  title: string;
  slug: string;
  collection?: string;
  audience?: string;
  argument?: string;
  subtitle?: string;
  location?: string;
  type?: string;
  client?: string;
  year?: string;
  credits: { label: string; value: string }[];
  gaps: string[];
  flags: string[];
  slots: CaseImageSlot[];
  sections: CaseSection[];
  /** Optional web-encoded animation (`video: <src> :: <label>` +
   *  `videoPoster: <src>` in frontmatter), shown after the image walk. */
  video?: CaseVideo;
  /** The project's full image library, for the closing index grid. */
  library: JournalImage[];
}

function parseFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2] };
}

function parseSections(body: string): CaseSection[] {
  const sections: CaseSection[] = [];
  let current: CaseSection | null = null;
  for (const block of body.split(/\r?\n\r?\n/)) {
    const text = block.trim();
    if (!text) continue;
    if (text.startsWith("## ")) {
      const [head, ...rest] = text.split(/\r?\n/);
      current = { heading: head.slice(3).trim(), paragraphs: [] };
      sections.push(current);
      const tail = rest.join("\n").trim();
      if (tail) current.paragraphs.push(tail);
    } else if (current) {
      current.paragraphs.push(text);
    }
  }
  return sections;
}

function numbered(fm: Record<string, string>, prefix: string): string[] {
  const out: string[] = [];
  for (let i = 1; fm[`${prefix}${i}`]; i++) out.push(fm[`${prefix}${i}`]);
  return out;
}

/** Repo case studies as library cards, hero = first resolved image slot.
 *  Drafts with no library images yet (e.g. Alderbrook, which also carries
 *  review conditions) stay preview-only and are not listed. */
export function getCaseDraftCards(): Project[] {
  return listCaseDraftSlugs()
    .filter((slug) => !HIDDEN_PROJECT_SLUGS.has(slug))
    .map((slug) => getCaseDraft(slug))
    .filter((d): d is CaseDraft => d !== null)
    .filter((d) => d.slots.some((s) => s.image))
    .map((d) => {
      const hero = d.slots.find((s) => s.image)?.image ?? null;
      const largest = hero ? [...hero.webp].sort((a, b) => b.width - a.width)[0] : null;
      const [city = "", country = ""] = (d.location ?? "").split(",").map((s) => s.trim());
      return {
        _id: `case-draft-${d.slug}`,
        title: d.title,
        slug: d.slug,
        collectionLabel: d.collection ?? "",
        subtitle: d.subtitle ?? "",
        city: city.startsWith("PENDING") ? "" : city,
        country: country || undefined,
        year: d.year ?? "",
        clientName: d.client ?? "",
        clientVisibility: "Hidden" as const,
        projectType: d.type,
        mainGoal: "",
        featured: false,
        coverSrc: largest?.src,
        coverSize: hero
          ? { width: hero.naturalWidth, height: hero.naturalHeight }
          : undefined,
      };
    });
}

/** All repo case-study slugs (content/cases/*.md). */
export function listCaseDraftSlugs(): string[] {
  const dir = resolve(process.cwd(), "content", "cases");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

export function getCaseDraft(slug: string): CaseDraft | null {
  const path = resolve(process.cwd(), "content", "cases", `${slug}.md`);
  if (!existsSync(path)) return null;
  const { fm, body } = parseFrontmatter(readFileSync(path, "utf-8"));

  const images = fm.imageProject ? getProjectImages(fm.imageProject) : [];
  const slots: CaseImageSlot[] = numbered(fm, "img").map((raw, idx) => {
    const [name, label = ""] = raw.split("::").map((s) => s.trim());
    const image =
      name && name !== "GAP" ? images.find((i) => i.name === name) ?? null : null;
    return { n: idx + 1, image, label: label || name };
  });

  return {
    title: fm.title ?? slug,
    slug,
    collection: fm.collection,
    audience: fm.audience,
    argument: fm.argument,
    subtitle: fm.subtitle,
    location: fm.location,
    type: fm.type,
    client: fm.client,
    year: fm.year,
    credits: numbered(fm, "credit").map((c) => {
      const [label, value = ""] = c.split("::").map((s) => s.trim());
      return { label, value };
    }),
    gaps: numbered(fm, "gap"),
    flags: numbered(fm, "flag"),
    slots,
    library: images,
    sections: parseSections(body),
    video: (() => {
      if (!fm.video) return undefined;
      const [src, label = ""] = fm.video.split("::").map((s) => s.trim());
      return { src, poster: fm.videoPoster || undefined, label: label || "The film" };
    })(),
  };
}
