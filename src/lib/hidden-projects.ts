// Projects temporarily hidden from every public surface (home shelf/slider,
// case-studies library, header mega menu, public /case-studies/[slug] routes).
// Token preview links stay live — this gates only the public web.
// Remove a slug here to bring the project back.
export const HIDDEN_PROJECT_SLUGS = new Set([
  "goldman",
  "level-shoes",
  "icrave-ballys-chicago",
  "icrave-sapphire",
  "icrave-southwest",
]);

// Journal articles about those projects, hidden from the public journal
// (home slider, /journal listing, /journal/[slug]); token previews stay live.
export const HIDDEN_JOURNAL_SLUGS = new Set([
  "level-shoes-bal-harbour",
  "icrave-ballys-chicago",
  "icrave-sapphire-lounges",
  "icrave-southwest-lounges",
]);
