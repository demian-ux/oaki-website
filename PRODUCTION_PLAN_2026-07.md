# Oaki Creative Production Plan, July 2026

**Written:** 2026-07-02
**Companion doc:** `AUDIT_2026-07.md` (deployment audit, same date)
**Horizon:** 4 weeks, July 6 to July 31, 2026
**Goal:** every launch blocker from the audit closed, an AI production pipeline defined and tested, and a launch content package ready when oaki.studio switches to the new site.

---

## The gap board

Every placeholder on the site, mapped to a production week, a tool lane, and an acceptance bar. Tool lanes reference the matrix in section 3; final tool picks stay open until the Week 1 trials.

| # | Asset | Qty | Source material | Week | Tool lane | Acceptance bar |
|---|---|---|---|---|---|---|
| 1 | Hero book covers (`public/images/01-07.jpg`) | 7 | Existing Corona renders per project | W1 | Upscale/detail (Magnific-class) + art direction | Portrait, editorial book-cover grade, consistent grade across the shelf, DS 4.1 ocre/negro discipline, no hallucinated geometry |
| 2 | Services deck images | 3 | 1 concept sketch/model shot, 1 detail crop, 1 campaign hero | W1 | Same still pipeline | Reads at letterbox crop; grades match the deck's grey to warm to full-color ramp (static filters stay in code) |
| 3 | Case studies in Sanity | 4 minimum, 7 target | Project archives (renders, drafts, sketches, briefs) | W2 | Stills pipeline + oaki-case-study + oaki-copywriting skills | Each book: cover, FASES 00-05 media + copy, client visibility cleared, no em dashes |
| 4 | Case-study hero motion | 2-3 films | Best stills from #3 | W3 | Image-to-video (Higgsfield-class) | 6-10s loops, camera moves only (dolly/pan/orbit), zero geometry warping on facades, muted, under 8MB web-encoded |
| 5 | Team photos (about page) | full team | New photography or art-directed AI-assisted portraits | W3 | Photography first; AI only for grading/cleanup | Consistent light and grade, negro/gris palette, no grey boxes left |
| 6 | Journal entries | 2 real posts minimum | Studio knowledge (the 5 mock titles are real angles to keep) | W3 | oaki-copywriting skill, images already final | `/journal` route opened, slider links resolve, or slider affordance removed |
| 7 | Site hero film (optional, post-launch OK) | 1 | Hero covers + best case footage | W4 | i2v + edit | Only ships if W3 motion tests clear the quality bar |
| 8 | Social/launch package | ~12 posts + announcement | Everything above | W4 | Repurpose lanes from #1-#4 | IG/LinkedIn formats, launch announcement, first 2 weeks of cadence scheduled |

## Week by week

### Week 1 (Jul 6-10): pipeline setup + the still-image lane

The week's product is the 7 hero covers, the 3 services images, and a decided still pipeline.

- **Mon-Tue: tool trials on one real render.** Take the strongest existing Corona still (Star Island or Manhattan) and push it through the candidate upscale/detail tools at their free or lowest tiers. Same input, same target: book-cover crop, 2x-4x up, material fidelity. Score on: straight verticals kept, material texture gained vs invented, grade control, round-trip time. Keep a one-page decision trail (which settings, which output won).
- **Wed-Thu: produce the 7 covers.** Winner tool + Photoshop pass. Order fixed by the shelf: 01 Raghsa Tower, 02 Cazouls les Bezier, 03 Dillido Residence, 04 Manhattan Apartment, 05 NY Penthouse, 06 Windsor Residence, 07 803 Hunter Rd. Export via the existing sharp step to ~150-200KB JPGs.
- **Fri: services deck images (3) + drop-in.** Concept (sketch/massing energy), Proof (material detail), Campaign (finished hero). Replace the 03/07/05.jpg reuse in `ServicesDeck.tsx`.
- **Also Fri: pick the i2v candidates.** Shortlist 6-8 stills that want motion, brief the Week 3 tests.

### Week 2 (Jul 13-17): the library becomes real

The week's product is a credible library: 4 case studies minimum in Sanity, 7 target.

- **Mon: selection + permissions.** Decide which projects have client clearance (`clientVisibility` field exists in the schema). Any hero book without a case study behind it gets its shelf slot reconsidered.
- **Tue-Thu: one case study per day rhythm.** Per project: gather archive (renders, drafts, sketches), produce FASES 00-05 media through the W1 still pipeline (drafts and process shots need less enhancement, finals get the full treatment), write copy with the oaki-case-study + oaki-copywriting skills (no em dashes, editorial voice), load into Sanity via Studio.
- **Fri: library QA.** Every book opens, media loads, FASES read in order, next-project nav cycles correctly. Star Island duplicate (`star-island-2`) resolved: differentiate or delete.

### Week 3 (Jul 20-24): motion + people + journal

- **Mon-Wed: i2v tests, then 2-3 case films.** Run the shortlisted stills through the video lane (Higgsfield-class multi-model access: try the same shot through 2-3 underlying models, pick per shot). Camera presets only (dolly-in, slow orbit, pan); reject anything that bends a facade line. Encode for web (H.264/H.265, muted, autoplay-safe) and load into the Sanity `heroVideo` fields.
- **Wed-Thu: team photos.** Shoot or book them; AI is for grading and background cleanup only, not for faces. If photography cannot happen this week, an art-directed interim (consistent duotone treatment) replaces the grey boxes; raw placeholders do not ship.
- **Thu-Fri: journal.** Write 2 of the 5 mock titles for real ("Why we model the light first" and "The case against the flythrough" are the strongest launch angles). Open `/journal` and `/journal/[slug]` (remove the unconditional `notFound()`), wire to Sanity `journalPost`.

### Week 4 (Jul 27-31): launch package + deploy

- **Mon-Tue: social/launch content.** From the produced assets: 7 cover reveals (carousel or 1/day series), 2-3 film clips as reels, 1 "new site" announcement for IG + LinkedIn, journal post promos. Copy through oaki-copywriting. Schedule the first 2 weeks of cadence.
- **Wed: housekeeping sweep.** From the audit register: remove `?freezehero`, delete `HomeHero.tsx`, fix contact-form lint errors (11 errors in `ContactForm.tsx`/`DurationSlider.tsx`), commit handoff docs, push/prune branches, Next/Image sizing + LCP fixes.
- **Thu: deploy.** Vercel project, env vars (`NEXT_PUBLIC_SANITY_PROJECT_ID`, dataset, read token, `RESEND_API_KEY`), preview URL QA on real devices, redirects from indexed old-site URLs (`/portfolio/`), metadata + OG images from the new covers.
- **Fri: domain switch + announce.** DNS to Vercel, old site archived, launch posts go out, monitor.

## Tool-to-asset matrix

Research date 2026-07-02. Confidence labels: **[confirmed]** = checked against the vendor's own page today; **[reported]** = credible 2026 source, not independently verified (the adversarial verification pass hit a session limit; re-verify pricing at signup); **[competitor claim]** = from a rival vendor's blog, treat as marketing until tested. Pricing is presented as options; no purchase decision is made here.

### Still lane (hero covers, FASES media, services images)

| Tool | What it does (2026) | Fit for Oaki | Cost signal | Sources |
|---|---|---|---|---|
| **Pulze Project Dream 1.0** | Archviz-native platform: 40+ image/video models under one credit pool, **takes the Corona/V-Ray frame buffer directly as input in 3ds Max 2026**, Magnific Creative Upscale integrated and payable with Pulze credits [confirmed] | Strongest structural fit: built for exactly Oaki's pipeline, one subscription covers upscale + i2v trials, no export step | Credit-based; pricing not public on the announcement page, check pulze.io | [pulze.io/blog/project-dream-1-0](https://www.pulze.io/blog/project-dream-1-0) |
| **Magnific (Freepik)** | Diffusion upscaler to 10-16x with Architecture mode, creativity/fractality/resemblance sliders, reference-image style transfer, native Photoshop plugin returning Smart Objects [reported] | The editorial-detail benchmark for the book covers; Photoshop plugin fits the existing finishing pass | No free plan [competitor claim]; token plans, see magnific.com | [magnific.com](https://www.magnific.com/), [myarchitectai pricing](https://www.myarchitectai.com/blog/magnific-ai-pricing) |
| **Krea** | Realtime enhance/upscale, free 2K upscaling, strong detail preservation [competitor claim] | Cheap second opinion in the W1 bake-off | Paid from ~$10/mo [reported] | [myarchitectai alternatives](https://www.myarchitectai.com/blog/magnific-alternatives) |
| **Topaz Gigapixel** | Up to 6x upscale, model choice (Standard/High Fidelity/Low Res), subscription-only since Sep 2025 [reported] | Fidelity-first control: no invented detail, good when Magnific-style hallucination is the risk | Gigapixel ~$50/mo or ~$204/yr; Studio bundle ~$69/mo [reported] | [myarchitectai topaz pricing](https://www.myarchitectai.com/blog/topaz-ai-pricing) |
| Midjourney | Text-to-image; not an enhancer of existing renders | Mood/reference only, not production: it invents buildings | ~$10-60/mo tiers | (general knowledge, low relevance) |

**W1 bake-off:** same Corona still through Project Dream (Magnific inside), Magnific direct, Krea, and Gigapixel. Judge on kept verticals, material gain vs invention, grade control, round-trip time. The competitor-sourced caveats (Magnific artifacts on realism-critical images, Topaz photo-trained textures) are the exact things the bake-off tests.

### Motion lane (case films, hero film, reels)

| Tool | What it does (2026) | Fit for Oaki | Cost signal | Sources |
|---|---|---|---|---|
| **Higgsfield** | Aggregates 15+ video models (Sora 2, Veo 3.1, Kling 3.0, Seedance 2.0, Wan 2.6/2.7, Hailuo) under one subscription; Cinema Studio 3.5 simulates camera body/lens/focal length with 70+ camera presets (dolly, orbit, crash zoom, FPV) [confirmed product, reported details] | Best trial platform: same still through 3 models without 3 subscriptions; camera presets match the "camera moves only" rule | Reported tiers: Free / ~$15 Starter (200 cr) / ~$34 Plus (1,000 cr) / ~$84 Ultra; per-clip cost varies hugely by model, Sora 2 ~40-70 credits vs Kling ~6 [reported, verify at signup] | [higgsfield.ai/cinema-studio](https://higgsfield.ai/cinema-studio), [2026 guide](https://pasqualepillitteri.it/en/news/677/higgsfield-ai-video-guide) |
| **Kling 3.0 / 2.6** | 3.0: native 4K, up to 20s, multi-shot storyboards (6 cuts) [reported]. 2.6 introduced first-and-last-frame: render two keyframes in 3ds Max, AI generates the camera move between them [reported] | First/last-frame is the killer workflow for a Corona studio: geometry anchored at both ends, AI only interpolates. One 2026 archviz writeup calls Kling the strongest for this use [reported, single source] | Cheapest per clip via Higgsfield (~6 credits) [reported] | [renderai.app model guide](https://renderai.app/blog/video-ai-models-for-architects-designers-marketers/), [aifire archviz workflow](https://www.aifire.co/p/ai-vs-render-farm-professional-archviz-workflow-2026) |
| **Veo 3.1** | Reference images pin materials/lighting/spatial relations; 720/1080p, 4-8s, audio sync [reported] | Good for material-faithful short clips; audio irrelevant (site videos muted) | Mid-cost via Higgsfield credits | [renderai.app](https://renderai.app/blog/video-ai-models-for-architects-designers-marketers/) |
| **Runway Gen-4.x** | General i2v, editor tooling | Fallback candidate in the bake-off | Own subscription | (test only if the aggregated models disappoint) |
| **Topaz Video AI** | 4K upscale of generated clips | Post step: generate 1080p, upscale to 4K, the standard 2026 archviz pattern [reported] | Video ~$67/mo, or Studio bundle [reported] | [aifire](https://www.aifire.co/p/ai-vs-render-farm-professional-archviz-workflow-2026), [myarchitectai](https://www.myarchitectai.com/blog/topaz-ai-pricing) |

**Known ceiling (plan around it):** 2026 i2v still fails on complex spiral moves and extreme close-ups; the recommended split keeps traditional rendering for the 20-30% of work that is dimension-critical [reported]. This matches the standing rule: simple camera moves only, reject warped geometry. Industry context agrees: ~48% of surveyed professionals cite inconsistent output quality as the main AI barrier, with gains concentrated in concept and image-based work [reported, Chaos survey].

### Suggested trial order (decision stays with Demi)

1. **Pulze Project Dream** trial first: one credit pool covers both lanes, plugs into the existing 3ds Max 2026 + Corona setup, Magnific included. If it holds up, it may be the only subscription the pipeline needs.
2. **Higgsfield** lowest paid tier for the W3 motion tests if Project Dream's video models underperform, or to A/B the same shot across Kling 3.0 / Veo 3.1 / Seedance with Cinema Studio presets.
3. **Magnific direct or Topaz Gigapixel** only if the W1 bake-off shows the covers need more than Project Dream's integrated upscale.

## Standing rules

- Every asset passes DS 4.1: ocre #C6B193 as the single identifier, negro #222222 never pure black, gris #F4F3F0 paper, image grades per surface mode.
- No em dashes in any copy, anywhere.
- AI enhances renders the studio made; it does not invent buildings. Anything with warped geometry, melted mullions, or invented context gets rejected regardless of how good it looks.
- Every batch keeps a decision trail (tool, settings, why the winner won) so the pipeline is repeatable.
- Building is not shipping: the week is judged by assets landed on the site, not tools configured.
