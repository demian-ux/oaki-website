# Services Copy Workflow (11)

**Status:** draft (first run below: the three audience variants, awaiting Demi's read-aloud)
**Last updated:** 2026-07-02
**Owner:** Demian approves; anyone drafts with this doc

## Purpose & when to use

Produces the Services section copy. Decision of record (Demi, 2026-07-02): Services lives as its own section, written three ways, one per audience: **architects, developers, technical directors**. Each variant explains the same three-stage offer (Concept / Proof / Campaign) through that audience's actual need. Rerun when the offer changes or an audience's language stops landing.

## Inputs required

- The 3-stage model definitions (business context): Concept = narrative to sell the project to investors, juries, approvals; Proof = precise images that communicate the design decisions; Campaign = pieces for sale and marketing (web, book, film, social).
- Audience truths, from real relationships not personas: architects (TBD, Naos: competitions, stakeholder approval, design intent), developers (OKO-type: investors, sales launch), technical directors (Andrew Delgado: capacity that holds an in-house standard).
- The oaki-copywriting skill (cloud version). All hard rules apply.

## Procedure

1. Per audience, name the one meeting the copy must win (architects: the approval room; developers: the investor and the sales launch; TDs: the capacity decision under deadline).
2. Write the statement (2-3 options), then one lede per stage that answers that audience's need through the stage. Two lines maximum each.
3. Harry Dry pass per string: picture it, falsify it, only-oaki.
4. Acceptance sweep: no em dashes, banned words absent, no design-contribution claims, pricing never justified, no US-office implication.
5. Demi reads aloud, picks the statement option, and the winning set goes to implementation (deck copy is currently hardcoded in `ServicesDeck.tsx`; the audience-switch UI is a separate design decision, not this doc's scope).

## Quality bar

Each variant must fail if shown to the wrong audience (a TD should shrug at the developer copy). If all three read interchangeably, the variant work is decoration and gets rewritten.

## Output spec

One copy file `services/services-copy_v##.md` (repo `workflows/copy/` until a better home exists), strings keyed by variant + stage.

## Reference example

v01 below (2026-07-02), pending Demi's pick.

## Known failure modes / gotchas

- Writing three tones of voice instead of three needs; the voice never changes, the need does.
- Letting stage explanations drift from the locked definitions above.
- The audience-switch UI leaking into copy scope; this doc ships words only.

## Open questions

- How the three variants surface on the page (tabs, route per audience, or context-aware) — a design decision for Demi + the deck component, after the copy is picked.
