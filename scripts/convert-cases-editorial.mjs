#!/usr/bin/env node
/**
 * One-off: convert content/cases/*.md from the ten-slot draft format to the
 * editorial template (template: editorial). Keeps every existing field and
 * the Setup/Tension/Approach/Outcome prose, adds hero / introImage / sheet /
 * rows / next and a "## Intro" of two paragraphs drawn from Setup + Approach.
 * Rows follow each image's ratio: landscapes full width (every third one
 * loose at 60%), portraits grouped two or three to a row sharing a height,
 * a lone portrait as a loose image. Files that already carry
 * template: editorial, or have no library image for a hero, are left alone.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(root, "content", "cases");
const HIDDEN = new Set([
  "goldman",
  "level-shoes",
  "icrave-ballys-chicago",
  "icrave-sapphire",
  "icrave-southwest",
  "dixon-house",
]);

const parse = (raw) => {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const fm = [];
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) fm.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
  }
  return { fm, body: m[2] };
};
const get = (fm, k) => fm.find(([key]) => key === k)?.[1];
const numbered = (fm, prefix) => {
  const out = [];
  for (let i = 1; get(fm, `${prefix}${i}`); i++) out.push(get(fm, `${prefix}${i}`));
  return out;
};
const sections = (body) => {
  const out = {};
  let cur = null;
  for (const block of body.split(/\r?\n\r?\n/)) {
    const t = block.trim();
    if (!t) continue;
    if (t.startsWith("## ")) {
      const [h, ...rest] = t.split(/\r?\n/);
      cur = h.slice(3).trim().toLowerCase();
      out[cur] = [];
      const tail = rest.join("\n").trim();
      if (tail) out[cur].push(tail);
    } else if (cur) out[cur].push(t);
  }
  return out;
};
const prose = (paras = []) => paras.filter((p) => !p.startsWith("[GAP"));
const shortCollection = (c = "") =>
  c.replace(/^the\s+/i, "").replace(/\s+collection$/i, "").trim();

const files = readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
const cases = files.map((f) => {
  const slug = f.replace(/\.md$/, "");
  const { fm, body } = parse(readFileSync(resolve(dir, f), "utf-8"));
  const project = get(fm, "imageProject");
  const manifestPath =
    project && resolve(root, "public", "images", project, "web", "manifest.json");
  const lib =
    manifestPath && existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, "utf-8")).images
      : [];
  const slots = numbered(fm, "img")
    .map((raw) => raw.split("::").map((s) => s.trim()))
    .map(([name, label]) => ({
      name,
      label: label ?? name,
      image: name !== "GAP" ? lib.find((i) => i.name === name) : null,
    }))
    .filter((s) => s.image);
  return { slug, f, fm, body, slots, title: get(fm, "title") ?? slug };
});

// Next-project ring: visible cases with images, in listing order.
const ring = cases.filter((c) => c.slots.length > 0 && !HIDDEN.has(c.slug));
const nextOf = (slug) => {
  const i = ring.findIndex((c) => c.slug === slug);
  const n = i === -1 ? ring[0] : ring[(i + 1) % ring.length];
  return n && n.slug !== slug ? n : null;
};

let converted = 0;
for (const c of cases) {
  if (get(c.fm, "template") === "editorial") continue;
  if (c.slots.length === 0) {
    console.log(`skip  ${c.slug}: no library image for a hero`);
    continue;
  }
  const ratio = (s) => s.image.naturalWidth / s.image.naturalHeight;
  const [hero, ...rest] = c.slots;
  const introIdx = rest.findIndex((s) => ratio(s) < 0.9);
  const intro = introIdx >= 0 ? rest.splice(introIdx, 1)[0] : null;

  const rows = [];
  let portraits = [];
  const flush = () => {
    if (portraits.length === 0) return;
    if (portraits.length === 1) {
      rows.push(`${rows.length % 2 === 0 ? "44% left" : "44% center"} | ${portraits[0]}`);
    } else rows.push(`full | ${portraits.join(" | ")}`);
    portraits = [];
  };
  let landscapes = 0;
  for (const s of rest) {
    const spec = `${s.name} :: ${s.label}`;
    if (ratio(s) < 1.2) {
      portraits.push(spec);
      if (portraits.length === 3) flush();
    } else {
      flush();
      landscapes++;
      rows.push(landscapes % 3 === 0 ? `60% center | ${spec}` : `full | ${spec}`);
    }
  }
  flush();
  const video = get(c.fm, "video");
  if (video) {
    const src = video.split("::")[0].trim();
    const poster = get(c.fm, "videoPoster");
    rows.push(poster ? `film | ${src} :: ${poster}` : `film | ${src}`);
  }

  // Sheet: credits as given; Collection after Location; Year ensured.
  const credits = numbered(c.fm, "credit").map((x) => x.split("::").map((s) => s.trim()));
  const collection = shortCollection(get(c.fm, "collection"));
  const location = get(c.fm, "location");
  const pending = (v = "") => /PENDING|GAP|Undisclosed/i.test(v);
  const sheet = [];
  let hasCollection = false;
  for (const [label, value] of credits) {
    if (pending(value)) continue;
    sheet.push([label, value]);
    if (/^location$/i.test(label) && collection) {
      sheet.push(["Collection", collection]);
      hasCollection = true;
    }
  }
  if (!sheet.some(([l]) => /^location$/i.test(l)) && location && !pending(location)) {
    sheet.splice(1, 0, ["Location", location]);
    if (collection) {
      sheet.splice(2, 0, ["Collection", collection]);
      hasCollection = true;
    }
  }
  if (!hasCollection && collection) sheet.splice(1, 0, ["Collection", collection]);
  const year = get(c.fm, "year");
  if (!sheet.some(([l]) => /^year$/i.test(l)) && year && !pending(year)) {
    const vis = sheet.findIndex(([l]) => /^visualization$/i.test(l));
    sheet.splice(vis === -1 ? sheet.length : vis, 0, ["Year", year]);
  }

  const sec = sections(c.body);
  const p1 = prose(sec.setup)[0] ?? prose(sec.tension)[0] ?? "";
  const p2 = prose(sec.approach)[0] ?? prose(sec.outcome)[0] ?? prose(sec.tension)[1] ?? "";
  const next = nextOf(c.slug);

  const add = [["template", "editorial"]];
  if (!get(c.fm, "description") && get(c.fm, "subtitle")) add.push(["description", get(c.fm, "subtitle")]);
  add.push(["hero", `${hero.name} :: ${hero.label}`]);
  if (intro) add.push(["introImage", `${intro.name} :: ${intro.label}`]);
  sheet.forEach(([l, v], i) => add.push([`sheet${i + 1}`, `${l} :: ${v}`]));
  rows.forEach((r, i) => add.push([`row${i + 1}`, r]));
  if (next) add.push(["next", `${next.slug} :: ${next.title}`]);
  add.push(["closing", "next"]);

  const at = c.fm.findIndex(([k]) => k === "imageProject") + 1;
  const fm = [...c.fm.slice(0, at), ...add, ...c.fm.slice(at)];
  const front = fm.map(([k, v]) => `${k}: ${v}`).join("\n");
  const out = `---\n${front}\n---\n## Intro\n${p1}\n\n${p2}\n\n${c.body.trimStart()}`.replace(/\n*$/, "\n");
  writeFileSync(resolve(dir, c.f), out);
  converted++;
  console.log(
    `ok    ${c.slug}: hero=${hero.name}; intro=${intro?.name ?? "-"}; rows=${rows.length}; next=${next?.slug ?? "-"}`
  );
}
console.log(`\n${converted} converted.`);
