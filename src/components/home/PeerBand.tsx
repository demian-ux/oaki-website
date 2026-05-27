import SectionLabel from "@/components/global/SectionLabel";

interface PeerBandProps {
  heading: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  clientMarks: string[];
  factStrip: string;
}

/**
 * The Peer Band sits directly below the hero. One editorial section that
 * does three jobs:
 *   1. Anchor quote from a peer who matters
 *   2. Horizontal client marks row
 *   3. Fact strip (counts + tenure)
 *
 * Replaces the old "Undisclosed Studio" testimonial + the "Selected
 * Collaborators" list, per the May 2026 copy handoff.
 */
export default function PeerBand({
  heading,
  quote,
  authorName,
  authorTitle,
  clientMarks,
  factStrip,
}: PeerBandProps) {
  return (
    <section className="section-y page-x border-t border-line">
      <SectionLabel className="mb-14">{heading}</SectionLabel>

      {/* Anchor quote */}
      <figure className="max-w-3xl mb-20">
        <blockquote className="text-display-lg font-serif leading-tight mb-8">
          <span aria-hidden>&ldquo;</span>
          {quote}
          <span aria-hidden>&rdquo;</span>
        </blockquote>
        <figcaption>
          <p className="text-label text-ink mb-1">{authorName}</p>
          <p className="text-meta text-muted">{authorTitle}</p>
        </figcaption>
      </figure>

      {/* Client marks — horizontal row */}
      <ul
        className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-10 list-none m-0 p-0 border-t border-line pt-10"
        aria-label="Selected clients"
      >
        {clientMarks.map((mark) => (
          <li
            key={mark}
            className="text-display-md font-display text-muted hover:text-ink transition-colors duration-300"
            style={{ fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)", letterSpacing: "-0.01em" }}
          >
            {mark}
          </li>
        ))}
      </ul>

      {/* Fact strip */}
      <p
        className="text-label text-muted"
        style={{ letterSpacing: "0.18em" }}
      >
        {factStrip}
      </p>
    </section>
  );
}
