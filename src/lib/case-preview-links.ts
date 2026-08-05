// Private case-study DRAFT preview links: unguessable token → the case
// draft it shows. Same rules as the journal previews: noindex, never in a
// sitemap, force-dynamic, a bad token 404s. These are Demi-review links
// first; client-facing only after prose approval (Esther sees hers before
// anything goes live).
//
// Tokens are random; changing one revokes the old link on the next deploy.

export interface CasePreviewLink {
  /** Who this link is for — shown only in the small preview banner. */
  label: string;
  slug: string;
}

export const casePreviewLinks: Record<string, CasePreviewLink> = {
  lsk70r7c70o12hl5xu25: { label: "Prismatic Parasol", slug: "prismatic-parasol" },
  unmjqx0mtb68whk98sn7: { label: "94 S Hibiscus", slug: "94-s-hibiscus" },
  tulx3wwb69xh5ea3ch0n: { label: "Alderbrook", slug: "alderbrook" },
  e08umrtr2j2fsux3o9ji: { label: "Manhattan Apartment", slug: "manhattan-apartment" },
};
