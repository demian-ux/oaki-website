import Link from "next/link";
import { getFeaturedProjects, getHomePage } from "@/lib/data";
import { defaultPhases } from "@/lib/placeholder-data";
import BookGrid from "@/components/case-studies/BookGrid";
import Button from "@/components/global/Button";
import StripeRule from "@/components/global/StripeRule";
import HeroShelf from "@/components/home/HeroShelf";
import PeerBand from "@/components/home/PeerBand";

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

export default async function HomePage() {
  const [featured, home] = await Promise.all([
    getFeaturedProjects(),
    getHomePage(),
  ]);

  return (
    <>
      {/* 1. Hero — animated wordmark → drifting project-book shelf */}
      <HeroShelf />

      {/* 2. Case Studies — moved up. Work before quote. */}
      <section className="section-y page-x border-t border-line">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="coord mb-4">{home.featuredLabel ?? "Case studies"}</p>
            <h2 className="text-statement text-volume reveal">
              {home.featuredHeading ?? "Each one a book of its own."}
            </h2>
          </div>
          <Link
            href="/case-studies"
            className="coord text-ink/60 hover:text-ink transition-colors duration-300 shrink-0"
          >
            {home.featuredViewAllLabel ?? "View the Library →"}
          </Link>
        </div>
        {/* Stripe rule — the sphere's stripes flattened into a divider (§02) */}
        <StripeRule className="mb-14" />
        <BookGrid projects={featured.slice(0, 4)} />
      </section>

      {/* 3. Process lead-in */}
      <section className="section-y page-x border-t border-line">
        <div className="max-w-3xl mx-auto lg:mx-0">
          <p className="text-statement text-volume reveal mb-8">
            {home.positioningHeading ??
              "Most studios start with a rough draft. We start with the story."}
          </p>
          <p className="text-lede text-muted">
            {home.positioningParagraph1 ??
              "Our role is to understand the project, find its tone, and build the visual world that makes others want to be part of it before the first brick is laid."}
          </p>
        </div>
      </section>

      {/* 4. FASES grid with transition line */}
      <section className="section-y page-x border-t border-line bg-soft">
        <p className="text-statement text-volume reveal mb-12 max-w-3xl">
          {home.fasesLabel ?? "Before we open 3ds Max, we ask questions to define:"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-line">
          {defaultPhases.map((phase) => (
            <div key={phase._id} className="p-8 bg-soft border-line">
              <p className="coord mb-3">
                {phase.phaseNumber}
              </p>
              <p className="text-title">{phase.phaseTitle}</p>
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

      {/* 5. Peer Band — moved DOWN. Quote follows proof. */}
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

      {/* 6. About Preview */}
      <section className="section-y page-x border-t border-line bg-soft">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <p className="coord mb-6">{home.aboutLabel ?? "About the studio"}</p>
            <h2 className="text-statement text-volume reveal mb-8">
              {home.aboutHeading ?? "The same team on every project."}
            </h2>
            <p className="text-lede text-muted mb-8">
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
        <div className="max-w-2xl mx-auto">
          <h2 className="text-statement text-volume reveal mb-10">
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
