# Case-Study Motion Workflow (10)

**Status:** draft, i2v platform pending Demi's trial decision (structure, rules, and encoding final)
**Last updated:** 2026-07-02
**Owner:** Diego signs motion QA; Demian picks the shots

## Purpose & when to use

Produces the moving layer of a case study: the hero loop on the case page (Sanity `heroMedia` / phase `video`), reels for social (12), and eventually the site film (asset map 13). Input is always a shipped still (F2-graded master); AI generates the camera move, never the content. Run per case study after the stills ship, 2-3 shots per project maximum: motion is an accent, not wallpaper.

## Inputs required

- The chosen masters (the frames that "want" motion: depth, a path for the eye, atmosphere that benefits from time).
- The i2v platform decision. <!-- Pending: Higgsfield-class aggregator vs Project Dream's video models; per-shot model choice (Kling / Veo / Seedance) and credits land here after the W3 tests. -->
- Kling-style first-and-last-frame when the Max scene opens: render two keyframes and let the model interpolate; geometry anchored at both ends is the strongest anti-warp control this pipeline has.

## The motion rules (fixed, from the showreel brief §0)

- Camera moves only: slow dolly, drift, pan, gentle orbit segment. No spiral moves, no extreme close-up moves (known 2026 failure modes), no FPV, no drone-reveal as the device.
- No sizzle grammar: no speed ramps, no text overlays, no beat-cut montage.
- 6-10 second loops, seamless or soft-cut; the loop must be watchable ten times without irritation.
- Reject on first geometry bend: a facade that breathes, a mullion that swims, a reflection that slides wrong. No exceptions for otherwise-beautiful takes.

## Procedure

1. Demi picks the 2-3 shots and names each move in camera language (e.g. "slow dolly toward the window, 8s").
2. Generate: same shot through 2-3 models where the platform allows; pick per shot, keep the decision trail (model, preset, seed/settings).
3. 1080p generation, then upscale to 4K with Topaz Video AI when the destination warrants (site hero: yes; story crop: no).
4. Encode for web: H.264 (H.265 where supported), muted, no audio track at all, `autoplay loop playsinline` compatible, target under 8MB for a hero loop, under 4MB for in-page. Reduced-motion fallback: the source still, always.
5. Load: Sanity phase `video` (Mux or file URL per the field), or `heroMedia` poster + video pairing per the component's contract.
6. QA on a phone AND a large screen; geometry bends show at size, stutter shows on mobile.

## Quality bar

A stranger should assume it was rendered, not generated. The F2 grade holds through motion (no model-injected color drift). Loop point invisible. Zero geometry warp at full-screen size.

## Output spec

`{project}_mot_{subject}-{move}_v##.mp4` per F3; master (4K) in archive, web encodes in `web/`; reduced-motion poster still alongside.

## Reference example

Pending the platform trial. First candidates (NY Penthouse): terrace night (slow dolly toward the skyline; the steam and water want time) and living (drift toward the window at golden hour).

## Known failure modes / gotchas

- Warm window light is where models drift color first; check the F2 warm bias survives.
- People in frame (the terrace figure): motion models animate humans worst; if the figure moves uncannily, mask the move to camera-only or choose a frame without people.
- Autoplay with an audio track (even silent) is blocked on iOS; strip the track, don't just mute it.
- The site runs Lenis + GSAP; a heavy hero video plus scroll animation competes for the main thread; respect the 8MB cap and lazy-load below the fold.

## Open questions

- Platform + per-shot model choices: Demi's trial (Project Dream first, Higgsfield second, per the research matrix).
- Mux vs static file for delivery (MUX_TOKEN_* already in .env.local, unused): decide at first load.
