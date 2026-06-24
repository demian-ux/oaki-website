import { getHomePage } from "@/lib/data";
import Button from "@/components/global/Button";
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

// Services — the offering in three forms. Baked in for now (no Sanity field yet).
const services = [
  {
    name: "Stills",
    body: "The images that carry the project. They open the deck, fill the board, and stay on your homepage long after the building is finished. Made to be looked at twice.",
  },
  {
    name: "Film",
    body: "Not a flythrough. A film, with a beginning, a middle, and a reason to keep watching. The project moving the way you would move through it, long before it is built.",
  },
  {
    name: "Narrative",
    body: "Beyond the building: the life inside it, the setting around it, the materials up close. We build the lifestyle, context, and materiality, then tie it into one story that carries the project.",
  },
];

export default async function HomePage() {
  const home = await getHomePage();

  return (
    <>
      {/* 1. Hero — animated wordmark → drifting project-book shelf */}
      <HeroShelf />

      {/* 2. Concept — what we do and who we are, in one declarative column. */}
      <section className="section-y page-x border-t border-line">
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="coord mb-7">{home.conceptLabel ?? "What we do"}</p>
            <h2 className="text-statement text-volume reveal mb-8">
              {home.conceptHeading ?? "We show your project before it exists."}
            </h2>
            <p className="text-lede text-muted max-w-xl">
              {home.conceptBody ??
                "Stills, film, and narrative, composed as one. Not a deliverable, the version of your project people fall for at the pitch and remember long after."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Peer Band — proof follows the claim. */}
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

      {/* 4. Services — Stills, Film, Narrative. The offering in three forms. */}
      <section className="section-y page-x border-t border-line bg-soft">
        <p className="coord mb-7">What we make</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12">
          {services.map((service) => (
            <div key={service.name} className="border-t border-line pt-6">
              <h3 className="text-title mb-4">{service.name}</h3>
              <p className="text-meta text-muted">{service.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. About — the trust spine: same team, every project. */}
      <section className="section-y page-x border-t border-line">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <p className="coord mb-6">{home.aboutLabel ?? "About the studio"}</p>
            <h2 className="text-statement text-volume reveal mb-8">
              {home.aboutHeading ?? "The people you meet are the people doing the work."}
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
            {home.finalCtaHeading ?? "Tell us what you’re building."}
          </h2>
          <p className="text-lede text-muted mb-4">
            You don’t need the brief finished. Send what you have, a plan, a
            reference, a rough idea, and we will take it from there.
          </p>
          <p className="text-meta text-muted mb-10">
            A principal reads every message, and you will hear back within two hours.
          </p>
          <Button href="/contact" variant="primary" size="lg">
            {home.finalCtaButtonLabel ?? "Start a project"}
          </Button>
        </div>
      </section>
    </>
  );
}
