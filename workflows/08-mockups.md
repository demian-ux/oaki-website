# Mockup Generation Workflow (08)

**Status:** proven (CSS lane on NY Penthouse 2026-07-02; AI lane first run 2026-07-13 — tool decided, see lane B)
**Last updated:** 2026-07-13
**Owner:** whoever produces; Diego QA on geometry (spines and bezels amplify errors)

## Purpose & when to use

Turns finished flat assets (covers from 07, graded stills from F2, film clips from 10) into presentation objects: books, devices with the work on screen, brochures, magazines, posters, business cards, street publicity. Used on case-study pages, the homepage (iPad/iMac tasks T2/T3), social, and pitches. Mockups always present REAL assets; a mockup of placeholder content is banned (it publishes a promise nobody approved).

## The three lanes

| Lane | Tool | Use when | Cost |
|---|---|---|---|
| A. CSS stage | `public/mockups/stage.html` (this repo) | Web/social speed: book or device shot from any URL param, screenshot at 2x | Free, instant |
| B. AI photoreal | **gpt_image_2 via the Higgsfield CLI** (decided at first run, 2026-07-13). Nano Banana Pro (`nano_banana_2`) is cheaper (2 vs 7 credits) but broke book anatomy on the same brief — page block detached from the cover; keep it for scenes without constructed objects. | Print-context scenes: book on a desk, magazine spread, poster on a street wall | ~7 credits/gen (gpt_image_2, 2k, quality high) |
| C. Screen replacement | Photoshop (perspective transform) or the site's device components with `<video>` | Film/animation ON a device, pixel-accurate UI | Person-minutes |

## Inputs required

- The flat asset at final grade (07 cover, F2 still, or encoded clip). Never mock up ungraded work.
- The project's book-panel hex (locked list or auto-derive JS in `oaki-home-book-backgrounds.md`) for grounds.
- For lane B: the cover uploaded as reference image to the generator, not described in words.

## Procedure

### Lane A (CSS stage)
1. Open `/mockups/stage.html?mode=book&img=/images/05.jpg&bg=%23262A33` on the dev server (params: `mode` book|ipad, `img` any URL or site path, `bg` ground hex).
2. Set browser zoom to 200%, screenshot the stage area (or use OS capture on the region).
3. Crop and export per the social spec (10) or drop into a deck. File named per F3 (`{project}_mck_{subject}_v##`).

### Lane B (AI photoreal — Higgsfield CLI)
1. Auth once per session: `higgsfield auth login` (the `hf` alias has no PATH shim on the studio machine; use the full name). Check balance: `higgsfield account status`.
2. Generate with TWO reference images — a style ref (an existing approved mockup, e.g. the Windsor book) and the content ref (the 07 cover). Local paths auto-upload:
   ```
   higgsfield generate create gpt_image_2 \
     --prompt "<scene prompt>" \
     --image ./style-reference.jpg --image ./07-cover.jpg \
     --aspect_ratio 2:3 --resolution 2k --quality high --wait
   ```
   Flags are snake_case (`--aspect_ratio`, not `--aspect-ratio`). `--wait` prints the result URL. `higgsfield generate cost <model> --prompt "..."` estimates credits without running.
3. Judge with the quality bar. **Check book anatomy explicitly** (closed, spine correct, page block flush between the boards) — this is the failure that killed the nano_banana_2 attempt. Saying "CLOSED, structurally correct, page block fully flush and contained between the covers" in the prompt fixed it.
4. Photoshop pass: verify the reference asset survived unwarped; if the generator redrew the cover art, composite the real cover back over the book face with a perspective transform.
5. Crop/resize to destination format with sharp (shelf = 1100x1945), name per F3, archive to the project `master/` folder.

### Lane C (screen replacement)
1. For web: the device component takes a `<video muted autoPlay loop playsInline>` sized to the screen cutout (encode per 10's spec).
2. For stills/social: Photoshop smart object on a straight-on device photo; perspective transform to the bezel corners.

## Prompt templates / parameters (lane B)

- Book: "A hardcover book standing on a {ground_color} seamless studio ground, cover exactly as the reference image, soft single-source light from the upper left, shallow depth of field, editorial product photography, no text added, no props" + reference image = the 07 cover.
- Street: "A poster pasted on a {context: concrete wall / subway frame}, artwork exactly as the reference image, overcast daylight, straight-on view, photographic grain" + reference.
- Variables: {project}, {ground_color} (panel hex), {context}. Never describe the artwork in words; the reference image IS the artwork.

## Quality bar

Reject if: the generator redrew or "improved" the cover art (compare side by side); type on the mockup warps or ripples; spine/bezel edges bow; the ground fights the panel-hex family; any prop steals the frame. The mockup's job is to make the real asset credible, not decorative.

## Output spec

Named per F3 (`{project}_mck_{subject}_v##.jpg/png`), stored in the project `social/` or `web/` folder by destination. Web use: sharp-optimized like any still.

## Reference example

NY Penthouse book (lane A): `/mockups/stage.html?mode=book` default renders the slot-05 cover on its panel ground; verified in preview 2026-07-02.

NY Penthouse book (lane B, first run 2026-07-13): gpt_image_2, style ref = Windsor book (06.jpg), content ref = `ny-penthouse_cov_terrace-pool-night_v01.jpg`, 7 credits. Result = `ny-penthouse_mck_book-cover_v03.jpg` (master folder), live as `public/images/05.jpg` + Sanity `coverImage`. The rejected nano_banana_2 attempt is archived as v02 for comparison.

## Known failure modes / gotchas

- AI generators love re-typesetting cover art; the composite-back step (B4) exists because of this.
- Generators can break object construction (nano_banana_2 detached the page block from a closed book). Anatomy language in the prompt + explicit QA on spines/page blocks catches it — this is the Diego-QA geometry check.
- Mocking up placeholders: banned (see Purpose).
- Lane A ships in `public/` and would deploy with the site; exclude or accept at the Vercel step (flagged in the launch housekeeping sweep).
- Device mockups of the homepage on the homepage: recursion reads clever once and dated forever; use project work on screens, not the site itself.

## Open questions

- Which device frames become the T2/T3 homepage components (iPad + iMac): decide when the homepage sections that host them are confirmed.
- ~~Whether lane B settles on gpt-image-2 or Firefly~~ **Decided 2026-07-13: gpt_image_2 on Higgsfield** (see lane B). Revisit only if a scene type emerges where it underperforms.
