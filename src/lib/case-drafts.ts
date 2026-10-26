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
  /** `rowN: pair 27% 50% | <a> :: <alt> | <b> :: <alt>`: two images at
   *  their own widths, centered on the page, centered on each other in
   *  height, with a wide gap between them (template v2). */
  | { kind: "pair"; images: [CaseEditorialImage, CaseEditorialImage]; widths: [number, number] }
  /** `rowN: film | <src> :: <poster src>`: a muted loop at full width.
   *  `rowN: film 1.78 sound | <src> :: <poster src> :: <label>`: the film
   *  itself, on the ink ground at viewport height, started by the viewer
   *  with sound (selected-work film-first cases). */
  | {
      kind: "film";
      src: string;
      poster?: string;
      ratio: number;
      sound: boolean;
      label?: string;
      /** `rowN: film R sound | <src> :: <poster> :: <label> :: <head> :: <text>`:
       *  a short note above the film (a coord head and one or two
       *  sentences), for a storyboard or a cut that needs a word first. */
      note?: { head: string; text: string };
    }
  /** `rowN: interlude`: the interlude (image + words) at this point of the
   *  walk instead of after the last row. */
  | { kind: "interlude" };

/** The editorial case template (01-plantilla-caso-de-estudio.md, 2026-10):
 *  clean hero, small tracked title, three-column intro, justified image
 *  rows with no captions, optional interlude, "Next project" closing. */
export interface CaseEditorial {
  /** The cover. null when the case opens on its film instead (`film:`
   *  with no `hero:`): the film is the hero. */
  hero:
    | null
    | { type: "image"; image: CaseEditorialImage }
    | {
        type: "video";
        src: string;
        /** Poster from the library (`heroPoster: <master>`) ... */
        poster?: CaseEditorialImage;
        /** ... or a plain file (`heroPoster: /video/x/poster.webp`). */
        posterSrc?: string;
        /** Frame ratio for sizing, `heroRatio:` (defaults to 16:9). */
        ratio: number;
        alt: string;
      };
  /** Film-first cases (`film: <src> :: <poster> :: <label>`, `filmRatio:`):
   *  the film itself, with sound on tap, between the cover and the title. */
  film?: { src: string; poster?: string; ratio: number; label?: string };
  sheet: { label: string; value: string }[];
  intro: string[];
  introImage: CaseEditorialImage | null;
  rows: CaseEditorialRow[];
  interlude?: { image: CaseEditorialImage; text: string[] };
  /** Optional closing words ("## Outcome" in the body) with an optional
   *  pull-quote (`quote: <text> :: <attribution>`), set before the index
   *  and the Next band. The one place a verifiable fact or a client's
   *  words land on the page. */
  outcome?: { text: string[]; quote?: { text: string; by: string } };
  next: { slug: string; title: string } | null;
  /** Optional closing extras, only when the case file asks for them. */
  closingIndex: boolean;
  /** `indexN: <set/master> :: <alt>`: the index set (template v3). When
   *  absent and `closing` asks for index, the whole library is used. */
  closingIndexImages: CaseEditorialImage[];
  closingBw: CaseEditorialImage | null;
}


/* ------------------------------------------------------------------------
 * The MAGAZINE template (01-plantilla-v4.md, 2026-10, "Magazine"): hero,
 * cover (kicker / huge title / one-line summary), three-column intro, then
 * a sequence of SHEETS, each one viewport tall, with the case name running
 * down a fixed spine on the left. Images are re-scaled into the sheet,
 * never cropped, never deformed, and nothing enters the spine.
 * ---------------------------------------------------------------------- */

export interface CaseMagazineFigure {
  value: string;
  label: string;
}

/** An image on a sheet: the library master, its alt, its ratio and an
 *  optional credit (diagrams: "Diagram: AFT Arquitectos"). */
export interface CaseMagazineImage extends CaseEditorialImage {
  credit?: string;
}

export type CaseMagazinePage =
  /** Sangrado: one image from the spine to the right edge, max 92% tall. */
  | { kind: "bleed"; image: CaseMagazineImage }
  /** Sangrado doble: two images at one height, filling the width. */
  | { kind: "bleed-two"; images: CaseMagazineImage[] }
  /** Lámina centrada: one image, 12% side margins, max 88% tall. */
  | { kind: "plate"; image: CaseMagazineImage }
  /** Tres láminas: two or three verticals at one height, centered. */
  | { kind: "plates"; images: CaseMagazineImage[] }
  /** Par asimétrico: big (62% / 80%) + small (28% / 56%), centered on each other. */
  | { kind: "pair"; big: CaseMagazineImage; small: CaseMagazineImage; smallFirst: boolean }
  /** Hoja de color: warm grey sheet, image(s) the full height, left / right / centered. */
  | { kind: "color"; images: CaseMagazineImage[]; align: "left" | "right" | "center" }
  /** Banda: the colour is as tall as the big image (80%), the small one centered in the rest. */
  | { kind: "band"; big: CaseMagazineImage; small: CaseMagazineImage }
  /** Hoja oscura: #1d1b18, image up to the full height, optional quote at right. */
  | { kind: "dark"; image: CaseMagazineImage; quote?: string; cite?: string }
  /** Cita: plate at left (88%), serif italic sentence at right, right-aligned. */
  | { kind: "quote"; image: CaseMagazineImage; quote: string; cite?: string }
  /** Texto + diagrama: figures / paragraphs / a quote at left, a diagram with
   *  credit (or a plate, or a trio) at right; `under` puts the diagram under
   *  the text instead. Words come from the body section "## Page N". */
  | {
      kind: "text";
      figures: CaseMagazineFigure[];
      text: string[];
      quote?: string;
      quoteBy?: string;
      under?: CaseMagazineImage;
      right: CaseMagazineImage[];
    }
  /** Lámina con margen frente a sangrado. */
  | { kind: "plate-bleed"; left: CaseMagazineImage; right: CaseMagazineImage }
  /** Film vertical: a colour sheet with a 9:16 muted loop, 84% tall. */
  | { kind: "film"; src: string; poster?: string; ratio: number }
  /** Afterward: centered serif text with the result, optionally the client's
   *  words with attribution, and 0-3 numeric figures. */
  | { kind: "afterward"; text: string[]; figures: CaseMagazineFigure[]; quote?: { text: string; by?: string } };

export interface CaseMagazine {
  hero:
    | { type: "image"; image: CaseMagazineImage }
    | { type: "video"; src: string; posterSrc?: string; ratio: number; alt: string };
  /** The section line over the title: "The X Collection · No. NN · City, Year". */
  kicker: string;
  /** Short names (Ranu, The Point) take the larger title size. */
  titleSize: "short" | "long";
  /** The one-line summary under the title, serif italic. */
  summary: string;
  sheet: { label: string; value: string }[];
  intro: string[];
  introImage: CaseMagazineImage | null;
  pages: CaseMagazinePage[];
  index: CaseMagazineImage[];
  /** The "Next project" band's second line, e.g. "Gregory Tuck Architecture · 2024". */
  byline?: string;
}

export interface CaseDraft {
  title: string;
  slug: string;
  /** SEO description (editorial template `description:`). */
  description?: string;
  /** Set when the file opts into the editorial template (`template: editorial`). */
  editorial?: CaseEditorial;
  /** Set when the file opts into the magazine template (`template: magazine`). */
  magazine?: CaseMagazine;
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
  const [ref, alt = ""] = raw.split("::").map((s) => s.trim());
  // "index/01-foo" addresses a set subfolder; a bare name matches flat first.
  const slash = ref.indexOf("/");
  const set = slash > 0 ? ref.slice(0, slash) : null;
  const name = slash > 0 ? ref.slice(slash + 1) : ref;
  const image =
    images.find((i) => i.name === name && (set ? i.set === set : i.set === null)) ??
    (set ? undefined : images.find((i) => i.name === name));
  if (!image) return null;
  return { image, alt: alt || name, ratio: image.naturalWidth / image.naturalHeight };
}

/**
 * Editorial template frontmatter:
 *   hero: <master> :: <alt>            or   heroVideo: <src> :: <alt>   (or neither, with film:)
 *                                           (+ heroPoster: <master> | </file.webp>, heroRatio: 1.77)
 *   The hero is always landscape: a 16:9 still or a landscape loop.
 *   introImage: <master> :: <alt>
 *   sheetN: <label> :: <value>
 *   rowN: full | <m1> :: <alt> | <m2> :: <alt> ...        (justified row)
 *   rowN: 40% left | <master> :: <alt>                    (loose image)
 *   rowN: pair 27% 50% | <a> :: <alt> | <b> :: <alt>      (pair, v2)
 *   rowN: film 0.79 | <src> :: <poster src>               (muted loop, ratio w/h, default 16:9)
 *   rowN: film 1.78 sound | <src> :: <poster> :: <label>  (the film, played with sound on tap)
 *                             :: <head> :: <text>          (optional note above it)
 *   rowN: interlude                                       (the interlude here, not after the rows)
 *   film: <src> :: <poster> :: <label> (+ filmRatio:)     (film-first: the film before the title)
 *   interludeImage: <master> :: <alt>                     (+ body "## Interlude")
 *   quote: <text> :: <attribution>                        (+ body "## Outcome", optional)
 *   next: <slug> :: <title>
 *   closing: next | next, index | next, bw: <master> :: <alt>
 *   indexN: index/<master> :: <alt>                       (index set, v3)
 * Body: "## Intro" paragraphs (two), optional "## Interlude" paragraphs.
 */
function parseEditorial(fm: Record<string, string>, body: string, images: JournalImage[]): CaseEditorial {
  const sections = parseSections(body);
  const section = (name: string) =>
    sections.find((s) => s.heading.toLowerCase() === name)?.paragraphs ?? [];

  let hero: CaseEditorial["hero"];
  if (fm.heroVideo) {
    const [src, alt = ""] = fm.heroVideo.split("::").map((s) => s.trim());
    const posterIsFile = fm.heroPoster?.startsWith("/");
    hero = {
      type: "video",
      src,
      poster: posterIsFile ? undefined : (editorialImage(fm.heroPoster, images) ?? undefined),
      posterSrc: posterIsFile ? fm.heroPoster : undefined,
      ratio: Number(fm.heroRatio) || 16 / 9,
      alt,
    };
  } else if (fm.hero) {
    const img = editorialImage(fm.hero, images);
    if (!img) throw new Error(`Editorial case "${fm.slug ?? fm.title}": hero image not found in library`);
    hero = { type: "image", image: img };
  } else if (fm.film) {
    hero = null;
  } else {
    throw new Error(`Editorial case "${fm.slug ?? fm.title}": no hero, heroVideo or film`);
  }

  const rows: CaseEditorialRow[] = [];
  for (const raw of numbered(fm, "row")) {
    const [spec, ...imgs] = raw.split("|").map((s) => s.trim());
    if (/^interlude$/i.test(spec)) {
      rows.push({ kind: "interlude" });
      continue;
    }
    // `rowN: film [<ratio>] | <src> :: <poster>`: a loop, landscape or
    // vertical, sized like a hero film (centered, capped to the viewport).
    const film = spec.match(/^film(?:\s+(\d+(?:\.\d+)?))?(\s+sound)?$/i);
    if (film && imgs[0]) {
      const [src, poster, label, head, text] = imgs[0].split("::").map((s) => s.trim());
      rows.push({
        kind: "film",
        src,
        poster: poster || undefined,
        ratio: Number(film[1]) || 16 / 9,
        sound: !!film[2],
        label: label || undefined,
        note: head && text ? { head, text } : undefined,
      });
      continue;
    }
    const resolved = imgs.map((r) => editorialImage(r, images)).filter((x): x is CaseEditorialImage => !!x);
    if (resolved.length === 0) continue;
    const pair = spec.match(/^pair\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/i);
    if (pair && resolved.length >= 2) {
      rows.push({
        kind: "pair",
        images: [resolved[0], resolved[1]],
        widths: [Number(pair[1]), Number(pair[2])],
      });
      continue;
    }
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

  const outcomeText = section("outcome");
  const quoteRaw = fm.quote ? fm.quote.split("::").map((s) => s.trim()) : null;
  const outcome =
    outcomeText.length > 0 || quoteRaw
      ? {
          text: outcomeText,
          quote: quoteRaw ? { text: quoteRaw[0], by: quoteRaw[1] ?? "" } : undefined,
        }
      : undefined;

  const filmRaw = fm.film ? fm.film.split("::").map((s) => s.trim()) : null;

  return {
    hero,
    film: filmRaw
      ? {
          src: filmRaw[0],
          poster: filmRaw[1] || undefined,
          ratio: Number(fm.filmRatio) || 16 / 9,
          label: filmRaw[2] || undefined,
        }
      : undefined,
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
    outcome,
    next: nextRaw ? { slug: nextRaw[0], title: nextRaw[1] ?? nextRaw[0] } : null,
    closingIndex: closing.some((c) => c.toLowerCase() === "index"),
    closingIndexImages: numbered(fm, "index")
      .map((r) => editorialImage(r, images))
      .filter((x): x is CaseEditorialImage => !!x),
    closingBw: bwSpec ? editorialImage(bwSpec.slice(3).trim(), images) : null,
  };
}


/** `<master> :: <alt> :: <credit>` → magazine image, or null when missing. */
function magazineImage(raw: string | undefined, images: JournalImage[]): CaseMagazineImage | null {
  if (!raw) return null;
  const parts = raw.split("::").map((s) => s.trim());
  const base = editorialImage(parts.slice(0, 2).join(" :: "), images);
  if (!base) return null;
  return parts[2] ? { ...base, credit: parts[2] } : base;
}

const isQuoteItem = (item: string) => /^[“"']/.test(item);
const stripQuotes = (item: string) => item.replace(/^[“"']+|[”"']+$/g, "").trim();

/** The words of a sheet from its body section: `- value :: label` lines
 *  are figures, a `> ...` paragraph is a quote, the rest are paragraphs. */
function magazineWords(paragraphs: string[]): {
  figures: CaseMagazineFigure[];
  text: string[];
  quote?: string;
  /** `> “words” :: who said them` */
  quoteBy?: string;
} {
  const figures: CaseMagazineFigure[] = [];
  const text: string[] = [];
  let quote: string | undefined;
  let quoteBy: string | undefined;
  for (const p of paragraphs) {
    const lines = p.split(/\r?\n/).map((l) => l.trim());
    if (lines.every((l) => l.startsWith("- "))) {
      for (const l of lines) {
        const [value, label = ""] = l.slice(2).split("::").map((s) => s.trim());
        figures.push({ value, label });
      }
    } else if (p.startsWith("> ")) {
      const [q, by] = lines
        .map((l) => l.replace(/^>\s?/, ""))
        .join(" ")
        .split("::")
        .map((x) => x.trim());
      quote = stripQuotes(q);
      quoteBy = by || undefined;
    } else {
      text.push(p);
    }
  }
  return { figures, text, quote, quoteBy };
}

/**
 * Magazine template frontmatter (01-plantilla-v4.md):
 *   hero: <master> :: <alt>            or   heroVideo: <src> :: <alt> (+ heroPoster: </file>, heroRatio:)
 *   kicker: The Residential Collection · No. 02 · New York, 2022
 *   titleSize: short | long            (short for Ranu, The Point; default long)
 *   summary: <one sentence>
 *   introImage: <master> :: <alt>
 *   sheetN: <label> :: <value>
 *   byline: <client> · <year>          (the Next band's second line, optional)
 *   pageN: <type> [modifier] | <item> | <item> ...
 *     bleed | img                      bleed-two | img | img
 *     plate | img                      plates | img | img | img
 *     pair [small-first] | big | small
 *     color [left|right|center] | img [| img]
 *     band | big | small               dark | img [| “quote”]
 *     quote | img | “quote” [:: cite]
 *     text [under] | diagram :: alt :: credit [| right img ...]   (+ body "## Page N")
 *     plate-bleed | left | right       film [<ratio>] | <src> :: <poster src>
 *     afterward                        (+ body "## Afterward")
 *   indexN: index/<master> :: <alt>
 * Body: "## Intro" (two paragraphs), "## Page N", "## Afterward".
 */
function parseMagazine(fm: Record<string, string>, body: string, images: JournalImage[]): CaseMagazine {
  const sections = parseSections(body);
  const section = (name: string) =>
    sections.find((s) => s.heading.toLowerCase() === name.toLowerCase())?.paragraphs ?? [];
  const name = fm.slug ?? fm.title;

  let hero: CaseMagazine["hero"];
  if (fm.heroVideo) {
    const [src, alt = ""] = fm.heroVideo.split("::").map((s) => s.trim());
    hero = { type: "video", src, posterSrc: fm.heroPoster, ratio: Number(fm.heroRatio) || 16 / 9, alt };
  } else {
    const img = magazineImage(fm.hero, images);
    if (!img) throw new Error(`Magazine case "${name}": hero image not found in library`);
    hero = { type: "image", image: img };
  }

  const pages: CaseMagazinePage[] = [];
  numbered(fm, "page").forEach((raw, idx) => {
    const n = idx + 1;
    const [spec, ...items] = raw.split("|").map((s) => s.trim());
    const [type, ...mods] = spec.toLowerCase().split(/\s+/);
    const imgs = items
      .filter((i) => !isQuoteItem(i))
      .map((i) => magazineImage(i, images))
      .filter((x): x is CaseMagazineImage => !!x);
    const quoteItem = items.find(isQuoteItem);
    const quoteParts = quoteItem ? quoteItem.split("::").map((s) => s.trim()) : null;
    const need = (k: number) => {
      if (imgs.length < k)
        throw new Error(`Magazine case "${name}", page ${n} (${type}): needs ${k} image(s), found ${imgs.length}`);
    };
    switch (type) {
      case "bleed":
        need(1);
        pages.push({ kind: "bleed", image: imgs[0] });
        break;
      case "bleed-two":
        need(2);
        pages.push({ kind: "bleed-two", images: imgs.slice(0, 2) });
        break;
      case "plate":
        need(1);
        pages.push({ kind: "plate", image: imgs[0] });
        break;
      case "plates":
        need(2);
        pages.push({ kind: "plates", images: imgs.slice(0, 3) });
        break;
      case "pair":
        need(2);
        pages.push({ kind: "pair", big: imgs[0], small: imgs[1], smallFirst: mods.includes("small-first") });
        break;
      case "color": {
        need(1);
        const align = mods.includes("right") ? "right" : mods.includes("center") ? "center" : "left";
        pages.push({ kind: "color", images: imgs.slice(0, 2), align: imgs.length > 1 ? "center" : align });
        break;
      }
      case "band":
        need(2);
        pages.push({ kind: "band", big: imgs[0], small: imgs[1] });
        break;
      case "dark":
        need(1);
        pages.push({
          kind: "dark",
          image: imgs[0],
          quote: quoteParts ? stripQuotes(quoteParts[0]) : undefined,
          cite: quoteParts?.[1] || undefined,
        });
        break;
      case "quote":
        need(1);
        if (!quoteParts) throw new Error(`Magazine case "${name}", page ${n}: quote sheet without a quote`);
        pages.push({ kind: "quote", image: imgs[0], quote: stripQuotes(quoteParts[0]), cite: quoteParts[1] || undefined });
        break;
      case "text": {
        const words = magazineWords(section(`Page ${n}`));
        const under = mods.includes("under") ? imgs[0] : undefined;
        pages.push({
          kind: "text",
          figures: words.figures,
          text: words.text,
          quote: words.quote,
          quoteBy: words.quoteBy,
          under,
          right: under ? imgs.slice(1) : imgs,
        });
        break;
      }
      case "plate-bleed":
        need(2);
        pages.push({ kind: "plate-bleed", left: imgs[0], right: imgs[1] });
        break;
      case "film": {
        const [src, poster] = (items[0] ?? "").split("::").map((s) => s.trim());
        // No existence check against public/ here: a dynamic fs path under
        // public/ makes Vercel's file tracing bundle the whole folder (800 MB
        // of image derivatives) into the preview function. The file names a
        // film that is already in public/video.
        if (src) {
          pages.push({ kind: "film", src, poster: poster || undefined, ratio: Number(mods[0]) || 9 / 16 });
        }
        break;
      }
      case "afterward": {
        const words = magazineWords(section("Afterward"));
        pages.push({
          kind: "afterward",
          text: words.text,
          figures: words.figures,
          quote: words.quote ? { text: words.quote, by: words.quoteBy } : undefined,
        });
        break;
      }
      default:
        throw new Error(`Magazine case "${name}", page ${n}: unknown sheet type "${type}"`);
    }
  });

  return {
    hero,
    kicker: fm.kicker ?? "",
    titleSize: fm.titleSize === "short" ? "short" : "long",
    summary: fm.summary ?? fm.subtitle ?? "",
    sheet: numbered(fm, "sheet").map((c) => {
      const [label, value = ""] = c.split("::").map((s) => s.trim());
      return { label, value };
    }),
    intro: section("intro"),
    introImage: magazineImage(fm.introImage, images),
    pages,
    index: numbered(fm, "index")
      .map((r) => magazineImage(r, images))
      .filter((x): x is CaseMagazineImage => !!x),
    byline: fm.byline || undefined,
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

/** Sanity cards keep their cover, but the NAME the library and the mega
 *  menu show is the repo case study's whenever one exists for the slug:
 *  the detail page renders the repo file, so the card must agree with it
 *  (Raghsa Tower became Ranu in the v4 pack while the Sanity doc kept the
 *  old title). Year and subtitle follow for the same reason. */
export function withDraftTitles(projects: Project[]): Project[] {
  return projects.map((p) => {
    const d = getCaseDraft(p.slug);
    if (!d) return p;
    return {
      ...p,
      title: d.title,
      year: d.year ?? p.year,
      subtitle: d.subtitle ?? p.subtitle,
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
    fm.template === "editorial" && (fm.heroVideo || fm.film || editorialImage(fm.hero, images))
      ? parseEditorial(fm, body, images)
      : undefined;
  const magazine =
    fm.template === "magazine" && (fm.heroVideo || editorialImage(fm.hero, images))
      ? parseMagazine(fm, body, images)
      : undefined;

  // Editorial files carry no imgN slots: expose hero + rows as slots so the
  // library cards and the home shelf keep resolving a cover from slot 1.
  if (editorial && slots.length === 0) {
    const all: CaseEditorialImage[] = [];
    if (editorial.hero?.type === "image") all.push(editorial.hero.image);
    else if (editorial.hero?.poster) all.push(editorial.hero.poster);
    for (const r of editorial.rows) {
      if (r.kind === "justified" || r.kind === "pair") all.push(...r.images);
      else if (r.kind === "loose") all.push(r.image);
    }
    all.forEach((e, i) => slots.push({ n: i + 1, image: e.image, label: e.alt }));
  }
  // Magazine files likewise: the hero, then every sheet image in order.
  if (magazine && slots.length === 0) {
    const all: CaseEditorialImage[] = [];
    if (magazine.hero.type === "image") all.push(magazine.hero.image);
    if (magazine.introImage) all.push(magazine.introImage);
    for (const p of magazine.pages) {
      if ("image" in p) all.push(p.image);
      if ("images" in p) all.push(...p.images);
      if ("big" in p) all.push(p.big, p.small);
      if (p.kind === "plate-bleed") all.push(p.left, p.right);
      if (p.kind === "text") all.push(...(p.under ? [p.under] : []), ...p.right);
    }
    all.forEach((e, i) => slots.push({ n: i + 1, image: e.image, label: e.alt }));
  }

  return {
    title: fm.title ?? slug,
    slug,
    description: fm.description,
    editorial,
    magazine,
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
