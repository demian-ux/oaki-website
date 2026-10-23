// Projects temporarily hidden from every public surface (home shelf/slider,
// case-studies library, header mega menu, public /case-studies/[slug] routes).
// Token preview links stay live — this gates only the public web.
// Remove a slug here to bring the project back.
export const HIDDEN_PROJECT_SLUGS = new Set([
  // Goldman and Pavilion Grove are cleared for private showing only: they
  // live on /selected-works (src/lib/selected-works.ts), never here.
  "goldman",
  "pavilion-grove",
  // Murray City: the Perkins Eastman set (2026-10-22), private viewing only.
  // Ski Center went public on the home shelf 2026-10-23 (location and
  // developer still withheld on the page).
  "murray-city",
  "numa",
  "level-shoes",
  "icrave-ballys-chicago",
  "icrave-sapphire",
  "icrave-southwest",
  // Dixon House (San Marino Island): awaiting client approval
  "dixon-house",
  // Hidden by Demi, 2026-10-21
  "8-rockledge",
  "94-s-hibiscus",
  "cdg34-juvignac",
  "sf-housing-schemes",
]);

// Journal articles about those projects, hidden from the public journal
// (home slider, /journal listing, /journal/[slug]); token previews stay live.
export const HIDDEN_JOURNAL_SLUGS = new Set([
  "level-shoes-bal-harbour",
  "icrave-ballys-chicago",
  "icrave-sapphire-lounges",
  "icrave-southwest-lounges",
  "dixon-house-gardens",
  // Hidden by Demi, 2026-10-21
  "8-rockledge-gardens",
  "bay-house-geiger-site",
  "moncayo-puerto-rico",
]);
