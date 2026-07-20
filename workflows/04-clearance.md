# Client Clearance & Permissions Workflow (04)

**Status:** draft (proves itself on the NY Penthouse pilot)
**Last updated:** 2026-07-02
**Owner:** Demian (only he asks clients; the rest of the team runs the checklist and flags)

## Purpose & when to use

The gate at the top of every case study. Nothing enters production for a project until this doc's checklist is answered, and nothing publishes until it is answered in writing. Two failure modes it prevents, both real: producing work that can never ship (NDA), and cleared permissions rotting unused (the 2W 29th case study sat for weeks with permission in hand; the June audit called it out).

## Inputs required

- Project name and the client relationship (from Demi or the CRM).
- The original contract or email thread if an NDA or confidentiality clause exists.
- The Sanity `clientVisibility` field convention (project schema).

## Procedure

1. **Identify the rights holder.** Client studio, and behind them the developer/owner if the client's own contract restricts them. Record both.
2. **Check for hard blocks.** NDA (Star Island is the live example), unreleased projects, confidentiality pending (Goldman is the live example: film footage blocked since June). A hard block parks the project; do not produce "for later."
3. **Decide the ask level.** (a) Full case study with client name and credits, (b) case study with project shown but client anonymized, (c) imagery only, no story. Default ask is (a); prepare the fallback before asking.
4. **Make the ask in writing.** One email, drafted through the oaki-copywriting skill: what will be published (case study page, homepage book, social reuse), where, with what credit line. Ask once, completely, so a yes covers social repurposing later (the asset map's rule that nothing is produced twice depends on this).
5. **Record the answer.** Date, scope granted, credit line as the client wants it written, any exclusions (specific images, pricing, timeline details). Store in the project archive `source/` and set `clientVisibility` in Sanity accordingly.
6. **Use it or lose it rule.** A granted permission gets a production slot within 14 days or it is escalated to Demi with a date. Cleared-and-unpublished is a named failure, not a neutral state.

## Quality bar

The checklist is complete when someone who has never met the client can answer: may we name them, may we show every frame we hold, what credit line do we print, what may social reuse, and when did they say so. Anything ambiguous is a no until clarified.

## Output spec

A short clearance block at the top of the project's case-study copy doc: rights holder, scope granted (a/b/c), credit line verbatim, exclusions, date, link to the email. Plus the Sanity `clientVisibility` value set.

## Reference example

NY Penthouse: pending (the pilot run of this checklist, in progress below).

## Known failure modes / gotchas

- Asking for "permission to post" instead of scoping the full reuse (forces a second ask for social later).
- Assuming an old delivery implies publication rights; it does not.
- Anonymized case studies that are trivially identifiable from the imagery (the terrace with the Empire State view identifies the building's neighborhood by itself; anonymization must be judged against the frames, not just the text).
- Producing during "pending": a pending ask is a hard block with better manners.

## Open questions

- NY Penthouse pilot: see the run in progress (chat, 2026-07-02): rights holder, NDA state, and ask level needed from Demi.
