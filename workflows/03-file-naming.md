# File Naming & Asset Organization (F3)

**Status:** draft (proves itself on the NY Penthouse pilot)
**Last updated:** 2026-07-02
**Owner:** Diego (enforces at QA); anyone may flag violations

## Purpose & when to use

One scheme for every asset the studio produces, applied before the library grows. The current state is the disease this cures: `Living.jpg`, `guccibath.jpg`, `main airea.jpg`, `hf_*.png`, spaces, inconsistent case, no project or phase encoded. A file found out of context must identify itself.

## The scheme

### Names

```
{project}_{fase}_{subject}_{v##}.{ext}
```

- `{project}`: kebab-case slug, matches the Sanity slug. `ny-penthouse`, `star-island`, `803-hunter-rd`.
- `{fase}`: the 6-phase framework digit pair. `00` Vision, `01` Spirit, `02` Human Trace, `03` Detail, `04` Experience, `05` Synthesis. Use `xx` for assets outside the framework (covers, OG, mockups): `cov` cover, `og` share image, `mck` mockup, `mot` motion, `soc` social.
- `{subject}`: kebab-case, short, concrete. `living`, `terrace-pool-night`, `stair`, `kitchen`.
- `{v##}`: version, two digits. The shipped version is the highest number; never overwrite a version.
- Lowercase everything. No spaces, ever. ASCII only.

Examples: `ny-penthouse_04_living_v01.jpg` · `ny-penthouse_cov_terrace-pool-night_v03.tif` · `ny-penthouse_mot_living-dolly_v01.mp4` · `ny-penthouse_og_cover_v01.jpg`

### Folders (per project, in the studio archive)

```
{project}/
  source/     raw renders + client input, untouched, original names preserved inside a dated subfolder
  work/       enhancer outputs, PSDs, i2v intermediates (safe to purge after ship)
  master/     graded masters per F2, named per scheme, never purged
  web/        sharp-optimized derivatives actually shipped (repo/public or Sanity uploads)
  social/     crops + reels derived from master
```

### Where the shipped file lives

- Site-wide statics: `oaki-studio/public/images/` keeps its existing convention (hero covers stay `01.jpg`-`07.jpg` by shelf slot; the master behind each slot lives in the project archive under the scheme).
- Case-study media: uploaded to Sanity (CDN names are Sanity's; the FILENAME AT UPLOAD follows the scheme so the asset list stays searchable).
- Brand assets: `public/brand/`, existing names locked.

## Procedure

1. New project: create the five folders, drop client input in `source/{date}/` untouched.
2. Before grading: copy the chosen frames to `work/`, renamed to the scheme at `v01`.
3. Master export per F2 goes to `master/` with the same name; bump `v##` on regrades.
4. Ship step copies to `web/` (sharp) or uploads to Sanity; social crops to `social/`.
5. Pilot rule: rename-in-place is allowed once (NY Penthouse's 10 loose files get scheme names when they enter the pipeline); after the pilot, out-of-scheme files do not enter `master/`.

## Quality bar

A reviewer can answer, from the filename alone: which project, which phase or asset class, which subject, which version. If not, rename before it proceeds.

## Known failure modes / gotchas

- Spaces and accents break URLs, sharp scripts, and Sanity search. The current `Lounge terrace.jpg` and `main airea.jpg` are live examples (including the typo the scheme would have caught).
- `final`, `final2`, `FINAL-ok` are banned; versions are numbers.
- Do not rename inside `source/`: client-supplied names are evidence.

## Open questions

- Whether the studio archive root lives on OneDrive or a NAS: Demi decides; the scheme is location-independent.
