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
  "5u1fz8q9laht6yrwe2m4": { label: "Oak House", slug: "oak-house" },
  s6lnudet74fvi85gjacb: { label: "MIAC", slug: "miac" },
  htzoldqfp51v97cun03m: { label: "CDG 34 Headquarters", slug: "cdg34-juvignac" },
  slenkm5gvdayh0ruzqwp: { label: "Islamic Center of NYC", slug: "icnyc" },
  vti7agpc02u36frzynqk: { label: "Level Shoes", slug: "level-shoes" },
  "4rjbi2xw80ekqt9suhld": { label: "Moncayo", slug: "moncayo" },
  "0l58r4h2xk9tv6qbiocs": { label: "Bay House", slug: "bay-house" },
  a5x07rz94bc3tpwdmhqn: { label: "8 Rockledge", slug: "8-rockledge" },
  zo70r6k1yftdlsvj2a9n: { label: "Sapphire Lounges (iCrave, private)", slug: "icrave-sapphire" },
  ez9sv7wi6j5yd3mcrlba: { label: "Bally's Chicago Food Hall (iCrave, private)", slug: "icrave-ballys-chicago" },
  q8jbz3pynk4elsahxd5o: { label: "Southwest Lounges (iCrave, HARD GATE)", slug: "icrave-southwest" },
  sgdx3eacf20bvo6nrwpy: { label: "803 Hunter Rd", slug: "803-hunter-rd" },
  "7n5omzq1psrfd4x9h0bl": { label: "Cazouls les Bézier", slug: "cazouls-les-bezier" },
  i16ij50oym7j41jnrdse: { label: "Dillido Residence", slug: "dillido-residence" },
  fdy9fcc3munh9uxlrupo: { label: "Windsor Residence", slug: "windsor-residence" },
  m3xq81vkw7yrn5t2ojdc: { label: "K Villa", slug: "k-villa" },
  b2wq7ndk4xm9rte0shcv: { label: "Carved Terrace Block", slug: "sf-housing-schemes" },
  y6hd3pkz0qvl8snw2fjr: { label: "Dixon House", slug: "dixon-house" },
};
