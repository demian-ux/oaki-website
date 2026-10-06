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

/** One image in an editorial row: the library master plus its alt. */
export interface CaseEditorialImage {
  image: JournalImage;
  alt: string;
  /** naturalWidth / naturalHeight, drives the justified-row flex share. */
  ratio: number;
}

/** A row of the editorial body: either a justified row of 1..n images
 *  sharing a height at full width, or a single loose image at a partial
 *  width with an alignment. */
export type CaseEditorialRow =
  | { kind: "justified"; images: CaseEditorialImage[] }
  | { kind: "loose"; image: CaseEditorialImage; width: number; align: "left" | "center" | "right" }
  /** `rowN: film | <src> :: <poster src>`: a muted loop at full width. */
  | { kind: "film"; src: string; poster?: string };

/** The editorial case template (01-plantilla-caso-de-estudio.md, 2026-10):
 *  clean hero, small tracked title, three-column intro, justified image
 *  rows with no captions, optional interlude, "Next project" closing. */
export interface CaseEditorial {
  hero:
    | { type: "image"; image: CaseEditorialImage }
    | { type: "video"; src: string; poster?: CaseEditorialImage; alt: string };
  sheet: { label: string; value: string }[];
  intro: string[];
  introImage: CaseEditorialImage | null;
  rows: CaseEditorialRow[];
  interlude?: { image: CaseEditorialImage; text: string[] };
  next: { slug: string; title: string } | null;
  /** Optional closing extras, only when the case file asks for them. */
  closingIndex: boolean;
  closingBw: CaseEditorialImage | null;
}

export interface CaseDraft {
  title: string;
  slug: string;
  /** SEO description (editorial template `description:`). */
  description?: string;
  /** Set when the file opts into the editorial template (`template: editorial`). */
  editorial?: CaseEditorial;
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

/** `<master name> :: <alt>` → editorial image, or null when the master is
 *  missing from the library (the row simply closes up around it). */
function editorialImage(raw: string | undefined, images: JournalImage[]): CaseEditorialImage | null {
  if (!raw) return null;
  const [name, alt = ""] = raw.split("::").map((s) => s.trim());
  const image = images.find((i) => i.name === name);
  if (!image) return null;
  return { image, alt: alt || name, ratio: image.naturalWidth / image.naturalHeight };
}

/**
 * Editorial template frontmatter:
 *   hero: <master> :: <alt>            or   heroVideo: <src> :: <alt>  (+ heroPoster: <master>)
 *   introImage: <master> :: <alt>
 *   sheetN: <label> :: <value>
 *   rowN: full | <m1> :: <alt> | <m2> :: <alt> ...        (justified row)
 *   rowN: 40% left | <master> :: <alt>                    (loose image)
 *   interludeImage: <master> :: <alt>                     (+ body "## Interlude")
 *   next: <slug> :: <title>
 *   closing: next | next, index | next, bw: <master> :: <alt>
 * Body: "## Intro" paragraphs (two), optional "## Interlude" paragraphs.
 */
function parseEditorial(fm: Record<string, string>, body: string, images: JournalImage[]): CaseEditorial {
  const sections = parseSections(body);
  const section = (name: string) =>
    sections.find((s) => s.heading.toLowerCase() === name)?.paragraphs ?? [];

  let hero: CaseEditorial["hero"];
  if (fm.heroVideo) {
    const [src, alt = ""] = fm.heroVideo.split("::").map((s) => s.trim());
    hero = { type: "video", src, poster: editorialImage(fm.heroPoster, images) ?? undefined, alt };
  } else {
    const img = editorialImage(fm.hero, images);
    if (!img) throw new Error(`Editorial case "${fm.slug ?? fm.title}": hero image not found in library`);
    hero = { type: "image", image: img };
  }

  const rows: CaseEditorialRow[] = [];
  for (const raw of numbered(fm, "row")) {
    const [spec, ...imgs] = raw.split("|").map((s) => s.trim());
    if (spec.toLowerCase() === "film" && imgs[0]) {
      const [src, poster] = imgs[0].split("::").map((s) => s.trim());
      rows.push({ kind: "film", src, poster: poster || undefined });
      continue;
    }
    const resolved = imgs.map((r) => editorialImage(r, images)).filter((x): x is CaseEditorialImage => !!x);
    if (resolved.length === 0) continue;
    const loose = spec.match(/^(\d+(?:\.\d+)?)%\s*(left|center|right)?$/i);
    if (loose) {
      rows.push({
        kind: "loose",
        image: resolved[0],
        width: Number(loose[1]),
        align: (loose[2]?.toLowerCase() as "left" | "center" | "right") ?? "left",
      });
    } else {
      rows.push({ kind: "justified", images: resolved });
    }
  }

  const interludeImage = editorialImage(fm.interludeImage, images);
  const interludeText = section("interlude");

  const closing = (fm.closing ?? "next").split(",").map((s) => s.trim());
  const bwSpec = closing.find((c) => c.toLowerCase().startsWith("bw:"));

  const nextRaw = fm.next ? fm.next.split("::").map((s) => s.trim()) : null;

  return {
    hero,
    sheet: numbered(fm, "sheet").map((c) => {
      const [label, value = ""] = c.split("::").map((s) => s.trim());
      return { label, value };
    }),
    intro: section("intro"),
    introImage: editorialImage(fm.introImage, images),
    rows,
    interlude:
      interludeImage && interludeText.length > 0
        ? { image: interludeImage, text: interludeText }
        : undefined,
    next: nextRaw ? { slug: nextRaw[0], title: nextRaw[1] ?? nextRaw[0] } : null,
    closingIndex: closing.some((c) => c.toLowerCase() === "index"),
    closingBw: bwSpec ? editorialImage(bwSpec.slice(3).trim(), images) : null,
  };
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

  // A file can opt into the editorial template only once it has a hero in
  // the library; until then it keeps rendering through CaseDraftView.
  const editorial =
    fm.template === "editorial" && (fm.heroVideo || editorialImage(fm.hero, images))
      ? parseEditorial(fm, body, images)
      : undefined;

  // Editorial files carry no imgN slots: expose hero + rows as slots so the
  // library cards and the home shelf keep resolving a cover from slot 1.
  if (editorial && slots.length === 0) {
    const all: CaseEditorialImage[] = [];
    if (editorial.hero.type === "image") all.push(editorial.hero.image);
    else if (editorial.hero.poster) all.push(editorial.hero.poster);
    for (const r of editorial.rows) {
      if (r.kind === "justified") all.push(...r.images);
      else if (r.kind === "loose") all.push(r.image);
    }
    all.forEach((e, i) => slots.push({ n: i + 1, image: e.image, label: e.alt }));
  }

  return {
    title: fm.title ?? slug,
    slug,
    description: fm.description,
    editorial,
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
