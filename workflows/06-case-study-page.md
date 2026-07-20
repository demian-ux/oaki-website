# Case Study Page & Sanity Load Workflow (06)

**Status:** draft (proves itself on the NY Penthouse pilot)
**Last updated:** 2026-07-02
**Owner:** whoever loads; Demi approves in preview before the page counts as done

## Purpose & when to use

Turns an approved copy doc (05 output) plus the frame set into a live case-study page: images uploaded to Sanity, six FASE documents created, one project document wiring it together, verified rendering at `/case-studies/{slug}`. Run once per project after copy approval.

## Inputs required

- The approved copy file (`{project}/copy/{project}_copy_v##.md`) with its clearance block.
- The frames, final versions (delivered stills as-is for retroactive projects; F2-graded masters for new production).
- Sanity credentials: project `l97qaqin`, dataset `production`, `SANITY_API_WRITE_TOKEN` in the repo's `.env.local` (or load by hand via `/studio`).

## Tools & models

- Sanity HTTP API: asset upload (`/v2021-06-07/assets/images/production?filename=...`) then one mutate transaction (`createOrReplace`). Or Sanity Studio by hand; the API path is documented because it is reproducible.
- Local dev server for verification (`/case-studies/{slug}`; ISR ~10s in dev).

## Procedure

1. Rename-at-upload per F3 (`{project}_{fase}_{subject}_v##.jpg`); originals stay untouched in `source/`.
2. Upload every frame once; record each returned asset `_id`. A frame used in two phases references the same asset.
3. Create the six `phase` documents, ids `phase-{slug}-00` … `-05`. Field mapping from the copy doc: phaseNumber, phaseTitle, introText = the phase body, layoutType per the layout table below, mainImage + gallery from the arc map, materials array on 03.
4. Create the `project` document, id `project-{slug}`: title, slug, collectionLabel, subtitle, coverImage (interim: the hero frame, replaced by workflow 07's book cover), heroMedia, metadata (year, city/country within the clearance exclusions, clientName + clientVisibility from the clearance block, mainGoal), introText (Vision opening), resultText (Synthesis), phases as ordered references, seoTitle/seoDescription, credits.
5. Verify: query the doc back; open `/case-studies/{slug}` in the dev server; check every phase renders, images load, credit line exact, no address leakage anywhere (alt text included).
6. Demi approves in preview. Only then does the map's row flip to "reference example exists."

### Layout table (default per phase, override per project)

| FASE | layoutType | Why |
|---|---|---|
| 00 Vision | Fullscreen | Opening statement over the establishing frame |
| 01 Spirit | Fullscreen | The city frame carries it alone |
| 02 Human Trace | Image Grid | Several rooms in daily use |
| 03 Detail | Material Study | Macro grid + materials captions |
| 04 Experience | Horizontal Gallery | Hero views as a strip |
| 05 Synthesis | Contact Sheet | The closing index, all frames small |

## Quality bar

Page renders with zero console errors; every image has alt text (no address in alts); credit line verbatim from the clearance block; clientVisibility set per clearance; the copy on the page matches the approved file character for character.

## Output spec

Published Sanity documents (`project-{slug}` + six `phase-{slug}-NN`), assets named per F3, page live at `/case-studies/{slug}`.

## Reference example

NY Penthouse, loaded 2026-07-02: 10 assets uploaded (F3 names), docs `phase-ny-penthouse-00`…`-05` + `project-ny-penthouse` in one transaction (script pattern preserved in the session scratchpad, reproducible from this doc's procedure). Verified live at `/case-studies/ny-penthouse`: h1, all six FASES in order, 19 Sanity images, credit verbatim, zero address leakage, zero console errors.

## Known failure modes / gotchas

- Sanity fields override code fallbacks; once loaded, code-side copy edits do nothing (known project gotcha).
- Draft docs (`drafts.` prefix) do not render on the public list; publish (create without the prefix) or the book will not appear.
- ISR: allow ~10s after a write before concluding the page is broken.
- Uploading spaces/unicode filenames breaks searchability; rename at upload (F3).
- NDA check happens at 04, not here; this workflow trusts the clearance block it is handed.

## Open questions

- Whether `coverImage` should stay the interim hero frame or wait for the 07 book cover before the project goes `featured`. Current call: interim allowed, `featured` false until the real cover lands.
