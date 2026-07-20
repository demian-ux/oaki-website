# Oaki Studio — Homepage Handoff (for brainstorming)

> Context doc for a Claude Cowork session. **Scope: the home page only.** Everything below reflects the live state of the code as of this handoff. Paths are relative to the repo root `oaki-studio/`.

---

## 1. What this is

A premium, editorial website for **Oaki Studio** — an architectural narrative studio (moving from "rendering studio" to "narrative studio"). The feel target is a *library of architectural project books* (Assouline-like), not a typical archviz portfolio. Minimal, calm, image-led.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Sanity CMS · Motion/GSAP/Lenis · hosted locally for now (Vercel later).

> ⚠️ This is a newer Next.js than training data assumes — see `AGENTS.md`. Read `node_modules/next/dist/docs/` before writing framework code.

---

## 2. Running & previewing

- Dev server runs on **localhost:3001** (via the preview harness).
- **Turbopack CSS cache gotcha:** edits to `src/app/globals.css` often do **not** hot-reload — not even on a plain restart. To force them: **stop the server → delete `.next/dev` → restart.** Component CSS modules and `.tsx` HMR fine; only `globals.css` is sticky.
- **Lenis smooth scroll:** `window.scrollTo()` lags by a frame — set it twice if scripting scroll.
- Hard-refresh the browser (Ctrl+Shift+R) after CSS changes to dodge browser cache.

---

## 3. Homepage anatomy

Source: [`src/app/(site)/page.tsx`](src/app/(site)/page.tsx). Render order top → bottom:

| # | Section | Component / location | Notes |
|---|---------|----------------------|-------|
| 1 | **Hero** | `components/home/HeroShelf.tsx` (+ `.module.css`) | Animated giant `oaki` wordmark → shrinks to `oaki.` logotipo; one book cover flips through 7 books, then spreads into a drifting right-to-left shelf. Owns the top chrome until scrolled. |
| 2 | **Concept** | inline in `page.tsx` | Full-screen (`min-h-screen flex items-center`) declarative statement: *"We show your project before it exists."* + lede. |
| 3 | **Journal** | `components/home/JournalSlider.tsx` (+ `.module.css`) | *"What the render doesn't show"* + intro + an editorial peek-carousel of journal entries (paper-grey `gris` ground). |
| 4 | **Peer Band** | `components/home/PeerBand.tsx` (+ `.module.css`) | Rotating centered SangBleu testimonial (Andrew's first) + a drifting "Trusted by" client marquee + a fact strip. |
| 5 | **Services** | inline in `page.tsx` | *"One project, three ways to show it"* + a 3-up grid: **Stills / Film / Narrative**, each with cover image + body. (Code comment mislabels this "4".) |
| 6 | **About** | inline in `page.tsx` | *"The people you meet are the people doing the work"* + lede + outline button → `/about`. |
| 7 | **Contact** | inline in `page.tsx` | *"Tell us what you're building"* + lede + primary button → `/contact`. |

Global chrome: `components/global/Header.tsx`, the footer, and `components/global/Logotipo.tsx` (the `oaki.` wordmark + ocre dot). Scroll-reveal is a single global observer: `components/global/RevealOnScroll.tsx` (adds `.reveal-in` to any `.reveal` element on entry).

---

## 4. Content / CMS — important

The homepage is a **hybrid of Sanity + hardcoded fallbacks**:

- `getHomePage()` pulls the **Sanity singleton `homePage`**; the live site shows the **Sanity values**, which override the `?? "fallback"` strings in `page.tsx`. **Editing a fallback string in code will NOT change the live copy** if Sanity has a value for that field. Copy edits belong in **Sanity Studio (`/studio`)**.
- **Hardcoded in `page.tsx`** (not in Sanity yet): the `services` array (Stills/Film/Narrative — names, images, body), the `clientMarks` roster, and the `additionalPeerQuotes` (the first peer quote is from Sanity; the rest cycle from code).
- Journal entries are mock data: `lib/journal-mock.ts`.

---

## 5. Typography system (the registers)

One job per font. Utilities live in `src/app/globals.css`.

**Fonts**
- **Inktrap** = PP Neue Machina Inktrap Ultrabold → loud display (`--font-display` / `--font-display-volume`).
- **Neue Montreal** → all body + labels (`--font-sans`).
- **SangBleu** → editorial serif (`--font-serif`). Originally "Case pull-quotes only"; **now also used on the homepage** for the peer quote, journal titles, and the service titles (see §6 — this is a deliberate recent expansion).
- *(Geist Mono was retired; `.coord` "coordinate" labels fall back to Neue Montreal.)*

**Heading / display registers**
| Class | Font | Size | Use |
|-------|------|------|-----|
| `.text-statement` + `.text-volume` | Inktrap 800, UPPERCASE | clamp 2rem→**52px** cap | Every major section statement (concept, journal, services, about, contact headings) |
| `.text-quote` | SangBleu 300, mixed case | clamp 1.5rem→**40px** | Editorial pull-quote / serif accent (now the service titles) |
| `.text-title` | Inktrap, UPPERCASE | ~18px | Small caps titles |
| `.logotipo` | Inktrap + ocre dot | contextual | The `oaki.` wordmark |

**Body / label registers**
| Class | Font | Size | Use |
|-------|------|------|-----|
| `.text-lede` | Neue Montreal | clamp →**20px** | Primary body / intro on Studio + Process |
| `.text-body` | Neue Montreal | **20px** | Running body copy |
| `.text-editorial` | SangBleu | ~18–22px | Case body |
| `.text-label` | Neue Montreal, UPPERCASE | 12px | Section eyebrows |
| `.text-meta` | Neue Montreal, muted | 13px | Captions, footer, dates |
| `.coord` | Neue Montreal, UPPERCASE, ocre-700 | 11px | "Coordinate" labels / nav |

**Palette:** ocre `#C6B193` (fill only) · ocre-700 `#7C6549` (text/accent) · negro `#222` (ink, never pure black) · gris `#F4F3F0` (paper-grey ground) · blanco `#FFF` · muted `#67645D`.

---

## 6. What just changed (this session — homepage type pass)

All verified live; typecheck passes; no new lint errors.

1. **Concept heading** → reverted to the standard **52px** statement (was briefly a fill-to-width experiment).
2. **"What the render doesn't show"** → now classified as a `.text-statement` (52px), consistent with the other section headings.
3. **Hero subtitle removed** ("Visualization and Narrative studio for Architectural projects"). The screen-reader `<h1>` stays.
4. **Journal article titles** → restyled to **mixed-case SangBleu 300** to match the peer-quote serif (were uppercase + dimmed grey).
5. **Body copy unified to 20px** site-wide (`.text-lede`, `.text-body`, journal intro).
6. **Services body** → bumped from 13px meta to **20px** lede.
7. **Service titles (Stills/Film/Narrative)** → changed from Inktrap caps to **mixed-case SangBleu** (`.text-quote`, 40px) to match the peer quote.
8. Concept heading→body gap tightened (`mb-8` → `mb-2`).

**Open tension to weigh:** SangBleu was originally reserved to Case studies. It now appears in 3 places on the home page. Worth deciding deliberately whether that's the new system or should be pulled back.

---

## 7. Brand / copy rules (hard constraints)

- **No em dashes** in any Oaki copy — use commas or periods.
- Discipline is the **Vignelli Canon lens**: meaning first, few sizes, flush-left, ocre as the *single* identifier, "equity over novelty."
- Placeholder content only where noted (service images are `/images/0X.jpg` placeholders); no lorem ipsum, no stock.

---

## 8. Starting points for the brainstorm

Open questions / things that are deliberately unsettled — good places to push on:

- **Serif scope:** embrace SangBleu across the home page, or keep it an accent? Should the three serif spots share one size?
- **Concept section whitespace:** it's a full-screen (`min-h-screen`) centered band — intentional drama, but leaves large empty space above/below the short text block. Keep, or tighten?
- **Hero:** the spread is a center-bloom, not a literal split; "INFO" affordances were removed; books here (real renders) differ from the case-studies content below.
- **Services → Sanity:** currently hardcoded; images are placeholders.
- **Heading scale:** all statements cap at 52px regardless of screen width. Should the big statements scale up on wide monitors?
- **Vertical rhythm:** section spacing is a mix of `min-h-screen`, `section-y` (8/13rem), and one-off `py-*`. Could be unified.

---

*Hand this to the Cowork session as-is. When proposing changes, remember: copy lives in Sanity, `globals.css` needs a cache-clear to preview, and the home page is `src/app/(site)/page.tsx` + the three `components/home/*` components.*
