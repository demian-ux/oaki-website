# oaki Workflow Library: Asset Map

**Date:** 2026-07-02. Living doc; update the three status columns as workflows land.
**Cross-references:** the June 28 website update list (`oaki-homepage-implementation-plan.md`, tasks T1-T12 + decisions D1-D7), the audit gap board (`AUDIT_2026-07.md` / `PRODUCTION_PLAN_2026-07.md`), and the asset-type list from the workflow-library brief.
**Done test for any row:** Diego, Gero, or Francis could produce the asset to oaki's standard using only the workflow doc.

## The map

| # | Asset type | Update-list link | Workflow doc? | Reference example? | Depends on |
|---|---|---|---|---|---|
| F1 | Shared foundation tokens (type scale, color roles, spacing, motion) | T5, T7, D1 | No | Partial: DS 4.1 lives in `globals.css` + `DESIGN.md`, but conflicts with the 18px scroll-spec type rules | Nothing. Everything else inherits it. Forces the type-system decision (see tension note) |
| F2 | Image-grading standard, "the oaki frame" | T8 (indirectly, all imagery) | No | Partial: journal images + showreel §0 mood rules ("lush, color-confident, editorial restraint") describe it in prose; no settings/procedure | F1. Feeds every still below |
| F3 | File naming + asset organization convention | all | No | No: `01.jpg`, `hf_*.png`, ad-hoc folders | Nothing. Lock before the library grows |
| 1 | Case study copy | (per case study) | **Yes: 05** | **Yes: NY Penthouse copy v02 (2026-07-02)** | Project selection + client clearance + archive gathering |
| 2 | Case study web pages (Sanity load) | (per case study) | **Yes: 06** | **Yes: `/case-studies/ny-penthouse` live (2026-07-02)** | 1 (copy), 4-6 (media). The repo side of every asset |
| 3 | Book covers | T1 (panels spec locked) | **Yes: 07** | **Yes: NY Penthouse cover live in slot 05 + Sanity coverImage (2026-07-02)** | F2 enhancement settings pending the bake-off; panel hex re-check for the night cover (07 step 6) |
| 4 | Detail close-ups | (FASES 03) | **Draft: 09** | Partial: Gero's detail renders exist in project archives | Path A needs the Max scene; Path B settings pending bake-off |
| 5 | Macro close-ups | (FASES 03) | **Draft: 09** | Partial: same as detail | Same; highest hallucination-risk lane, Path A preferred |
| 6 | Motion for case-study / web pages | D4, D6 | **Draft: 10** | No: zero frames generated anywhere | i2v platform decision (Demi's trial); rules + encoding spec already fixed in the doc |
| 7 | Image-based animations: long + short reels | (social + film) | **Draft: 10+12** | No | 6 (same pipeline, different cuts + aspect ratios) |
| 8 | Mockup generation (devices, books, brochures, magazines, business cards, posters, street) | T2, T3, D4 | **Yes: 08** | **Yes: both lanes proven — CSS stage live (`/mockups/stage.html`, book + iPad modes, 2026-07-02); AI photoreal first run 2026-07-13 (gpt_image_2 via Higgsfield CLI, NY Penthouse book v03 live on shelf + Sanity coverImage)** | Screen/film content (D4) |
| 9 | Services section copy | T8, D5 | **Yes: 11** | **Yes: v01 drafted, three audience variants (architects / developers / TDs), awaiting Demi's picks** | Audience-switch UI = separate design decision |
| 10 | Social repurposing (IG carousel + reels) | (launch package) | **Yes: 12** | **Partial: NY Penthouse crop set produced (4:5 + 9:16); captions + first post pending** | Publishing gated on bio fix + site-launch rule |
| 11 | OG / social share images | copy handoff §6 | **Yes: 13** | **Yes: NY Penthouse OG live in Sanity (2026-07-02)** | Site-wide OG frame: Demi picks later |
| 12 | Motion performance + accessibility spec | T6 | No | Partial: repo already implements prefers-reduced-motion + Lenis patterns; encoding specs undocumented | 6. Write alongside the first shipped motion asset |
| 13 | Homepage opening sequence (17-scene storyboard to production) | D6 | No | Partial: storyboard + beat rules exist (`oaki-homepage-showreel-handoff.md`); zero frames; Goldman footage blocked on confidentiality | 6-7 (i2v pipeline proven), Goldman resolution or hero-project recast (open since June audit) |

## Rows neither list captured (my additions)

| # | Asset type | Workflow doc? | Reference example? | Depends on |
|---|---|---|---|---|
| A1 | Client clearance + permissions step (NDA check, `clientVisibility`, credit lines) | No | Partial: TBD/2W 29th permission obtained May 19 proves the ask works; no documented procedure | Nothing. Gate at the top of every case study; the audit shows cleared permissions rotting unused |
| A2 | Sanity ingestion spec (image sizes, sharp optimization step, field mapping, ISR timing) | No | Partial: the sharp convert step + 10s revalidate gotcha are known but live in session memory, not a doc | F3. Merges into asset type 2's doc or stands alone |
| A3 | AI generation kit (LoRA usage, entourage/people prompts, model choice per shot type) | No | Partial: `oaki-lora-training-guide.md`, `oaki-lora-test-prompts.json`, `image-model-research-oaki.md` exist and are close to workflow-grade | F2. Fold into detail/macro + grading docs rather than a separate track |
| A4 | Video encoding + delivery spec (H.264/265 targets, muted autoplay, size budgets, Sanity heroVideo) | No | Partial: brand mark mp4 (584KB) is the one encoded reference | 6. Fold into row 12 |

## Tension: RESOLVED (2026-07-02)

DS 4.1 is canonical (Demi). The scroll-spec type rules are superseded; F1 is the single reference. Services lives as its own section, three audience variants.

## Reading the map

Three docs (F1, F2, F3) unblock everything and cost days, not weeks. Asset types 1-8 are all components of one case study, which is why the pilot builds them as a chain rather than nine abstract docs. Rows 10-13 are downstream of the pilot; 13 stays blocked on Goldman.

**Pilot (decided 2026-07-02): NY Penthouse.** Source renders: 10 frames in `OneDrive\Escritorio\NY Penthouse\` (living, kitchen, bedroom, stair, two baths, steam room, lounge terrace, main area, terrace night pool). Hero book slot 05.
