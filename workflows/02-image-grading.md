# Image Grading Standard: the oaki frame (F2)

**Status:** draft (becomes proven when the NY Penthouse pilot ships through it)
**Last updated:** 2026-07-02
**Owner:** Diego (QA authority per delivery); Demian arbitrates taste disputes

## Purpose & when to use

One documented look applied to every still that leaves the studio, so the site, the books, and the feed read as one hand. Run on every render before it becomes a web asset, book page, cover, mockup screen, or i2v source. The grade is applied ONCE at the master; web-side color treatments (the services grey-to-color ramp, hover desaturation) are code-side CSS filters on top and never baked into files.

## The look, named

Reference frames: `NY Penthouse/Living.jpg` (golden-hour interior) and `NY Penthouse/terrace night pool2.jpg` (blue-hour exterior with human presence). The five properties, per the showreel rules and DS 4.1:

1. **Warm-biased light.** Golden hour and blue hour over neutral noon. Whites lean toward gris #F4F3F0, never clinical.
2. **Lush but disciplined color.** Color-confident, not oversaturated. One warm accent family per frame (echoing the ocre contract: one identifier, used sparingly).
3. **Refined materials.** Texture is the subject: fabric weave, stone veining, wood grain must survive compression. If material detail reads mushy at full-bleed, the frame fails.
4. **Editorial restraint.** No HDR crunch, no trend grading (no current-darkness, no ultra-saturation), no vignette heavier than what a lens does. The frame must look deliberate in five years.
5. **Soft blacks.** Shadows resolve toward #222222-family, never #000. Lift the black point; the negro rule applies to images, not just UI.

## Inputs required

- Corona render from the archive or a fresh pass, minimum 3000px on the long edge for stills, larger for covers (see 07-book-cover when it exists).
- The project's FASES phase (00-05): phase changes emphasis, not the grade. Detail/macro frames (03) push property 3; Experience heroes (04) balance all five.

## Tools & models

- 3ds Max + Corona (source; Corona VFB tone mapping as the first grade pass).
- Photoshop + Firefly (cleanup, entourage fixes; Camera Raw filter for the grade).
- Magnific (or Pulze Project Dream's integrated Creative Upscale) for enhancement/upscale where the source lacks resolution or material detail. Settings live in the prompt-templates section; W1 bake-off numbers replace the placeholders.
- NEVER let the enhancer restyle: architecture is the client's design. Resemblance stays high; creativity stays low.

## Procedure

1. Select the frame; confirm phase and end use (web, cover, mockup screen, i2v source).
2. Corona VFB: white balance to warm bias, highlight compression until no clipped whites, LUT off (no baked trend looks).
3. If resolution or micro-detail is short: enhance (Magnific-class). Start Creativity low / Resemblance high / Architecture mode; inspect verticals and mullions at 100% before accepting.
4. Photoshop grade: lift black point to ~#1E-#26 range, warm the midtones, cap saturation so no channel clips, check whites lean gris not blue.
5. The two-frame test: place the frame beside `Living.jpg` and `terrace night pool2.jpg`. Same family? Ship. Different movie? Regrade.
6. Export master (see Output spec), then derive web sizes via the sharp step (A2/06 doc).

## Prompt templates / parameters

<!-- Fill with the W1 bake-off winners: exact Magnific/Project Dream sliders, upscale factor, PS Camera Raw values. Placeholders below are starting points, not the standard. -->
- Magnific-class: Creativity {low}, Resemblance {high}, Fractality {low-mid}, Architecture mode ON, prompt "{material emphasis}, architectural photography, no added geometry".

## Quality bar

Reject if: any vertical bows or mullion melts (enhancer artifact); blacks at #000 or whites clipped; saturation reads louder than the reference pair; material texture gone plastic; entourage or context invented that the model did not contain; the grade would date the frame (trend look). Accept only what passes the two-frame test at 100% AND at thumbnail.

## Output spec

- Master: full-resolution JPG quality 95+ (or TIFF for covers), sRGB, named per F3, stored in the project archive `master/` folder.
- Web derivatives: sharp-optimized JPG ~150-200KB, sizes per use (covers, FASES media, OG 1200x630).

## Time & cost estimate

<!-- Fill after the pilot: minutes per frame warm, enhancer credits per frame. -->

## Reference example

`NY Penthouse/Living.jpg` and `terrace night pool2.jpg` define the look. First asset produced THROUGH this doc: pending (NY Penthouse pilot cover).

## Known failure modes / gotchas

- Enhancers invent geometry at high creativity: always 100% inspection of straight lines before accepting.
- Grading to the laptop: check on a phone in daylight; the warm bias collapses to muddy on bad screens if midtones are too dense.
- Double-grading: web CSS filters (services ramp, hover desaturate) stack on the master. If a frame looks wrong on the site but right in the file, check the code-side filter before regrading.
- Night frames: blue hour holds the warm-bias rule through the window light (see the terrace reference), not the sky.

## Open questions

- Exact enhancer + settings: decided by the W1 bake-off (PRODUCTION_PLAN_2026-07.md).
- Do covers get a stronger treatment than in-page frames? Decide during the NY Penthouse pilot cover.
