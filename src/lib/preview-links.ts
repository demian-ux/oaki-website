// Private journal preview links: unguessable token → the post(s) that link
// shows. Each client gets a link to exactly their article(s); the ICRAVE set
// is one link with three articles for Andrew. Routes at
// /journal/preview/<token> render noindex and never enter the sitemap.
//
// Tokens are random; changing one revokes the old link on the next deploy.

export interface PreviewLink {
  /** Who this link is for — shown only in the small preview banner. */
  label: string;
  slugs: string[];
}

export const previewLinks: Record<string, PreviewLink> = {
  // Awards
  a25km20z2rdyas47qf6m: { label: "Oak House", slugs: ["oak-house-aia-florida-2026"] },
  "9nyd55per3ggr6m51xh9": { label: "Prismatic Parasol", slugs: ["prismatic-parasol-architizer"] },
  "5gn802s8cfz9f4qxt1wy": { label: "CDG 34 Juvignac", slugs: ["cdg34-juvignac-competition-win"] },
  trrbvr2803hdrsdnkzpn: { label: "MIAC", slugs: ["miac-aia-miami-2023"] },
  "8sys0t9p1fp1q8fzmtc8": { label: "Carved Terrace Block", slugs: ["sf-housing-aiasf-merit"] },

  // Market outcomes
  "820bmk2nf41ed1c95edh": { label: "Maison Rive Gauche", slugs: ["maison-rive-gauche-sale"] },
  xbz5az873v12yaxg844h: { label: "94 S Hibiscus", slugs: ["94-s-hibiscus-sale"] },

  // News-peg stories
  vynzpzbkdn6xkgta4624: { label: "ICNYC", slugs: ["icnyc-campaign"] },
  h7jpv20gd0a33yz2bwj7: { label: "Level Shoes", slugs: ["level-shoes-bal-harbour"] },
  gbd83wjkggst5855v4pv: { label: "Moncayo", slugs: ["moncayo-puerto-rico"] },
  "0vk6cz8tq88zrdrnka1j": { label: "Bay House", slugs: ["bay-house-geiger-site"] },
  z8e5eqa2w5jv11krfa7g: { label: "8 Rockledge", slugs: ["8-rockledge-gardens"] },
  jt23nkswvqtq6ks4fgaw: { label: "Dixon House", slugs: ["dixon-house-gardens"] },

  // ICRAVE set — one link for Andrew, three articles on one page
  h4z9sg5qe8e37kkg4vw7: {
    label: "ICRAVE set",
    slugs: ["icrave-sapphire-lounges", "icrave-ballys-chicago", "icrave-southwest-lounges"],
  },
  // Individual ICRAVE articles, if a single-article link is ever needed
  "8xppv05k2jb8kvmb2bjt": { label: "Sapphire lounges", slugs: ["icrave-sapphire-lounges"] },
  "309h22kgvs497wpm2cxy": { label: "Bally's Chicago", slugs: ["icrave-ballys-chicago"] },
  prh9c8dk0kdmm9kftt9s: { label: "Southwest lounges", slugs: ["icrave-southwest-lounges"] },
};
