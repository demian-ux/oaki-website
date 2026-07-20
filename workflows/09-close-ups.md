# Detail & Macro Close-ups Workflow (09)

**Status:** draft, tool settings pending the W1 bake-off (structure and quality bar final)
**Last updated:** 2026-07-02
**Owner:** Gero (detail renders are his lane); Diego QA

## Purpose & when to use

Produces the FASE 03 material: detail close-ups (a junction, a stair nosing, a fixture in context) and macro close-ups (the material itself: stone veining, fabric weave, wood grain). These frames carry the precision argument; they are where "materials, light, junctions" gets proven or exposed. Run per case study after the frame set exists, and standalone when a project needs a Material Study block.

## Inputs required

- The project's 3ds Max scene (preferred) or the delivered masters when the scene is archived/unavailable.
- The material references the client supplied (physical sample photos, spec sheets) — the macro must match the SAMPLE, not a generic version of the material.
- The FASE 03 copy (what materials the text names; frames and words must agree).

## Tools & models

Two paths, chosen by what exists:

- **Path A, from the scene (preferred):** fresh Corona camera close on the detail, render at 1:1 material scale, F2 grade. No AI needed; this is the ground truth path.
- **Path B, from a master (scene unavailable):** crop the region, enhance with the bake-off winner (Magnific-class, Architecture mode). <!-- Settings land here after the W1 bake-off: tool, creativity/resemblance/fractality values, upscale factor. --> Path B is capped: it may sharpen and densify EXISTING texture, never invent pattern (a hallucinated stone vein on a real project is a lie about the client's design).

## Procedure

1. List the materials FASE 03 names; one macro per named material, one detail per named junction/gesture.
2. Path A or B per frame (A whenever the scene opens).
3. F2 grade; property 3 (refined materials) is the whole job here; blacks and warmth rules still apply.
4. 100% inspection: verticals, pattern repeats (enhancers love cloning), scale sanity (a 2cm vein rendered 20cm wide reads instantly wrong to an architect).
5. Name per F3 (`{project}_03_{material}-macro_v##`), master + web export.

## Quality bar

The client could hold their sample next to the frame and nod. Reject: invented pattern, cloned repeats, plastic sheen on natural materials, any geometry bend, macro that could be stock (if it doesn't clearly belong to THIS project, it fails the only-oaki test visually).

## Output spec

Per F3, into the project archive; loaded to the FASE 03 gallery (Material Study layout) with the materials array filled.

## Reference example

Pending: NY Penthouse FASE 03 currently uses full-room frames; first true macro set lands after the bake-off (or via Path A if the 2W 29th scene still opens).

## Known failure modes / gotchas

- Path B on patterned materials (marble, wallpaper) is the highest hallucination risk in the whole pipeline; when in doubt, Path A or don't ship.
- Macro without context reads as stock; pair each macro with the detail frame that places it in the room.

## Open questions

- Does the 2W 29th / NY Penthouse Max scene still open? (Diego; decides Path A vs B for the pilot's macro set.)
- Bake-off winner + settings (Demi opens trials; F2 carries the values once decided).
