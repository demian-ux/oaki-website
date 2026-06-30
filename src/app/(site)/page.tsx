import { getHomePage } from "@/lib/data";
import Button from "@/components/global/Button";
import HeroShelf from "@/components/home/HeroShelf";
import JournalSlider from "@/components/home/JournalSlider";
import PeerBand from "@/components/home/PeerBand";
import ServicesDeck from "@/components/home/ServicesDeck";
import { journalArticlesMock } from "@/lib/journal-mock";

export { generateMetadata } from "./home-metadata";

const fallbackPeerBand = {
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
const clientMarks: { name: string; url?: string }[] = [
  { name: "AFT arquitectos", url: "https://www.aftarquitectos.com.ar" },
  { name: "Asifa Tirmizi", url: "https://www.tirmizi.co" },
  { name: "Aura Architecture", url: "https://www.aura-architecte.com" },
  { name: "BKS Partners", url: "https://www.bks-partner.de" },
  { name: "Cochet Pais", url: "https://www.cochetpais.com" },
  { name: "DNA Miami", url: "https://www.dna-arc.com" },
  { name: "Fornaris Pau", url: "https://fpadesigns.com" },
  { name: "Garrett Singer", url: "https://www.garrettsinger.com" },
  { name: "Gregory Tuck", url: "https://www.gregorytuck.com" },
  { name: "iCrave", url: "https://icrave.com" },
  { name: "Inch" }, // unresolved — no official site confirmed
  { name: "Jessica Helgerson ID", url: "https://www.jhinteriordesign.com" },
  { name: "KoDA", url: "https://www.kodamiami.com" },
  { name: "Koqio", url: "https://www.ceiba.us" }, // koqio.us now redirects to ceiba.us
  { name: "LandFluent", url: "https://landfluent.com" },
  { name: "Lawrence Architects" }, // low confidence — candidate lawrencearchitects.com, unverified
  { name: "MatiPavon" }, // only an Instagram profile found, no website
  { name: "MdB3d", url: "https://mdb3d.nl" },
  { name: "Naos" }, // low confidence — candidate naos-architecture.fr, several French firms share the name
  { name: "Object Territories", url: "https://object-territories.com" },
  { name: "Portia Fox", url: "https://portiafox.com" },
  { name: "Studio ST architects", url: "https://studio-st.com" },
  { name: "TBD Architecture", url: "https://www.tbddesignstudio.com" },
];

// Additional client testimonials that cycle in after Andrew's. Verified,
// attribution-permitting. The first quote comes from Sanity (editable); these
// follow in sequence.
const additionalPeerQuotes = [
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

export default async function HomePage() {
  const home = await getHomePage();

  return (
    <>
      {/* 1. Hero — animated wordmark → drifting project-book shelf */}
      <HeroShelf />

      {/* 2. Concept — full-screen declarative statement. */}
      <section className="min-h-screen flex items-center page-x border-t border-line">
        <div className="w-full">
          <h2 className="text-statement text-volume reveal mb-2">
            {(home.conceptHeading ?? "We show your project before it exists").replace(/\.$/, "")}
            <span className="dot">.</span>
          </h2>
          <p className="text-lede text-muted max-w-3xl">
            {home.conceptBody ??
              "Stills, film, and narrative, composed as one. Not a deliverable, the version of your project people fall for at the pitch and remember long after."}
          </p>
        </div>
      </section>

      {/* 3. Journal — editorial peek carousel of recent entries. */}
      <JournalSlider articles={journalArticlesMock} />

      {/* 4. Peer Band — proof follows the claim. */}
      <PeerBand
        quotes={[
          {
            quote: home.peerBandQuote ?? fallbackPeerBand.quote,
            authorName: home.peerBandAuthorName ?? fallbackPeerBand.authorName,
            authorTitle: home.peerBandAuthorTitle ?? fallbackPeerBand.authorTitle,
          },
          ...additionalPeerQuotes,
        ]}
        clientMarks={clientMarks}
        factStrip={home.factStrip ?? fallbackPeerBand.factStrip}
      />

      {/* 5. Services — horizontal slide deck: Concept, Proof, Campaign. */}
      <ServicesDeck />

      {/* 5. About — the trust spine: same team, every project. */}
      <section className="section-y page-x border-t border-line">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <p className="coord mb-6">{home.aboutLabel ?? "About the studio"}</p>
            <h2 className="text-statement text-volume reveal mb-8">
              {(home.aboutHeading ?? "The people you meet are the people doing the work").replace(/\.$/, "")}
              <span className="dot">.</span>
            </h2>
            <p className="text-lede text-muted mb-8">
              {home.aboutBody ??
                "oaki is built around one team, by choice. They carry every project from the first call to the final frame, principals included. Nothing gets lost between the people who understand your project and the people who build it."}
            </p>
            <Button href="/about" variant="outline">
              {home.aboutButtonLabel ?? "About the studio"}
            </Button>
          </div>
          <div className="hidden lg:block aspect-square mt-0 bg-line" />
        </div>
      </section>

      {/* 6. Contact — remove friction, foster connection. */}
      <section className="section-y page-x border-t border-line text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-statement text-volume reveal mb-6">
            {(home.finalCtaHeading ?? "Tell us what you’re building").replace(/\.$/, "")}
            <span className="dot">.</span>
          </h2>
          <p className="text-lede text-muted mb-10">
            You don’t need the brief finished. Send what you have, a plan, a
            reference, a rough idea, and we will take it from there.
          </p>
          <Button href="/contact" variant="primary" size="lg">
            {home.finalCtaButtonLabel ?? "Start a project"}
          </Button>
        </div>
      </section>
    </>
  );
}
