# Image library (site-wide, per project)

One library for the whole site. Journal articles, case studies, and the
homepage all reference it at build time; masters load once per project and
are never duplicated across pieces.

- `<project-slug>/original/` — untouched 4K masters (TIFF / PNG / max-quality JPG). Demi loads these. Never edited, never served, never committed (gitignored); back them up elsewhere.
- `public/images/<project-slug>/web/` — GENERATED ONLY, never hand-edited. Written by the script below and committed so Vercel serves them.

No further subdivision inside `original/` except where a project has genuinely
distinct sets (e.g. `maison-rive-gauche/original/stills/` and `film/`).

Run after dropping masters in:

    node scripts/optimize-images.mjs             # all projects
    node scripts/optimize-images.mjs oak-house   # one project

For every master it emits AVIF (primary) + WebP (fallback) at 3840 / 1920 / 960
wide, converted to sRGB with metadata stripped, plus a `manifest.json` with
natural dimensions. Idempotent: outputs newer than their master are skipped, a
changed master regenerates, orphaned outputs are deleted. Re-run freely when
Diego's finals arrive.

Serving: `<picture>` + `srcset` via `JournalPicture` — hero 3840, body 1920,
index cards 960. Originals are never web-reachable.

Conventions:

- A master whose filename starts with `hero` is the project's journal hero;
  otherwise the first file (alphabetical) is. Other files render as support
  images (the journal format allows up to 3).
- Journal article slug → project slug mapping lives in
  `src/lib/journal-images.ts`.

Rules:

- `icrave-*` images are private-review only: they must never reach a public
  page or sitemap until Andrew's written OK per article.
- The whole journal/case-study layer stays noindex/unlisted until the site
  gate lifts.

## Hero/home mapping (2026-08-05)

Added for the homepage shelf: raghsa-tower, cazouls-les-bezier, ny-penthouse, windsor-residence, 803-hunter-rd.
Overlaps (confirmed by Demi, no separate folder): "Dillido Residence" (Ceiba) = maison-rive-gauche; "Manhattan Apartment" (TBD) = 2w-29th.
Case-study folders added same day: alderbrook, 2w-29th.
