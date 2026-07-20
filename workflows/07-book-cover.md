# Book Cover Workflow (07)

**Status:** draft (interim path proven on NY Penthouse; enhancement step pending the tool bake-off)
**Last updated:** 2026-07-02
**Owner:** Demian picks the frame; Diego signs the grade

## Purpose & when to use

Produces the portrait cover that represents a project as a book: on the home hero shelf (`public/images/01-07.jpg`, slot order fixed), on the library card (Sanity `coverImage`), and as the base for the OG share image (13) and print/book mockups (08). One cover per project, produced after the case study exists so the cover answers to the book behind it.

## Inputs required

- The project's frame set (F2-graded masters, or the delivered stills for retroactive projects).
- The project's shelf slot number (locked order: 01 Raghsa, 02 Cazouls, 03 Dillido, 04 Manhattan, 05 NY Penthouse, 06 Windsor, 07 803 Hunter).
- The locked book-panel hex if one exists (`oaki-home-book-backgrounds.md`; auto-derive JS for new projects, lightness fixed 19%).

## Tools & models

- sharp (in the repo's node_modules) for the crop + web export.
- Enhancement/upscale when the chosen frame is under ~2200px wide or short on material detail: the still-pipeline winner from the W1 bake-off (Project Dream / Magnific / Krea / Gigapixel; settings land in F2 once decided). Not needed when the master is already large and clean.

## Procedure

1. **Pick the frame.** The cover is the project's thesis in one image: it must survive at thumbnail (the drifting shelf) AND full-bleed. Prefer the frame a stranger would stop on; verticals must be straight (book spines amplify a leaning line).
2. **Check resolution.** Target crop is 1100x1945 (the shelf format, ratio 1:1.768). Source must be at least 1100px wide AFTER the crop; enhance first if not.
3. **Grade per F2** (delivered stills usually pass as-is; new frames go through the full grading pass).
4. **Crop + export with sharp:** resize to 1100x1945, `fit: cover`, position `attention` (verify the crop keeps the subject; override with manual position if attention miscrops), JPG quality tuned to land 120-200KB.
5. **Place:** overwrite `public/images/{slot}.jpg`; upload the same crop to the project's Sanity `coverImage` (replacing any interim hero-frame cover); archive the full-res crop as `{project}_cov_{subject}_v##` in `master/`.
6. **Panel check:** confirm the locked panel hex still suits the new cover (19% lightness rule); re-derive with the provided JS if the cover changed character (a night cover behind a hex derived from a day frame will look off).
7. **Verify on the shelf:** home hero at the resting row; the cover must read at drift speed and not fight its neighbors' grade (F2's two-frame test applies across the shelf, not just within a project).

## Quality bar

Straight verticals; subject intact after the crop at both sizes; grade belongs to the same family as the adjacent shelf covers; file 120-200KB; no text baked into the image (captions are HTML, covers are pure frames).

## Output spec

`public/images/{slot}.jpg` at 1100x1945, 120-200KB · Sanity `coverImage` updated · full-res crop archived per F3.

## Reference example

NY Penthouse (2026-07-02): `terrace night pool` master (2121x3000, no enhancement needed) -> `public/images/05.jpg` via sharp attention-crop. First real cover on the shelf.

## Known failure modes / gotchas

- `attention` cropping can behead the composition on frames with bright edges; always eyeball the result.
- A cover graded in isolation can break the shelf's unity; check in context, not in a viewer.
- Slot mix-ups: the shelf order is positional; overwriting the wrong `{slot}.jpg` swaps two projects' identities silently.
- The night-cover/panel mismatch (step 6): panels were derived from earlier covers.

## Open questions

- Enhancement settings: pending the W1 bake-off (F2 carries them once decided).
- Whether covers eventually carry typographic treatment (a real book jacket): revisit with the mockup workflow (08); current covers are pure frames.
