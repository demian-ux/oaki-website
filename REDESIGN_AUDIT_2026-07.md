# Oaki Website Redesign Audit, July 2026

**Date:** 2026-07-03
**Method:** Four parallel design-audit passes (typography/color, layout/components, interactivity/states/content, code quality/omissions), each briefed on DESIGN.md so intentional decisions (square corners, flat surfaces, no shadows, background-only hover) were not flagged. Contested findings verified by hand.
**Scope:** Design and code quality only. Content gaps (2-book library, placeholder covers, grey team boxes) are covered by AUDIT_2026-07.md and are not repeated here.

---

## Verdict

The design system holds. No AI-generic fingerprints survived: no em dashes, no cliché copy, no purple gradients, no shadow soup, one accent ramp, real editorial tone, reduced-motion handled everywhere. What the audit found instead is **discipline drift** (token and motion-contract violations in about a dozen places), **four accessibility gaps** that are cheap to close, and **three missing pages** (404, error boundary, sitemap) that make the site feel unfinished at its worst moments.

---

## P1 — Fix before launch (bugs and dead ends)

1. **`/journal` links are dead ends.** Both `journal/page.tsx:5` and `journal/[slug]/page.tsx:4` call `notFound()` unconditionally, while the homepage JournalSlider renders 5 mock entries plus an "All entries" link into that 404. Verified 2026-07-03. Ship 2+ real entries or remove the slider's link affordances.
2. **`min-height: 100vh` in `JournalSlider.module.css:9`.** iOS Safari address-bar jump. Change to `100svh` (or `100dvh`).
3. **No branded 404.** No `not-found.tsx` anywhere; visitors get the default Next.js page. Especially bad combined with item 1. Create `src/app/(site)/not-found.tsx`.
4. **No error boundary.** No `error.tsx`; runtime failures show the raw React error screen. Create `src/app/(site)/error.tsx`.
5. **Mobile menu ignores Escape and leaks focus.** `MobileMenu.tsx` has no keydown handler and no focus trap. Add Escape-to-close (WCAG-level expectation) and trap Tab inside the overlay.
6. **Nav has no `aria-current`.** `Header.tsx:130` and `MobileMenu.tsx:58` style the active link visually but never mark it for screen readers. Add `aria-current="page"`.
7. **Mega menu "By Collection" links lie.** `Header.tsx:208-220`: every collection link points to the bare `/case-studies` grid with no filter applied. Wire query params to FilterBar or relabel as non-links.
8. **`?freezehero` dev hook still live.** `HeroShelf.tsx:78`. Known from the July deployment audit; still present. Remove or gate on `NODE_ENV`.
9. **`HomeHero.tsx` is dead code.** Verified: zero imports. Delete it.

## P2 — System discipline (the design system says one thing, the code does another)

10. **Motion contract broken in three places.** `Header.tsx:102` uses 450ms with a bespoke cubic-bezier; `MobileMenu.tsx:33` uses `duration-400`; `globals.css:777` (partner-reveal) uses 750ms with a third bespoke curve. The system allows 200/300/500 and two named easings. Normalize, or document the exceptions in DESIGN.md.
11. **Hardcoded hex outside globals.css.** `HeroShelf.module.css:16` (`#ffffff` → `var(--color-paper)`), `JournalSlider.module.css:116` (`#e7e4df` → `var(--color-gris)`), `JournalSlider.module.css:169` (`#b9b6b0`, needs a token), `BookCard.tsx:30` (rgba copies of warm and ink inside the placeholder gradient; extract to a `globals.css` utility).
12. **Inline style objects where utilities should exist.** The case-study page repeats `style={{ color: "var(--color-warm-200)" }}` / `warm-pale` at `[slug]/page.tsx:68,108,112` and hand-rolls the serif subtitle at lines 76-83; `PhaseSection.tsx:49` overrides `.coord` color inline; `process/page.tsx:58,70,76` same pattern. Create case-drench text utilities and a `.text-case-subtitle` class in globals.css.
13. **Homepage concept section bypasses the spacing system.** `page.tsx:86` uses `min-h-screen flex items-center` instead of `.section-y`. Also missing a `<main>` wrapper at page level (landmark exists in the (site) layout; verify one of the two, not both).
14. **z-index chaos at the top.** `layout.tsx:36` uses `z-[9999]` for the draft banner; `HomeHero.tsx` (pre-deletion) has inline zIndex numbers. Scale in use is otherwise sane (1/2/40/49/50). Define named steps and cap the banner at the top of that scale.
15. **`.coord` vs `SectionLabel`.** `.coord` labels are hand-rolled across pages while DESIGN.md names SectionLabel as the primitive. Either bless `.coord` in DESIGN.md or migrate.

## P3 — Polish and completeness

16. **Focus rings on form controls.** ContactForm selects (`ContactForm.tsx:170`) and all FilterBar selects use `focus:outline-none focus:border-ink` only; the border shift is too subtle for keyboard users. Add a visible `focus-visible` ring (the ocre ring already exists for `.ds-handle`).
17. **`.ds-handle:focus-visible` scales.** `globals.css:988-991` uses `scale(1.15)`, which contradicts the no-transform rule buttons follow. Drop the scale, keep the ring.
18. **Skip-to-content link missing.** Add the classic `sr-only focus:not-sr-only` link in Header plus `id="main-content"` on `<main>`.
19. **Contact form submit lacks `aria-busy`.** Label swaps to "Sending…" but nothing announces the busy state. One attribute.
20. **Legal pages have no meta descriptions.** `privacy`, `terms`, `cookies` export title-only metadata.
21. **No `sitemap.ts`.** Case-study slugs are invisible to crawlers until discovered by link. Cheap win for the domain switch.
22. **Layout nits.** About-page team captions not bottom-aligned across the 4-col grid (`about/page.tsx:72-80`); process FASES grid too dense on mobile (`process/page.tsx:112`, wants `grid-cols-1` with breathing room); ServicesDeck mobile frame height is `78svh` with no aspect ratio (landscape phones clip); PeerBand `.quoteBlock` centering depends on parent context (`margin: 0 auto` makes it self-sufficient).
23. **Preview banner contrast.** `(site)/layout.tsx:42` uses `text-warm` (#c6b193) on ink, roughly 2:1. Internal-only surface, but `text-warm-200` or `warm-pale` would clear AA for free.
24. **Dead tokens.** `--text-primary`, `--text-secondary`, `--accent-fill`, `--accent-text` (`globals.css:88-91`) appear unused. Remove or document.

---

## What passed (worth knowing)

- Copy: zero em dashes, zero AI clichés, no lorem ipsum, no "Oops!", sentence case throughout, realistic mock names.
- Color: one accent ramp, no gray mixing, no pure black, no shadows, ocre contrast contract honored on real surfaces.
- Typography: `text-wrap: balance` already on statement/title classes, SangBleu correctly caged to Case mode, body widths capped.
- Motion: `prefers-reduced-motion` respected in globals.css, SmoothScroll (Lenis fully disabled), RevealOnScroll, PeerBand, HeroBackdrop.
- Components: Button and SanityImg primitives used consistently; no re-implemented buttons found.
- Keyboard: DurationSlider, JournalSlider, ServicesDeck, FilterBar all arrow-key operable.
- Images: LCP heroes have `priority` + `sizes`; decorative images correctly `alt=""` + `aria-hidden`.
- Code: no console.logs, no commented-out blocks, no phantom imports; heading hierarchy sound on every page.

## Suggested fix order

1. P1 items 1-9 (one focused pass; items 3-6 and 8-9 are each under an hour).
2. P2 item 10-11 (motion + hex normalization, single commit, zero visual risk except the two duration changes).
3. P2 items 12-15 as a "token hygiene" commit touching globals.css once.
4. P3 accessibility items 16-19 together (one a11y commit).
5. P3 SEO items 20-21 with the deploy checklist from AUDIT_2026-07.md.
