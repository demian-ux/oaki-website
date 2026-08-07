# Typography Audit, August 2026

Scope: every page under `src/app/(site)` plus the components that render their headings,
audited against the homepage as the reference design system. Branch `journal/launch`,
uncommitted local state included.

## The reference system (homepage)

| Role | Classes | Result |
|---|---|---|
| Page/section statement | `text-statement text-volume` | Inktrap Ultrabold 800, uppercase, clamp(2rem, 4.6vw, 3.25rem), lh 0.92 |
| Subsection heading | `text-mode-title text-volume` | Same voice, clamp(1.75rem, 3.2vw, 2.5rem) |
| Small cap heading | `text-title` | Neue Machina, 18px, uppercase, spaced |
| Eyebrow | `coord` | 11px uppercase, warm-deep |
| Lede | `text-lede text-muted` | Sans, clamp(1.0625rem, 1.4vw, 1.25rem) |
| Headline period | trailing `.` stripped, ocre `<span class="dot">.</span>` appended | dot in `--color-warm` (#c6b193) |

Homepage sections ([page.tsx](src/app/(site)/page.tsx) 116, 154, 173) and the JournalSlider
heading all follow this exactly.

## Findings, ranked

### 1. Page titles (h1) sit on three different scales

- **On system**: About (36), Contact (23), Case-studies index (27), 404 (11), Sanity case
  hero ([slug]/page.tsx:99). All `text-statement text-volume`.
- **Process** ([process/page.tsx:61](src/app/(site)/process/page.tsx:61)): the page h1 uses
  `text-mode-title`, the *subsection* token. The Process page title renders smaller than a
  homepage section heading.
- **Journal index** ([journal/page.tsx:37](src/app/(site)/journal/page.tsx:37)): fully bespoke
  inline style, clamp(3rem, 10vw, 9.375rem) with **no font classes**. It therefore inherits the
  base `h1` rule (Neue Machina Plain, weight 400, uppercase) instead of the Inktrap volume
  voice. Different font, different weight (400 vs 800), and up to ~3x the system's max size.
- **Legal pages** (privacy, terms, cookies `page.tsx:10`): h1 is `text-title`, i.e. **18px**.
  Page titles at logo-cap size, an order of magnitude below every other page h1.

### 2. The ocre-dot headline rule only exists on the homepage

Homepage h2s strip the trailing period and append `<span class="dot">.</span>`. Everywhere
else the same sentence-style headings end in a plain ink period:

- About h1 fallback "...doesn't exist yet." ([about/page.tsx:36](src/app/(site)/about/page.tsx:36))
- About statement "...fail to move anyone." (about:50) and CTA (about:98)
- Contact h1 (contact:23), Process h1 (process:61), Process FASES h2 (process:108), Process CTA (process:126)
- Case study CTA (case-studies/[slug]:232), Journal article CTA (journal/[slug]:102)

Two places hand-roll their own dot instead of using `.dot`:

- Journal index h1 uses an inline span with `--color-warm` (journal/page.tsx:46)
- JournalArticle:60 and CaseDraft:126 use `--color-warm-500` (#b89c79), a **different ocre**
  than the homepage dot's `--color-warm` (#c6b193)

### 3. The same CTA sentence has three treatments

"Tell us what you're building" appears across the site as:

- Homepage final CTA: "Tell us what you're building" + ocre dot (contraction, dot)
- About CTA, Contact h1, Case CTA, Journal CTA: "Tell us what you are building." (no
  contraction, plain period)

One sentence, two spellings, two punctuation systems. Pick one (homepage version) and
propagate.

### 4. Journal index rows render article titles UPPERCASE by accident

[journal/page.tsx:94](src/app/(site)/journal/page.tsx:94): the row h2 sets inline size/weight
but never resets `text-transform`, so it inherits `uppercase` from the base h1-h6 rule. The
same articles are sentence case on their own pages (JournalArticle sets
`textTransform: "none"` explicitly). Also `fontWeight: 500` exists nowhere else in the
system (headings are 400 or 800).

### 5. Four bespoke heading stacks duplicate what tokens should own

- [JournalArticle.tsx:47](src/components/journal/JournalArticle.tsx:47) and
  [CaseDraft.tsx:114](src/components/case-studies/CaseDraft.tsx:114) carry **identical**
  inline article-headline styles (clamp 2.125-4.5rem, lh 0.92, sentence case). This is the
  documented Article voice, but it should be one token (e.g. `.text-article-title`), not
  copy-pasted inline styles in two files.
- [JournalNextRead.tsx:36](src/components/journal/JournalNextRead.tsx:36): a third inline
  variant (clamp 1.75-3.75rem, ls -0.01em).
- [ServicesDeck.module.css:31](src/components/home/ServicesDeck.module.css:31) `.statement`
  re-implements `text-statement text-volume` with a *smaller* clamp (1.75-3rem vs 2-3.25rem),
  so the Services section heading is slightly off the sibling homepage sections it sits between.

### 6. Semantic and small-cap nits

- About statement heading is a `<p className="text-mode-title text-volume">` (about:50); its
  homepage equivalent is an `<h2>`. Screen readers lose the section.
- Process FASES cards use `<p className="text-title">` (process:116) where BookCard and
  JournalBody use `<h3>` for the same role.
- ContactForm step titles (ContactForm:327) use `text-title` h2s. Defensible as wizard-step
  labels, but it is the only h2 on the site at 18px outside the legal pages.

### 7. Hero furniture and spacing drift (secondary)

- Rule under the hero heading: About uses `ocre-rule`, Contact / Case index / 404 use
  `StripeRule`, Process and Journal have none.
- Hero top padding varies per page: pt-28/36 (About), pt-24/32 (Contact, Process),
  pt-20 (Case index), pt-20/28 (Journal).
- Process step bodies use `text-body` (fixed 1.25rem) while every other body/lede on the
  page is `text-lede` (fluid clamp). Two body tokens on one page.

### 8. Dead code

`src/components/home/HomeHero.tsx` (the pre-shelf hero, h1 `text-statement text-volume`) is
imported nowhere. Delete or archive so it can't drift back in.

## Suggested normalization order

1. Legal pages h1: `text-title` -> `text-statement text-volume` (or at minimum `text-mode-title text-volume`).
2. Process h1: `text-mode-title` -> `text-statement`.
3. Add `textTransform: "none"` (or the article-title token) to journal index row titles; drop weight 500.
4. Extract `.text-article-title` token; use it in JournalArticle, CaseDraft, JournalNextRead; decide whether the journal index h1 stays a one-off display moment or adopts `text-statement text-volume`.
5. Apply the strip-period + `.dot` pattern to About, Contact, Process, Case CTA, Journal CTA headings; unify the dot color on `--color-warm` (articles currently use warm-500).
6. Unify the CTA sentence to the homepage wording ("Tell us what you're building" + dot).
7. Align ServicesDeck `.statement` clamp with `text-statement` (2-3.25rem).
8. Pick one hero rule (StripeRule or ocre-rule) and one hero padding scale.
9. Fix `<p>` headings to `<h2>`/`<h3>` (About statement, FASES cards); remove HomeHero.tsx.
