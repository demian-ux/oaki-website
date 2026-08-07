import { getHomePage, getJournalPosts } from "@/lib/data";
import Button from "@/components/global/Button";
import HeroShelf from "@/components/home/HeroShelf";
import JournalSlider from "@/components/home/JournalSlider";
import PeerBand from "@/components/home/PeerBand";
import ServicesDeck from "@/components/home/ServicesDeck";
import { journalArticlesMock, type JournalArticle } from "@/lib/journal-mock";
import { formatJournalDate } from "@/lib/format";
import { getJournalLocalImages } from "@/lib/journal-images";
import { urlFor } from "@/sanity/client";

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
  const [home, journalPosts] = await Promise.all([getHomePage(), getJournalPosts()]);

  // Map Sanity posts into the shape the (untouched) slider consumes. Image
  // fallback chain matches the article template: Sanity cover → image-library
  // hero → local mock path. Entries with no image can't ride the carousel;
  // while none qualify the mock set keeps the section alive, exactly as before.
  const journalArticles: JournalArticle[] = journalPosts
    .map((post) => {
      const libHero = getJournalLocalImages(post.slug).hero;
      const libSrc = libHero
        ? [...libHero.webp].sort((a, b) => b.width - a.width)[0]?.src ?? ""
        : "";
      return {
        slug: post.slug,
        category: post.category ?? "Journal",
        title: post.title,
        excerpt: post.excerpt ?? "",
        date: formatJournalDate(post.date),
        readMins: post.readMins ?? 1,
        img: post.coverImage?.asset
          ? urlFor(post.coverImage).width(1600).auto("format").url()
          : libSrc || (post.img ?? ""),
      };
    })
    .filter((a) => a.img !== "")
    .slice(0, 6);

  return (
    <>
      {/* 1. Hero — animated wordmark → drifting project-book shelf */}
      {/* Tagline is hardcoded on purpose: it renders regardless of what
          heroLabel / heroTitle hold in Sanity. */}
      <HeroShelf statement="Architecture, shown before it's built." />

      {/* 2. Manifesto — the quiet statement of what the studio is. Replaces the
          bare h-14 spacer that used to keep the grey journal ground off the
          hero: the air is now the section's own, so the separation is
          deliberate rather than a shim. Copy is hardcoded on purpose.

          The padding is load-bearing, not decoration. At exactly 50vh the
          section is (100vh + text height) tall, which already guarantees the
          paragraph can sit alone: centre it and each neighbour clears the
          frame by half the text block. The +4rem buys margin on top of that
          guarantee — it widens the band of scroll positions where nothing
          else is on screen from ~140px to ~270px, so the moment survives a
          bit of Lenis overshoot instead of only existing at one exact offset.
          Clearance is (textHeight / 2 + 4rem) at every viewport height, so
          this cannot go negative. Do not trade it down for a smaller gap. */}
      <section aria-label="Studio manifesto" className="page-x py-[calc(50vh+4rem)]">
        {/* Same centred column as the journal article body (JournalArticle.tsx
            MEASURE = 820), nudged 40px wider. 820 is the article measure, but
            justifying THIS copy at 820 stretched the first line's word spaces
            to 2.5x normal — a visible gappy line. Measured across 560-900px,
            860 is where this paragraph justifies evenly: worst line 1.28x
            natural spacing, and all lines within 1.17-1.28x so no single line
            reads loose. Retune if the copy changes. */}
        <div className="mx-auto" style={{ maxWidth: 860 }}>
          {/* .text-body is the journal article's own body class, and unlike
              .text-lede its font-size is a fixed 1.25rem rather than a fluid
              clamp. That matters here: a fluid size reshuffles the line breaks
              at every viewport width, so a justified block that is tuned at
              one width goes gappy at the next. Fixed size + fixed column = the
              same four lines, and the same spacing, at every width >= lg.

              Justified only from lg up. Below that the column is squeezed by
              the page gutters instead of the 860 cap, and short lines justify
              horribly: at 375px the worst line stretched to 4.2x normal word
              spacing. Narrow screens get ordinary left-ranged text. */}
          <p className="text-body text-muted reveal leading-[1.75] hyphens-auto text-left lg:text-justify">
            {"We are an architectural visualization studio working with architects, interior designers, and developers across the USA and Europe. Every project is treated as an editorial story: stills, film, and narrative built as one world. We don't need the brief spoon-fed. Give us what you have and we will make the images that carry your project into the room where everything is decided."}
          </p>
        </div>
      </section>

      {/* 3. Journal — editorial peek carousel of recent entries.
          (The old full-screen Concept statement lived here; the hero tagline
          now carries that claim, so the section was removed.) */}
      <JournalSlider
        articles={journalArticles.length > 0 ? journalArticles : journalArticlesMock}
      />

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

      {/* 6. About — the trust spine: same team, every project. */}
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

      {/* 7. Contact — remove friction, foster connection. */}
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
