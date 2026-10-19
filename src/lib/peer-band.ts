// The proof band's data, shared by the homepage and the selected-work
// landing so both tell the same story: who said what, and who has hired
// the studio. The first homepage quote comes from Sanity (editable); these
// are the verified, attribution-permitting set that follows it.

export const fallbackPeerBand = {
  heading: "Trusted by the people who could do it themselves.",
  quote:
    "You overcome any obstacle that we throw at your team with the technical skills and ability to work to meet the deliverables.",
  authorName: "Andrew Delgado",
  authorTitle: "Technical Director of Visualization, Journey / iCrave",
  factStrip: "100+ projects · 12 cities · 4 continents · since 2019",
};

// Client roster for the "Trusted by" bar. Names from the studio's client list;
// URLs verified to each firm's official site (left undefined when no official
// site was confirmed, so the name renders as plain text, not a broken link).
export const clientMarks: { name: string; url?: string }[] = [
  { name: "AFT arquitectos", url: "https://www.aftarquitectos.com.ar" },
  { name: "Asifa Tirmizi", url: "https://www.tirmizi.co" },
  { name: "Aura Architecture", url: "https://www.aura-architecte.com" },
  { name: "BKS Partners", url: "https://bks-partner.de" },
  { name: "Ceïba", url: "https://www.ceiba.us" }, // formerly Koqio — one name site-wide, matches the Dillido credit
  { name: "Cochet Pais", url: "https://www.cochetpais.com" },
  { name: "DNA Miami", url: "https://www.dna-arc.com" },
  { name: "Fornaris Pau", url: "https://fpadesigns.com" },
  { name: "Gregory Tuck", url: "https://www.gregorytuck.com" },
  { name: "iCrave", url: "https://icrave.com" },
  { name: "Inch", url: "https://inch.com.ar/inicio/" },
  { name: "JHID", url: "https://www.jhinteriordesign.com" },
  { name: "Koda", url: "https://www.kodamiami.com" },
  { name: "LandFluent", url: "https://landfluent.com" },
  { name: "Lawrence + Long", url: "https://www.lawrenceandlong.com" },
  { name: "Naos" }, // low confidence — candidate naos-architecture.fr, several French firms share the name
  { name: "Object Territories", url: "https://object-territories.com" },
  { name: "Studio ST architects", url: "https://studio-st.com" },
  { name: "TBD Architecture", url: "https://www.tbddesignstudio.com" },
];

// Additional client testimonials that cycle in after Andrew's.
export const additionalPeerQuotes = [
  {
    quote:
      "Knowing the results will be excellent. It's reassuring to have their support, especially in a competitive field where stress is high.",
    authorName: "David Reichert",
    authorTitle: "BKS",
  },
  {
    quote:
      "For us, an image needs to spark all the senses. The building and architecture become secondary as it relates to marketing imagery.",
    authorName: "Javier Fornaris Pau",
    authorTitle: "FPA+A",
  },
  {
    quote: "The quality has held up from when we first received it to now.",
    authorName: "Michael Kokora",
    authorTitle: "Object Territories",
  },
];
