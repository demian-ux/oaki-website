import HeroShelf from "@/components/home/HeroShelf";
import PeerBand from "@/components/home/PeerBand";
import ContactCta from "@/components/global/ContactCta";
import SelectedIndex from "@/components/selected/SelectedIndex";
import { fallbackPeerBand, clientMarks, additionalPeerQuotes } from "@/lib/peer-band";
import { STUDIO_STATEMENT } from "@/lib/studio-copy";
import { SELECTED_CONTACT, worksInSet, type SelectedSet } from "@/lib/selected-works";
import { getSelectedShelf } from "@/lib/selected-works-shelf";

// The selected-work landing for one set, composed like the homepage: the
// shelf opening on three big covers that spread and stay put, two
// sentences, the set's cases at full width, the proof band, and the way
// in. Everything links inside /selected-works. The default set renders at
// /selected-works, a client's set at /selected-works/for/<key>.

export default function SelectedLanding({ set }: { set: SelectedSet }) {
  const shelf = getSelectedShelf(set);
  const works = worksInSet(set);

  return (
    <>
      {/* 1. Hero — the wordmark opening onto three covers, one per
          project, which spread and stay put. Same tagline as the homepage. */}
      <HeroShelf
        statement={STUDIO_STATEMENT}
        projects={shelf}
        centerIndex={1}
        contactHref={SELECTED_CONTACT}
        seenKey={`oaki:selected-hero-seen:${set.key}`}
        ariaLabel="Oaki Studio, selected work"
        moving={false}
        size="large"
        ticker={false}
      />

      {/* 2. Two sentences, for someone who has already talked with us. */}
      <section aria-label="Introduction" className="page-x py-[calc(50vh+4rem)]">
        <div className="mx-auto text-center" style={{ maxWidth: 860 }}>
          {/* One sentence per line, each kept whole. */}
          <p className="text-lede text-muted reveal">
            {(set.intro.match(/[^.]+\./g) ?? [set.intro]).map((sentence, i) => (
              <span key={i} className="block whitespace-nowrap max-lg:whitespace-normal">
                {sentence.trim()}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 3. The index — the set's cases, covers at natural ratio. */}
      <section className="page-x border-t border-line pt-16 lg:pt-24">
        <p className="coord text-muted">
          {works.length} projects · Stills and film for architects, interior designers and developers
        </p>
      </section>
      <SelectedIndex works={works} />

      {/* 4. Proof follows the claim. */}
      <PeerBand
        quotes={[
          {
            quote: fallbackPeerBand.quote,
            authorName: fallbackPeerBand.authorName,
            authorTitle: fallbackPeerBand.authorTitle,
          },
          ...additionalPeerQuotes,
        ]}
        clientMarks={clientMarks}
        factStrip={fallbackPeerBand.factStrip}
      />

      {/* 5. The way in, without leaving. */}
      <ContactCta href={SELECTED_CONTACT} />
    </>
  );
}
