# Foundation Tokens Workflow (F1)

**Status:** stable (DS 4.1 confirmed canonical by Demi, 2026-07-02)
**Last updated:** 2026-07-02
**Owner:** Demian (the only person who may change a token value)

## Purpose & when to use

The single source every other workflow cites for color, type, spacing, and motion. No workflow doc, prompt template, or asset spec may hardcode a hex or a font name: it points here. Consult when building any asset; change only when the brand system itself changes, and then update this doc first, code second.

## Inputs required

- The live token block in `oaki-studio/src/app/globals.css` (the values below are copied from it, verified 2026-07-02).
- `DESIGN.md` and `brand/Oaki Brand Guidelines 4.1.html` for rationale.

## The tokens

### Color roles

| Role | Token | Hex | Rule |
|---|---|---|---|
| Ink / negro | `--color-ink` / `--color-negro` | #222222 | All primary text. Never pure black, anywhere, including image blacks. |
| Paper | `--color-paper` | #FFFFFF | Default ground. |
| Gris (warm paper) | `--color-gris` | #F4F3F0 | The paper grey; secondary grounds, loader, documents. |
| Ocre (the identifier) | `--color-warm` | #C6B193 | FILL ONLY on light surfaces (2.08:1, never text on light). The one accent; used sparingly. On dark ink grounds it IS text-legal. |
| Ocre text | `--color-warm-deep` | #7C6549 | The text-legal ocre on light (~5.9:1). Coordinate labels, accents in copy. |
| Ocre ground | `--color-warm-ground` | #9E8261 | Case-study drench ground only. |
| Ocre pale | `--color-warm-pale` | #F7F2EA | Type on the ocre ground. |
| Muted | `--color-muted` | #67645D | Secondary text (AA-safe; the old #8F8A82 is retired, do not reintroduce). |
| Line | `--color-line` | #E8E5DF | Hairlines, dividers on light. |

### Type registers (one job per font)

| Register | Font | Job |
|---|---|---|
| Volume display | PP NeueMachina Inktrap Ultrabold | Loud display: statements, mode titles, wordmark, giant case/section words. Uppercase. |
| Calm titles | PP NeueMachina Plain (Light/Regular) | Titles and statements that speak, not shout. |
| Body | Neue Montreal | All body, labels, UI. |
| Coordinate voice | Neue Montreal (via `--font-mono`) | Uppercase tracked labels (`.coord`), numeric indices, tags. Geist Mono was removed; do not reintroduce a true mono without a token change here. |
| Editorial serif | SangBleu | Case-study pull-quotes and designated editorial accents ONLY. Never Studio/Process body. |

### Spacing & motion

- Motion durations: wipe 650ms, tick 200ms, rise 650ms (`--dur-*`). Brand gestures: rise (22px translate + fade), wipe (left-to-right stripe draw), corner tick on hover.
- All motion respects `prefers-reduced-motion` (instant reveal, no travel).
- Book panel grounds: DEEP tone derived from each cover, lightness fixed at 19% (locked hexes + auto-derive JS in `oaki-home-book-backgrounds.md`; Raghsa #26353B, Cazouls #3B3726, Dillido #451E1C, Manhattan #3B3026, NY Penthouse #3B3226).

## Quality bar

An asset is on-token when: its blacks resolve to #222222-family, not #000; ocre appears at most once as the identifier and never as text on light unless it is #7C6549; grounds are paper or gris, not invented creams; type in graphics uses the registers above with their jobs.

## Known failure modes / gotchas

- Ocre as text on light backgrounds (fails contrast and the brand contract). Use warm-deep.
- Pure black in exports (crushed grades read as off-brand; see F2).
- Reintroducing retired values: #8F8A82 muted, Geist Mono, glassmorphism.
- The Turbopack dev CSS cache: `globals.css` edits may not propagate until `.next/dev` + `.next/cache` are deleted.

## Open questions

None. **Resolved 2026-07-02:** DS 4.1 is canonical (Demi). The scroll-spec rule "all titles ~18px, hierarchy never from size" is superseded; any doc or asset citing it defers to this file.
