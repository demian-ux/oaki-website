#!/usr/bin/env node
/**
 * Site-wide image library pipeline: images/<project-slug>/original/** (4K
 * masters, optionally in set subfolders like maison-rive-gauche/stills/) →
 * public/images/<project-slug>/web/ (AVIF primary + WebP fallback at
 * 3840 / 1920 / 960 wide, sRGB, metadata stripped) + manifest.json with
 * natural dimensions for never-crop rendering.
 *
 * Journal articles, case studies, and the homepage all reference this one
 * library; masters load once per project, never per piece.
 *
 * Idempotent: an output newer than its master is skipped; a changed master
 * regenerates; outputs whose master is gone are deleted. web/ is generated
 * only — never hand-edit it.
 *
 * Usage:  node scripts/optimize-images.mjs                (all projects)
 *         node scripts/optimize-images.mjs oak-house      (one project)
 */
import { readdirSync, statSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename, extname, join } from "node:path";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mastersRoot = resolve(root, "images");
const webRoot = resolve(root, "public", "images");

const WIDTHS = [3840, 1920, 960];
const INPUT_EXTS = new Set([".tif", ".tiff", ".png", ".jpg", ".jpeg", ".webp"]);
// AVIF ~62 keeps a 15-25 MB 4K render around 400-900 KB at 3840 with no
// visible loss; WebP is the fallback for engines without AVIF.
const AVIF = { quality: 62 };
const WEBP = { quality: 78 };

/** All master files under dir, recursing one level of set subfolders. */
function collectMasters(dir, prefix = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      out.push(...collectMasters(join(dir, entry.name), `${prefix}${entry.name}/`));
    } else if (INPUT_EXTS.has(extname(entry.name).toLowerCase())) {
      // "stills/foo.tif" → set "stills", flat output name "stills--foo"
      out.push({ path: join(dir, entry.name), rel: `${prefix}${entry.name}` });
    }
  }
  return out;
}

const only = process.argv.slice(2);
const projects = readdirSync(mastersRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((s) => only.length === 0 || only.includes(s));

if (projects.length === 0) {
  console.error(only.length ? `No project folder matches: ${only.join(", ")}` : "No project folders.");
  process.exit(1);
}

let generated = 0;
let skipped = 0;

for (const project of projects) {
  const originalDir = resolve(mastersRoot, project, "original");
  if (!existsSync(originalDir)) continue;
  const masters = collectMasters(originalDir);
  const webDir = resolve(webRoot, project, "web");

  if (masters.length === 0) {
    if (existsSync(webDir)) {
      rmSync(resolve(webRoot, project), { recursive: true });
      console.log(`${project}: no masters, removed stale web outputs`);
    }
    continue;
  }
  mkdirSync(webDir, { recursive: true });

  const manifest = [];
  const expected = new Set(["manifest.json"]);

  for (const master of masters.sort((a, b) => a.rel.localeCompare(b.rel))) {
    const srcMtime = statSync(master.path).mtimeMs;
    const ext = extname(master.rel);
    const set = master.rel.includes("/") ? master.rel.slice(0, master.rel.indexOf("/")) : null;
    const name = basename(master.rel, ext);
    const flat = master.rel.slice(0, -ext.length).replace(/\//g, "--");

    const meta = await sharp(master.path).metadata();
    const naturalWidth = meta.width ?? 0;
    const naturalHeight = meta.height ?? 0;
    const widths = WIDTHS.filter((w) => w <= naturalWidth);
    if (widths.length === 0) widths.push(Math.min(naturalWidth, WIDTHS[WIDTHS.length - 1]));

    for (const w of widths) {
      for (const [fmt, opts] of [
        ["avif", AVIF],
        ["webp", WEBP],
      ]) {
        const outName = `${flat}-${w}.${fmt}`;
        const out = resolve(webDir, outName);
        expected.add(outName);
        if (existsSync(out) && statSync(out).mtimeMs > srcMtime) {
          skipped++;
          continue;
        }
        // rotate() bakes EXIF orientation; sharp converts tagged color
        // (Adobe RGB etc.) to sRGB on output and strips metadata by default.
        await sharp(master.path)
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .toColourspace("srgb")
          [fmt === "avif" ? "avif" : "webp"](opts)
          .toFile(out);
        generated++;
      }
    }

    const h = (w) => Math.round((naturalHeight / naturalWidth) * w);
    const src = (fmt) => (w) => ({
      width: w,
      height: h(w),
      src: `/images/${project}/web/${flat}-${w}.${fmt}`,
    });
    manifest.push({
      name,
      set,
      naturalWidth,
      naturalHeight,
      widths,
      avif: widths.map(src("avif")),
      webp: widths.map(src("webp")),
    });
  }

  for (const f of readdirSync(webDir)) {
    if (!expected.has(f)) rmSync(resolve(webDir, f));
  }

  writeFileSync(resolve(webDir, "manifest.json"), JSON.stringify({ project, images: manifest }, null, 2));
  console.log(`${project}: ${masters.length} master(s) → ${manifest.reduce((n, m) => n + m.widths.length * 2, 0)} outputs`);
}

console.log(`\nDone. ${generated} generated, ${skipped} up-to-date.`);
