# Oaki Studio — Design System

Single source of truth for tokens, components, and the rules that hold the site together. If you're about to add a hex value, a magic number, or a `style={{}}` block, check here first.

---

## Principles

1. **Editorial, not corporate.** Phaidon books are the reference. Wide whitespace, square corners, restrained color, no shadows.
2. **Consistency over creativity.** The system exists so you don't reinvent. Reach for an existing primitive before writing markup.
3. **Tokens, not literals.** Hex values, font names, motion durations, and spacing scales live in `globals.css` only. Everywhere else uses Tailwind classes or `var(--*)`.
4. **Square corners on purpose.** Every interactive element is `rounded-none`. Rounded corners would break the editorial feel. Don't add `rounded-md`.
5. **No em dashes in copy.** They read as AI-generated. Restructure the sentence instead. (See [`oaki-copywriting`](https://...) skill for full copy rules.)

---

## Tokens (`src/app/globals.css`)

### Colors — brand
| Token | Hex | Use |
|---|---|---|
| `--color-ink` | `#222222` | Primary text, primary button background |
| `--color-paper` | `#ffffff` | Page background, inverted text |
| `--color-warm` | `#c6b193` | Accent (focus, hover state on primary button, FASE markers, required asterisks) |
| `--color-soft` | `#f4f2ee` | Section backgrounds, placeholder fills |
| `--color-line` | `#e8e5df` | Borders, dividers, low-emphasis fills |
| `--color-muted` | `#8f8a82` | Secondary text, metadata, captions |

### Colors — state
| Token | Hex | Use |
|---|---|---|
| `--color-error` | `#c0392b` | Form errors, validation messages |
| `--color-success` | `#4a7c59` | Confirmation states (not yet used on site, defined for future) |
| `--color-divider-dark` | `#444444` | Dividers on dark surfaces (e.g. preview banner) |

Each color auto-generates Tailwind utilities: `bg-ink`, `text-warm`, `border-line`, etc. **Always use the utility when possible.** Inline `style={{ color: "var(--color-muted)" }}` is allowed only when the property has no Tailwind equivalent.

### Typography

Three fonts, loaded via `next/font/local` in `src/app/layout.tsx`:

| Token | Font | Tailwind utility | Use |
|---|---|---|---|
| `--font-sans` | Neue Montreal | `font-sans` | Body text, UI, labels |
| `--font-display` | PP Neue Machina | `font-display` | Headings, FASE markers, large statements |
| `--font-serif` | SangBleu | `font-serif` | Editorial body, pull quotes, testimonials |

#### Typography classes

These already include `font-family` — don't redeclare it.

| Class | Font | Size | Use |
|---|---|---|---|
| `.text-display-xl` | display | clamp(2.5rem, 6vw, 5rem) | Hero H1 |
| `.text-display-lg` | display | clamp(2rem, 4vw, 3.5rem) | Page-level H2 |
| `.text-display-md` | display | clamp(1.5rem, 3vw, 2.5rem) | Section heading |
| `.text-editorial` | serif | clamp(1.125rem, 2vw, 1.375rem) | Body copy, editorial paragraphs |
| `.text-body` | sans | 1rem | Default body |
| `.text-label` | sans | 0.6875rem, uppercase, tracked | Section labels, button text, captions |
| `.text-meta` | sans | 0.8125rem | Metadata, fine print |

**Override font only when intentional.** Examples: `text-display-md font-serif` renders a heading in serif (a real override — display heading rendered editorially). Don't redeclare the font that the class already sets.

### Spacing

| Token | Mobile | Desktop |
|---|---|---|
| `--spacing-page-x` | 2rem | 3rem |
| `--spacing-section-y` | 6rem | 10rem |
| `--spacing-hero-y` | 5rem | 7rem |

Used via utilities: `.page-x`, `.section-y`, `.hero-y`. Apply them to every section instead of writing custom padding.

`.max-text` caps body copy width at 760px for readability.

### Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 200ms | Form controls, filter toggles |
| `--motion-base` | 300ms | Buttons, links, color transitions (default) |
| `--motion-slow` | 500ms | Image hover scales, large transforms |
| `--motion-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material-style ease |
| `--motion-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Exit/reveal transitions |

In Tailwind, use `duration-200`/`300`/`500` (they map to the same values).

`prefers-reduced-motion: reduce` is respected globally in `globals.css` — all animation/transition durations collapse to ~0ms.

---

## Components

### `<Button>` — `components/global/Button.tsx`

The only way to render a button or button-shaped link. Never re-implement `border border-ink px-6 py-3 hover:bg-ink hover:text-paper`.

```tsx
<Button variant="primary | ghost | outline" size="sm | md | lg" href="/contact">
  Begin the Conversation
</Button>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"primary" \| "ghost" \| "outline"` | `"primary"` | primary = dark fill, outline = bordered, ghost = text-link |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | sm = header CTA, md = default, lg = hero/final CTAs |
| `href` | string | — | If provided, renders `<Link>` or `<a>` (with `external`) instead of `<button>` |
| `onClick` | `() => void` | — | Works on both `<button>` and link variants |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Only applies when no `href` |
| `disabled` | boolean | `false` | Applies `opacity-40` and `cursor-not-allowed` |
| `external` | boolean | `false` | Opens in new tab with `noopener noreferrer` |

### `<SectionLabel>` — `components/global/SectionLabel.tsx`

The small uppercase sans-serif label above section headings and on metadata keys. Replaces `<p className="text-label text-muted">`.

```tsx
<SectionLabel className="mb-6">About the Studio</SectionLabel>
<SectionLabel as="span" tone="warm">FASE 00</SectionLabel>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `"p" \| "span"` | `"p"` | Use `span` for inline labels |
| `tone` | `"muted" \| "ink" \| "warm"` | `"muted"` | Color |
| `className` | string | `""` | For margins (`mb-4`, `mb-12`, etc.) and layout |

### `<SanityImg>` — `components/global/SanityImg.tsx`

Renders a Sanity image with `next/image`. Handles `fill` vs fixed dimensions, LQIP blur-up, and a `fallback` slot when the image is absent.

```tsx
<SanityImg
  image={project.coverImage}
  alt={project.title}
  fill
  sizes="(max-width: 640px) 100vw, 33vw"
  className="object-cover"
  fallback={<PlaceholderCover title={project.title} />}
/>
```

### `<Header>`, `<Footer>`, `<MobileMenu>` — `components/global/`

Global chrome. Header transitions from transparent to white on scroll. Footer carries the logotype + isotipo background motif at 4% opacity.

### `<BookCard>`, `<BookGrid>`, `<FilterBar>` — `components/case-studies/`

Project library UI. `BookCard` falls back to a placeholder cover with initials if no `coverImage`.

### `<PhaseSection>` — `components/case-studies/PhaseSection.tsx`

Renders one FASE block on a case study. Six layout variants: `Fullscreen`, `Horizontal Gallery`, `Split Text Image`, `Material Study`, `Image Grid`, `Contact Sheet`. Layout is selected by `phase.layoutType` from Sanity.

### `<ContactForm>` — `components/contact/ContactForm.tsx`

Six-step contact wizard. Uses `<Button>` for submit, `<SectionLabel>` for step indicators, native `<label htmlFor>` for accessible form labels (must remain as `<label>`, not `SectionLabel`).

---

## Brand Assets

Logos live in `/public/brand/`:

- `oaki-logotipo.png` — black wordmark for light backgrounds
- `oaki-logotipo-white.png` — white wordmark for dark backgrounds
- `oaki-isotipo.png` — black mark for light backgrounds
- `oaki-isotipo-white.png` — white mark for dark backgrounds

Favicon: `src/app/icon.png` (Next.js App Router auto-detects).

**Rules:**
- Logotype responsive width: `clamp(120px, 12vw, 190px)` for header, smaller for footer/mobile menu.
- Isotipo as motif: `opacity: 0.04` only. Never repeat as a pattern.
- Never recolor the PNGs. If you need a different color, request an SVG.

---

## What NOT to do

| ❌ Don't | ✅ Do |
|---|---|
| `<p className="text-label text-muted" style={{ fontFamily: "var(--font-sans)" }}>` | `<SectionLabel>` |
| `<Link className="text-label text-ink border border-ink px-6 py-3 hover:bg-ink hover:text-paper transition-colors duration-300">` | `<Button variant="outline" href="...">` |
| `style={{ color: "var(--color-muted)" }}` | `className="text-muted"` |
| `style={{ background: "var(--color-soft)" }}` | `className="bg-soft"` |
| `style={{ fontFamily: "var(--font-serif)" }}` on a `.text-editorial` element | The class already sets it — remove the inline |
| `style={{ background: "#222222" }}` | `className="bg-ink"` — never hardcode hex outside `globals.css` |
| `<button className="rounded-md ...">` | `<Button>` (square corners only) |
| Em dash in copy: `Most studios — like render factories — ...` | Rewrite: `Most studios run like render factories.` |
| `duration-400` | `duration-300` (base) or `duration-500` (slow). Pick one. |
| New animation: `cubic-bezier(0.5, 0, 0.5, 1)` inline | `var(--motion-ease)` or `var(--motion-ease-out)` |

---

## Adding to the System

Before adding a new component:

1. Does an existing primitive (`Button`, `SectionLabel`, `SanityImg`) cover it with a new prop?
2. Is this pattern used in 3+ places? If only 1–2, don't abstract yet.
3. Does it need new tokens? Add them to `globals.css` first.
4. Document it in this file before merging.

Before adding a new color, font, or motion token:

1. Can an existing token cover it? If `#a5a5a5` is needed once, ask whether `--color-muted` or `--color-line` works instead.
2. If genuinely new, add to `globals.css` `@theme` AND `:root`, and add a row to the table above.
