# OG / Social Share Images Workflow (13)

**Status:** draft (proven on NY Penthouse, 2026-07-02)
**Last updated:** 2026-07-02
**Owner:** whoever loads the case study (this runs as step 7 of workflow 06 going forward)

## Purpose & when to use

One 1200x630 share image per case study (and per major page), so links render as editorial cards on LinkedIn, iMessage, Slack, and X, and AI answer engines have a frame to show. Run once per project at page load time; site-wide OG (homepage) is a one-off from the strongest cleared flagship frame.

## Inputs required

- The project's hero frame or cover master (full resolution, cleared).
- The Sanity `openGraphImage` field on the project doc.

## Procedure

1. Crop the master to 1200x630 with sharp (`fit: cover, position: attention`); eyeball the crop, the landscape ratio beheads portrait compositions easily; override position manually if the subject is lost.
2. Keep it a pure frame: no logo bake, no text overlay (the platform renders title text beside the card; text-on-image doubles it).
3. Export JPG under 300KB, name `{project}_og_{subject}_v##.jpg`, archive to the project `social/` folder.
4. Upload to Sanity, patch the project's `openGraphImage`.
5. Verify: query the doc back; once deployed, check with a share debugger (LinkedIn Post Inspector / opengraph.xyz).

## Quality bar

Subject survives the landscape crop; reads at 400px wide (feed size); same grade family as the site (F2); no address/identifying info for exclusion-bound projects beyond what the cleared imagery itself shows.

## Output spec

1200x630 JPG < 300KB in `social/`, referenced from Sanity `openGraphImage`.

## Reference example

NY Penthouse (2026-07-02): terrace night master, attention crop, patched to `project-ny-penthouse`.

## Known failure modes / gotchas

- Portrait covers crop badly to 1200x630; crop from the FULL master frame, not from the 1100x1945 cover crop.
- The homepage OG is still unset in `layout.tsx` metadata (audit item); the copy handoff §6 wants a flagship frame, not a Star Island placeholder.

## Open questions

- Site-wide OG frame choice (KoDA or AFT recommended by the copy handoff): Demi picks once the case-study set grows.
