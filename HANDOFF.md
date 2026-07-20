# Oaki Studio Website — Project Handoff

> Project-wide handoff (not homepage-only). Every claim below was **verified against the working tree on 2026-07-01**, branch `services/deck` @ `45bf656`. Paths are relative to the repo root `oaki-studio/`.
>
> A narrower, homepage-focused doc also exists: [`HOMEPAGE_HANDOFF.md`](HOMEPAGE_HANDOFF.md). **Note:** that doc predates the Services rebuild (written before `ServicesDeck.tsx` landed), so its Services section is stale — it still describes a Stills/Film/Narrative grid that no longer exists. Prefer this document for Services and git state.

---

## 1. What this is

A premium, editorial website for **Oaki Studio**, an architectural narrative studio repositioning from a "rendering studio" to a "narrative studio." Feel target: a *library of architectural project books* (Assouline-like), calm, minimal, image-led.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Sanity CMS · Motion / GSAP / Lenis · Resend · Zod. Hosted locally for now (Vercel later).

> ⚠️ This is a newer Next.js than training data assumes. See `AGENTS.md`: read `node_modules/next/dist/docs/` before writing framework code.

**Build plan:** 20-step sequence at `C:\Users\dszkl\OneDrive\Escritorio\Artifacts\MD\oaki_claude_code_website_plan.md`. Cadence: after each step run lint + typecheck + build. Placeholder content only (no lorem ipsum, no stock photos).

---

## 2. Repo & git state (verified)

- The **single git repo is `oaki-studio/`**. The parent folder `New Website/` is NOT a repo.
- **origin** = `https://github.com/demian-ux/oaki-website.git`.
- **HEAD = `services/deck` @ `45bf656`**, fully in sync with `origin/services/deck` (0 ahead / 0 behind).
- History is **one linear chain**; feature branches are checkpoints along it:

```
main → hero-section → hero-polish → services/motion → services/deck (HEAD)
```

Verified by ancestry: every arrow is a `merge-base --is-ancestor` pass. The 8 `home/*` branches and `remove-geist-mono` all sit ON this line as earlier checkpoints and are **all merged (ancestors) into `services/deck`** — `git branch --no-merged services/deck` is empty, so nothing is divergent.

**Push status (corrects the old "nothing is pushed" note):**

| Branch | Pushed? |
|--------|---------|
| `services/deck` (HEAD), `services/motion` | Fully pushed, in sync (0/0) |
| `main`, `hero-polish` | Track origin but **1 local commit ahead** (one unpushed commit each) |
| `hero-section`, `remove-geist-mono`, all 8 `home/*` | No upstream, **never pushed** |

The `home/*` checkpoints and their subjects (all already folded into `services/deck`): `home/concept` (remove eyebrow, ocre dot on title), `home/gallery-peek` (lightbox), `home/gallery-slider` (gallery below Concept), `home/headline-dots` (ocre dot on About/Contact headlines), `home/hero-title` (Assouline-style collection line), `home/quote` (quote + client marquee), `home/services` (full-screen grey Services), `home/spacing` (Concept full-screen + rhythm).

> `HANDOFF.md` and `HOMEPAGE_HANDOFF.md` are untracked working-tree files.

---

## 3. Homepage anatomy (current, verified)

Source: [`src/app/(site)/page.tsx`](src/app/(site)/page.tsx). Render order:

| # | Section | Component / location | Notes |
|---|---------|----------------------|-------|
| 1 | **Hero** | `components/home/HeroShelf.tsx` | Giant `oaki` wordmark shrinks to the `oaki.` logotipo; one cover flips through 7 books, then spreads into a drifting right-to-left shelf. Owns top chrome until scrolled. No subtitle (removed). |
| 2 | **Concept** | inline in `page.tsx` | Full-screen declarative statement + lede. |
| 3 | **Journal** | `components/home/JournalSlider.tsx` | "What the render doesn't show" + an editorial peek-carousel of journal entries (paper-grey `gris` ground). Entries are mock data (`lib/journal-mock.ts`, 5 entries). |
| 4 | **Peer Band** | `components/home/PeerBand.tsx` | Rotating centered SangBleu testimonial + drifting "Trusted by" client marquee + fact strip. |
| 5 | **Services** | `components/home/ServicesDeck.tsx` | **Horizontal slide deck: Concept / Proof / Campaign.** Pinned section, scroll scrubs the slides; snap via the global Lenis engine (`getLenis()`). Superseded the old Stills/Film/Narrative grid. |
| 6 | **About** | inline in `page.tsx` | Statement + lede + outline button → `/about`. |
| 7 | **Contact** | inline in `page.tsx` | Statement + lede + primary button → `/contact`. |

Global chrome: `components/global/Header.tsx` (nav hides on home until `pastHero`), `Footer.tsx`, `Logotipo.tsx` (`oaki.` + ocre dot). Scroll-reveal is one global observer, `components/global/RevealOnScroll.tsx`, mounted in `src/app/(site)/layout.tsx`.

`HomeHero.tsx` still exists but is **imported nowhere** (dead; kept for reference).

---

## 4. Design system & typography (verified)

DS has advanced from **3.0** (three-mode: Studio / Process / Case) to the **4.1 "Stria + the Canon"** foundation, rolled out site-wide. Discipline = Vignelli Canon lens: meaning first, few sizes, flush-left, ocre as the single identifier, "equity over novelty."

**Palette:** ocre `#C6B193` (fill only) · ocre-700 `#7C6549` (text/accent) · negro `#222` (ink, never pure black) · gris `#F4F3F0` (paper ground) · blanco `#FFF` · muted `#67645D`.

**Fonts — four typefaces are registered** in `src/app/layout.tsx` via `next/font/local`, all applied to `<html>`:
- **PP Neue Machina Inktrap Ultrabold** — loud display (`.text-volume`, `.logotipo`, hero wordmark).
- **PP Neue Machina Plain** — calm titles / statements.
- **Neue Montreal** — all body + labels (`--font-sans`).
- **SangBleu** — editorial serif; originally Case-only, now also used on the homepage (peer quote, journal titles, service titles). Open design tension: whether to embrace SangBleu across home or pull it back to an accent.

> **Geist Mono is GONE.** It was removed on this branch (the `remove-geist-mono` commit is merged in). `globals.css` remaps `--font-mono` → Neue Montreal, so `.coord` "coordinate" labels now render in Neue Montreal. There are no Geist files in `public/fonts` and no Geist import in `layout.tsx`. (This corrects an earlier note that claimed Geist Mono was self-hosted.)

**Motion (§07 brand gestures), all wired:**
- **Rise** — scroll-reveal via `RevealOnScroll.tsx` (single global IntersectionObserver over `.reveal`, reduced-motion fallback), mounted in `(site)/layout.tsx`.
- **Wipe** — `StripeRule.tsx` (clip-path draw-in), used on about / case-studies / contact / process.
- Shared hook: `src/components/global/useInView.ts` (note: under `components/global`, not `src/hooks`).
- **Global smooth scroll** — `components/global/SmoothScroll.tsx` mounts Lenis globally (driven off `gsap.ticker`), first time Lenis is site-wide. Disabled under `prefers-reduced-motion`. Changes scroll feel on every page.

---

## 5. Content / CMS source (important)

The homepage is a **hybrid of Sanity + hardcoded fallbacks**:

- `page.tsx` calls `getHomePage()` → Sanity **singleton `homePage`** (`*[_type == "homePage"][0]`), and renders `home.field ?? "fallback"`. **Editing a code fallback does nothing** if Sanity has a value for that field. Copy edits belong in **Sanity Studio (`/studio`)**.
- Sanity project id `NEXT_PUBLIC_SANITY_PROJECT_ID=l97qaqin` is set in `.env.local`. Dev revalidates every ~10s (stale-while-revalidate), so allow ~10s after a Sanity write.
- **Hardcoded in code, not in Sanity:**
  - ServicesDeck slides (Concept / Proof / Campaign) — `ServicesDeck.tsx` `SLIDES`.
  - `clientMarks` — the 24-client "Trusted by" roster in `page.tsx`.
  - `additionalPeerQuotes` — 3 quotes in `page.tsx` (the first peer quote comes from Sanity; the rest cycle from code).
  - Journal entries — `lib/journal-mock.ts` (5 mock entries; header comment says swap for a Sanity fetch at launch).

---

## 6. Hard rules & recurring gotchas

- **No em dashes** in any Oaki user-facing copy — use commas or periods. Verified upheld: no em dash appears in any rendered string on the homepage or home components (only inside code comments).
- **Turbopack CSS cache:** edits to `src/app/globals.css` often do NOT hot-reload, not even on a plain restart. Force it: stop server → delete `.next/dev` (and `.next/cache`) → restart. Component CSS modules and `.tsx` HMR fine.
- **Preview screenshots time out under Lenis:** the perpetual smooth-scroll rAF never reaches an idle frame, so `preview_screenshot` times out. Functional checks via `preview_eval` still work. For a static capture, freeze `gsap.ticker` + Lenis with a temporary dev hook, then screenshot.
- **Preview viewport:** fresh `preview_start` can boot at 0×0 or with a viewport↔screenshot scale mismatch. Call `preview_resize` after each reload; a `document.documentElement.style.zoom` bump can help legibility.

---

## 7. Open items / follow-ups

- **Isologo / "The Section" fork (design, unresolved):** evolve the ratified stria sphere into a circle split by an ocre cut ("drawing becomes building"; S1 master, S6 "sliver" favicon, S3 bridge), and move from an imagotipo (separable symbol + word) toward a true isologo (the Section fused as the "o"). Key files under `project/brand/`.
- **Hero content vs. case studies:** the hero's real renders differ from the case-studies section below (still old placeholders). Reconcile.
- **Hero polish:** the "spread" is a center-bloom, not a literal split; INFO affordances were removed (no behavior).
- **Services → Sanity:** deck slides + images are hardcoded placeholders (`/images/0X.jpg`); move to CMS when ready.
- **Serif scope:** decide deliberately whether SangBleu is now a homepage system or should pull back to Case-only.
- **Merge/push hygiene:** `main` and `hero-polish` each have 1 unpushed local commit; `hero-section`, `remove-geist-mono`, and all `home/*` are unpushed. Decide the merge path for `services/deck` back toward `main`.
- **Pre-existing lint errors** in `DurationSlider.tsx` and `ContactForm.tsx` (untouched).
- **`HOMEPAGE_HANDOFF.md`** Services section is stale (Stills/Film/Narrative) — update or retire it in favor of this doc.

---

*Verified 2026-07-01 against `services/deck` @ `45bf656` by inspecting the actual files (git ancestry, `page.tsx`, `layout.tsx`, `globals.css`, `.env.local`, component tree). Point-in-time snapshot: re-check git state before merging or pushing.*
