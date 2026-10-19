import type { Metadata } from "next";
import HeroShelf from "@/components/home/HeroShelf";
import PeerBand from "@/components/home/PeerBand";
import ContactCta from "@/components/global/ContactCta";
import SelectedIndex from "@/components/selected/SelectedIndex";
import { fallbackPeerBand, clientMarks, additionalPeerQuotes } from "@/lib/peer-band";
import { STUDIO_MANIFESTO } from "@/lib/studio-copy";
import { SELECTED_CONTACT, SELECTED_STATEMENT, selectedWorks } from "@/lib/selected-works";
import { getSelectedShelf } from "@/lib/selected-works-shelf";

// The selected-work landing, composed like the homepage: the shelf opening
// on the studio's own books, the manifesto, the three cases at full width,
// the proof band, and the way in. Everything links inside /selected-works.

export const metadata: Metadata = {
  title: "Selected work",
  description: `${selectedWorks.length} projects. Stills and film for architects, interior designers and developers.`,
};

export default function SelectedWorksPage() {
  const shelf = getSelectedShelf();

  return (
    <>
      {/* 1. Hero — the wordmark opening onto the selected books. */}
      <HeroShelf
        statement={SELECTED_STATEMENT}
        projects={shelf}
        centerIndex={3}
        contactHref={SELECTED_CONTACT}
        seenKey="oaki:selected-hero-seen"
        ariaLabel="Oaki Studio, selected work"
      />

      {/* 2. Manifesto — same words as the homepage, same column. */}
      <section aria-label="Studio manifesto" className="page-x py-[calc(50vh+4rem)]">
        <div className="mx-auto" style={{ maxWidth: 860 }}>
          <p className="text-body text-muted reveal leading-[1.75] text-left lg:text-justify">
            {STUDIO_MANIFESTO}
          </p>
        </div>
      </section>

      {/* 3. The index — three cases, covers at natural ratio. */}
      <section className="page-x border-t border-line pt-16 lg:pt-24">
        <p className="coord text-muted">
          {selectedWorks.length} projects · Stills and film for architects, interior designers and developers
        </p>
      </section>
      <SelectedIndex />

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
