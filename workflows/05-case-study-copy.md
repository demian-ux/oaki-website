# Case Study Copy Workflow (05)

**Status:** draft (proves itself on the NY Penthouse pilot)
**Last updated:** 2026-07-02
**Owner:** Demian approves final copy; anyone can produce the draft with this doc

## Purpose & when to use

Produces the complete written layer of one case study: title, subtitle, the 6-phase narrative (00-05), image captions, the library-card tease, and the SEO/meta strings. Run once per project, after clearance (04) and before the page build (06), because the copy decides which frames the page needs, not the other way around.

## Inputs required

- **Clearance block** from 04 at the top of this project's copy file: rights holder, scope, credit line verbatim, date.
- **Project facts from Demi or the archive:** client studio and city, project location, program (residential/hospitality/etc.), year delivered, what oaki was asked to do (the brief in one sentence), what was delivered (stills count, film, animation), anything the client said afterward.
- **The frames.** Copy is written against the actual renders (per F3, the `master/` set), never in the abstract. Each phase section names the frames it speaks over.
- **The skills.** Structure through `oaki-case-study`; every string through `oaki-copywriting` (current cloud version, not the desktop copy). English. No em dashes. Banned-word list applies. No brand yardsticks. Never claim design contribution: "we fill in the gaps the model leaves."

## Tools & models

- Claude with the `oaki-case-study` + `oaki-copywriting` skills (2-3 options per key string, Harry Dry checks: can I picture it, can I falsify it, could only oaki say this).
- No generative copy without the skills loaded. Generic AI voice is a reject condition.

## Procedure

1. Paste the clearance block. Confirm scope covers everything the copy will claim.
2. Collect the project facts (inputs above). Missing facts stop the draft; do not invent scope, dates, or client quotes.
3. Map the frames to the six phases. Every phase gets at least one frame it narrates; frames that fit no phase go to 05 Synthesis or get cut from the page plan.
   - 00 The Vision: the project's DNA, why it exists, the one-line thesis.
   - 01 The Spirit: city and exterior character.
   - 02 The Human Trace: daily life, the human factor in the frames.
   - 03 The Detail: materials, macros, construction truth.
   - 04 The Experience: the hero views.
   - 05 The Synthesis: the closing index, what the set adds up to.
4. Draft with `oaki-case-study`: title, subtitle, phase texts (short; the images carry the page), captions where a frame needs one.
5. Write the library-card tease (verb-led single line: composed, framed, told, set, cut) and the meta strings (title, description, OG copy).
6. Run the full text through `oaki-copywriting` checks, then the acceptance sweep: zero em dashes, zero banned words, credit line exactly as granted.
7. Demi reads once, out loud. Anything he stumbles on gets rewritten, not defended.

## Prompt templates / parameters

- Phase text scaffold: "{fase-name}. {what the frames show, concretely}. {the single editorial observation only oaki would make}." Two lines maximum per paragraph; every sentence earns its line.
- Tease scaffold: "{verb-led line about the story, not the deliverables}."

## Quality bar

- 6-phase framework intact, phase names unchanged.
- Every claim falsifiable against the archive (counts, dates, deliverables).
- Passes the three Harry Dry questions; a competitor could not sign the text.
- oaki-copywriting hard rules: English, no em dashes, banned words absent, no Phaidon/Assouline, pricing never justified, no design-contribution claims, oaki is Buenos Aires production (never "NY studio").

## Output spec

One markdown file per project in the archive: `{project}/copy/{project}_copy_v##.md` containing clearance block, all strings keyed by Sanity field name (title, subtitle, phase 00-05 heading+body, captions, tease, seoTitle, seoDescription), ready for 06 to load without editorial judgment.

## Time & cost estimate

<!-- Fill after the pilot. Target: half a day per project once warm. -->

## Reference example

NY Penthouse: `NY Penthouse/copy/ny-penthouse_copy_v02.md` (2026-07-02). First full run; intake gaps were resolved from the Gmail archive (search the client + project name before asking anyone; the threads held all three intake points with dates).

## Known failure modes / gotchas

- Writing copy before frames are chosen (the page then demands images that do not exist).
- Inventing a client quote or a fact to fill a phase; a thin phase is thinner copy, not fiction.
- The desktop oaki-copywriting SKILL.md is outdated (still carries Phaidon lines and the two-hour promise); use the cloud skill.
- Sanity fields override code fallbacks: once loaded, editing code copy does nothing (known gotcha).

## Open questions

- None for the doc; pilot facts pending from Demi (see chat).
