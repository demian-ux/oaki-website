#!/usr/bin/env node
/**
 * Load reviewed journal drafts from content/journal/*.md into Sanity as
 * journalPost documents (published: false — they go live from Studio).
 *
 * Idempotent: deterministic _id ("journalPost-<slug>") + createOrReplace,
 * and Sanity content-addresses uploaded assets, so re-running after edits
 * is safe.
 *
 * Markdown subset: paragraphs, ## h2, ### h3, > blockquote, and inline
 * **bold**, *italic*, [text](url). Anything fancier: edit in Studio.
 *
 * Frontmatter (--- delimited, key: value):
 *   title:    required
 *   slug:     required (becomes /journal/<slug> and the document id)
 *   category: required — News | Craft | Film | Material | Process | Stills
 *   date:     required, YYYY-MM-DD
 *   excerpt:  recommended, 1-2 sentences
 *   cover:    path to the cover image, relative to the repo (e.g. public/images/x.jpg)
 *   coverAlt: alt text for the cover
 *   project:  optional — slug or _id of the related project document
 *   author:   optional — _id of a teamMember document
 *   dek:      recommended — the one-sentence dek under the headline (journal format)
 *   heroNote: optional — internal note describing the intended hero while the
 *             render is pending; shown as the placeholder label on previews
 *   creditN:  credit block lines, in order — "credit1: Architect :: KODA, ..."
 *             (" :: " separates label from value; the block renders verbatim)
 *   sourceN:  source line links, in order — "source1: [Label](https://...)"
 *
 * Usage:  node scripts/load-journal.mjs            (loads every .md)
 *         node scripts/load-journal.mjs my-slug    (loads content/journal/my-slug.md)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const contentDir = resolve(root, "content", "journal");
const envPath = resolve(root, ".env.local");

// Manually parse .env.local — avoids adding a runtime dep
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let [, key, val] = m;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch (e) {
    console.error("Could not read .env.local at", envPath);
    throw e;
  }
  return env;
}

const env = loadEnv();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const apiBase = `https://${projectId}.api.sanity.io/v${apiVersion}`;
const CATEGORIES = ["News", "Craft", "Film", "Material", "Process", "Stills"];

// ── Markdown → Portable Text ──────────────────────────────

/** Inline subset: **bold**, *italic*, [text](url) → spans with marks/markDefs. */
function parseInline(text, keyBase) {
  const children = [];
  const markDefs = [];
  let rest = text;
  let i = 0;
  const token = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/;
  while (rest.length > 0) {
    const m = rest.match(token);
    if (!m) {
      children.push({ _type: "span", _key: `${keyBase}-s${i++}`, text: rest, marks: [] });
      break;
    }
    if (m.index > 0) {
      children.push({
        _type: "span",
        _key: `${keyBase}-s${i++}`,
        text: rest.slice(0, m.index),
        marks: [],
      });
    }
    if (m[2] !== undefined) {
      children.push({ _type: "span", _key: `${keyBase}-s${i++}`, text: m[2], marks: ["strong"] });
    } else if (m[3] !== undefined) {
      children.push({ _type: "span", _key: `${keyBase}-s${i++}`, text: m[3], marks: ["em"] });
    } else {
      const defKey = `${keyBase}-l${i}`;
      markDefs.push({ _type: "link", _key: defKey, href: m[5] });
      children.push({ _type: "span", _key: `${keyBase}-s${i++}`, text: m[4], marks: [defKey] });
    }
    rest = rest.slice(m.index + m[0].length);
  }
  if (children.length === 0) {
    children.push({ _type: "span", _key: `${keyBase}-s0`, text: "", marks: [] });
  }
  return { children, markDefs };
}

function block(style, text, keyBase) {
  const { children, markDefs } = parseInline(text, keyBase);
  return { _type: "block", _key: keyBase, style, markDefs, children };
}

/** Blank-line-separated chunks; ## / ### / > prefixes pick the block style. */
function mdToPortableText(md, slug) {
  const chunks = md
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean);
  return chunks.map((chunk, idx) => {
    const keyBase = `${slug}-b${idx}`;
    if (chunk.startsWith("### ")) {
      return block("h3", chunk.slice(4).replace(/\n/g, " ").trim(), keyBase);
    }
    if (chunk.startsWith("## ")) {
      return block("h2", chunk.slice(3).replace(/\n/g, " ").trim(), keyBase);
    }
    if (chunk.startsWith("> ")) {
      const text = chunk
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join(" ")
        .trim();
      return block("blockquote", text, keyBase);
    }
    return block("normal", chunk.replace(/\n/g, " ").trim(), keyBase);
  });
}

// ── Frontmatter ───────────────────────────────────────────

function parseFile(path) {
  const raw = readFileSync(path, "utf-8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${basename(path)}: missing --- frontmatter block`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][A-Za-z0-9]*)\s*:\s*(.*?)\s*$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  return { meta, body: m[2].trim() };
}

// ── Sanity API helpers ────────────────────────────────────

async function sanityQuery(query, params = {}) {
  const qs = new URLSearchParams({ query });
  for (const [k, v] of Object.entries(params)) qs.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(`${apiBase}/data/query/${dataset}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Query failed: ${JSON.stringify(json)}`);
  return json.result;
}

async function uploadImage(filePath) {
  const abs = resolve(root, filePath);
  if (!existsSync(abs)) throw new Error(`Cover not found: ${filePath}`);
  const ext = extname(abs).slice(1).toLowerCase();
  const mime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[ext];
  if (!mime) throw new Error(`Unsupported cover type .${ext}: ${filePath}`);
  const res = await fetch(
    `${apiBase}/assets/images/${dataset}?filename=${encodeURIComponent(basename(abs))}`,
    {
      method: "POST",
      headers: { "Content-Type": mime, Authorization: `Bearer ${token}` },
      body: readFileSync(abs),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Asset upload failed: ${JSON.stringify(json)}`);
  return json.document._id;
}

async function resolveProjectRef(idOrSlug) {
  // Accept a raw document _id or a project slug.
  const byId = await sanityQuery(`*[_type == "project" && _id == $v][0]._id`, { v: idOrSlug });
  if (byId) return byId;
  const bySlug = await sanityQuery(`*[_type == "project" && slug.current == $v][0]._id`, {
    v: idOrSlug,
  });
  if (bySlug) return bySlug;
  throw new Error(`Related project not found (tried _id and slug): ${idOrSlug}`);
}

// ── Build + push ──────────────────────────────────────────

const args = process.argv.slice(2);
if (!existsSync(contentDir)) {
  console.error(`No drafts folder at ${contentDir}. Create content/journal/ and add .md files.`);
  process.exit(1);
}
let files = readdirSync(contentDir).filter((f) => f.endsWith(".md"));
if (args.length > 0) {
  files = files.filter((f) => args.includes(basename(f, ".md")));
  if (files.length === 0) {
    console.error(`No matching drafts for: ${args.join(", ")}`);
    process.exit(1);
  }
}
if (files.length === 0) {
  console.error(`No .md drafts in ${contentDir}.`);
  process.exit(1);
}

const docs = [];
for (const file of files) {
  const { meta, body } = parseFile(resolve(contentDir, file));
  for (const req of ["title", "slug", "category", "date"]) {
    if (!meta[req]) throw new Error(`${file}: missing required frontmatter "${req}"`);
  }
  if (!CATEGORIES.includes(meta.category)) {
    throw new Error(`${file}: category "${meta.category}" not in ${CATEGORIES.join(" | ")}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
    throw new Error(`${file}: date must be YYYY-MM-DD, got "${meta.date}"`);
  }
  // Credits are exempt: year ranges there ("2023–2024") are data, not prose.
  if (/—|–/.test(`${meta.title} ${meta.excerpt ?? ""} ${meta.dek ?? ""} ${body}`)) {
    throw new Error(`${file}: em/en dash found — the brand voice forbids them. Use commas or periods.`);
  }

  // Ordered numbered keys: creditN → credits[], sourceN → sourceLinks[]
  const numbered = (prefix) =>
    Object.keys(meta)
      .filter((k) => new RegExp(`^${prefix}\\d+$`).test(k))
      .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)))
      .map((k) => meta[k]);
  const credits = numbered("credit").map((line, i) => {
    const m = line.match(/^(.*?)\s*::\s*(.*)$/);
    if (!m) throw new Error(`${file}: credit line needs "Label :: value", got "${line}"`);
    return { _key: `credit-${i}`, label: m[1], value: m[2] };
  });
  const sourceLinks = numbered("source").map((line, i) => {
    const m = line.match(/^\[(.+?)\]\((.+?)\)$/);
    if (!m) throw new Error(`${file}: source line needs "[Label](url)", got "${line}"`);
    return { _key: `source-${i}`, label: m[1], url: m[2] };
  });

  const doc = {
    _id: `journalPost-${meta.slug}`,
    _type: "journalPost",
    title: meta.title,
    slug: { _type: "slug", current: meta.slug },
    category: meta.category,
    date: meta.date,
    published: false,
    body: mdToPortableText(body, meta.slug),
  };
  if (meta.excerpt) doc.excerpt = meta.excerpt;
  if (meta.dek) doc.dek = meta.dek;
  if (meta.heroNote) doc.heroNote = meta.heroNote;
  if (credits.length > 0) doc.credits = credits;
  if (sourceLinks.length > 0) doc.sourceLinks = sourceLinks;
  if (meta.seoTitle) doc.seoTitle = meta.seoTitle;
  if (meta.seoDescription) doc.seoDescription = meta.seoDescription;

  if (meta.cover) {
    console.log(`  ↑ uploading cover for ${meta.slug}: ${meta.cover}`);
    const assetId = await uploadImage(meta.cover);
    doc.coverImage = {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
      ...(meta.coverAlt ? { alt: meta.coverAlt } : {}),
    };
  }
  if (meta.project) {
    const projectRefId = await resolveProjectRef(meta.project);
    doc.project = { _type: "reference", _ref: projectRefId };
  }
  if (meta.author) {
    doc.author = { _type: "reference", _ref: meta.author };
  }
  docs.push(doc);
}

const mutations = docs.map((doc) => ({ createOrReplace: doc }));
console.log(`Loading ${docs.length} journal draft(s) → ${dataset} (${projectId})`);

try {
  const res = await fetch(`${apiBase}/data/mutate/${dataset}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("✗ Sanity rejected:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  (json.results || []).forEach((r) => console.log(`  ✓ ${r.operation} ${r.id}`));
  console.log(
    `\nDone. Drafts are unpublished — review in /studio → Journal → Drafts, then tick Published.`
  );
} catch (e) {
  console.error("✗ Network error:", e.message);
  process.exit(1);
}
