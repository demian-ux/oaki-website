# Oaki Studio → Figma

There is **no automated "codebase → editable Figma file" export**. Figma can only create
content through its in-app Plugin API, not through any external/REST API — so a coding agent
can't push the site into Figma directly. The two practical routes below get you there fast.

## 1. Design system → Figma variables & text styles (native, ~1 click)

`oaki-design-tokens.json` is a [Tokens Studio](https://tokens.studio/) file covering the full
v3.0 system: colours (incl. the ocre ramp), font families/weights/sizes, line-height,
letter-spacing, spacing scale, radii, and composite **text styles** (statement, mode-title,
coordinate, lede, editorial, label, meta, button).

1. In Figma, install the **Tokens Studio for Figma** plugin (free).
2. Plugin → menu → **Import** → upload `oaki-design-tokens.json` (or paste its contents).
3. Select the `global` set → **Create styles / Export to variables**. You now have the
   colour variables and text styles wired up.

Values are the **desktop maximums** of the site's `clamp()` sizes (Figma has no clamp). Set
letter-spacing/line-height units to **%** in Tokens Studio so they map cleanly.

## 2. Page layouts → Figma layers (plugin, runs in Figma)

To pull the actual rendered pages in as frames/layers, use a DOM-import plugin — the best is
**[html.to.design](https://www.figma.com/community/plugin/1159123024924461424)** (Builder.io
and Anima also work):

1. Run `npm run dev` (http://localhost:3001) — or deploy to a public URL.
2. In Figma, run html.to.design → import by URL. For `localhost`, use its **browser-extension
   capture** (it can't reach localhost from Figma's servers otherwise), or import the deployed URL.
3. Import `/`, `/process`, and `/case-studies/<slug>` to get all three modes.

This recreates layout/colour/type as Figma layers. Expect good visual fidelity but **flat-ish
layers** — not auto-layout components or bound variables. Pair it with route #1 so the imported
pages can be re-pointed at your real variables/text styles.

## Fonts (required for either route)

The brand faces are commercial and must be **installed locally so the Figma desktop app can use
them**, or the text will fall back:

- **Neue Montreal** (Pangram Pangram) — body/UI (`fontFamily.sans`)
- **PP Neue Machina** (Pangram Pangram) — display; the site ships the *Plain* cut, so the Figma
  family may read **"PP NeueMachina Plain"** (`fontFamily.display`)
- **SangBleu BP** (Swiss Typefaces) — Case-mode serif only (`fontFamily.serif`)
- **Geist Mono** (free, Vercel) — coordinate labels; the site currently falls back to system mono

The `.otf` files are in `oaki-studio/public/fonts/`.

## Logos

Brand marks to drop into the Figma file: `oaki-studio/public/brand/` — `oaki-logotipo.png`
(+ `-white`), `oaki-isotipo.png` (+ `-white`).
