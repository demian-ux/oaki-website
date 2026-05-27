import { getFeaturedProjects, getHomePage } from "@/lib/data";
import { defaultPhases } from "@/lib/placeholder-data";
import BookGrid from "@/components/case-studies/BookGrid";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import HomeHero from "@/components/home/HomeHero";
import PeerBand from "@/components/home/PeerBand";

// Metadata is owned by ./metadata.ts (generateMetadata is wired in there
// so the homepage can read Sanity for SEO copy too)
export { generateMetadata } from "./home-metadata";

const fallbackPeerBand = {
  heading: "Trusted by the people who could do it themselves.",
  quote:
    "You overcome any obstacle that we throw at your team with the technical skills and ability to work to meet the deliverables.",
  authorName: "Andrew Delgado",
  authorTitle: "Technical Director of Visualization, Journey / iCrave",
  clientMarks: [
    "KoDA",
    "Journey / iCrave",
    "AFT",
    "Object Territories",
    "Naos",
    "Ceibo / Koqio",
  ],
  factStrip: "100+ projects · 12 cities · 4 continents · since 2019",
};

const fallbackSubtextLines = [
  "For architectural, interior design and real estate development firms across New York, Miami, Europe, and the Middle East.",
  "Animation, stills, and film composed as one story, not a folder of jpegs.",
  "Work that holds up year after year.",
];

export default async function HomePage() {
  const [featured, home] = await Promise.all([
    getFeaturedProjects(),
    getHomePage(),
  ]);

  // Hero subhead arrives from Sanity as a single text block. Split on blank
  // line OR newline so each paragraph renders as its own <p>.
  const subtextRaw =
    home.heroSubtext ?? fallbackSubtextLines.join("\n\n");
  const subtextLines = subtextRaw
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      {/* 1. Hero */}
      <HomeHero
        label={home.heroLabel ?? "A studio building architectural narratives"}
        title={home.heroTitle ?? "Made for the pitch, the board, and the jury."}
        subtextLines={subtextLines}
        primaryCta={home.heroPrimaryCta ?? "Start a project"}
        secondaryCta={home.heroSecondaryCta ?? "See the case studies"}
      />

      {/* 2. Peer Band (replaces old testimonial + collaborators) */}
      <PeerBand
        heading={home.peerBandHeading ?? fallbackPeerBand.heading}
        quote={home.peerBandQuote ?? fallbackPeerBand.quote}
        authorName={home.peerBandAuthorName ?? fallbackPeerBand.authorName}
        authorTitle={home.peerBandAuthorTitle ?? fallbackPeerBand.authorTitle}
        clientMarks={
          home.clientMarks && home.clientMarks.length > 0
            ? home.clientMarks
            : fallbackPeerBand.clientMarks
        }
        factStrip={home.factStrip ?? fallbackPeerBand.factStrip}
      />

      {/* 3. Case Studies */}
      <section className="section-y page-x border-t border-line">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <SectionLabel className="mb-4">
              {home.featuredLabel ?? "Case studies"}
            </SectionLabel>
            <h2 className="text-display-md">
              {home.featuredHeading ?? "Each one a book of its own."}
            </h2>
          </div>
          <a
            href="/case-studies"
            className="text-label text-muted hover:text-ink transition-colors duration-300 shrink-0"
          >
            {home.featuredViewAllLabel ?? "View the Library →"}
          </a>
        </div>
        <BookGrid projects={featured.slice(0, 4)} />
      </section>

      {/* 4. Process lead-in + FASES */}
      <section className="section-y page-x border-t border-line">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <p className="text-display-md mb-8">
            {home.positioningHeading ??
              "Most studios start with a rough draft. We start with the story."}
          </p>
          <p className="text-editorial text-muted">
            {home.positioningParagraph1 ??
              "Our role is to understand the project, find its tone, and build the visual world that makes others want to be part of it before the first brick is laid."}
          </p>
        </div>
      </section>

      {/* 5. FASES grid with transition line as lead-in */}
      <section className="section-y page-x border-t border-line bg-soft">
        <p className="text-display-md mb-12 max-w-3xl">
          {home.fasesLabel ?? "Before we open 3ds Max, we ask questions to define:"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-line">
          {defaultPhases.map((phase) => (
            <div key={phase._id} className="p-8 bg-soft border-line">
              <p className="text-label text-warm mb-3 font-display">
                {phase.phaseNumber}
              </p>
              <p
                className="text-display-md"
                style={{ fontSize: "1.125rem", letterSpacing: "-0.01em" }}
              >
                {phase.phaseTitle}
              </p>
              <p className="text-meta text-muted mt-2">{phase.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/process" variant="outline">
            {home.fasesButtonLabel ?? "See the full process"}
          </Button>
        </div>
      </section>

      {/* 6. About Preview */}
      <section className="section-y page-x border-t border-line bg-soft">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <SectionLabel className="mb-6">
              {home.aboutLabel ?? "About the studio"}
            </SectionLabel>
            <h2 className="text-display-md mb-8">
              {home.aboutHeading ?? "The same team on every project."}
            </h2>
            <p className="text-editorial text-muted mb-8">
              {home.aboutBody ??
                "Principals on every brief. The people you meet are the people doing the work."}
            </p>
            <Button href="/about" variant="outline">
              {home.aboutButtonLabel ?? "About the Studio"}
            </Button>
          </div>
          <div className="hidden lg:block aspect-square mt-0 bg-line" />
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="section-y page-x border-t border-line text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-display-lg mb-10">
            {home.finalCtaHeading ?? "Tell us what you are building."}
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            {home.finalCtaButtonLabel ?? "Start a project"}
          </Button>
        </div>
      </section>
    </>
  );
}
