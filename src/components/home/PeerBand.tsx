import styles from "./PeerBand.module.css";

interface PeerBandProps {
  heading?: string; // legacy (no longer rendered)
  quote: string;
  authorName: string;
  authorTitle: string;
  clientMarks: string[];
  factStrip: string;
}

/**
 * The Peer Band — a centred SangBleu anchor quote, then a "Trusted by" row of
 * client names that drifts continuously, then the fact strip. Replaces the
 * old left-aligned testimonial + static client list.
 */
export default function PeerBand({
  quote,
  authorName,
  authorTitle,
  clientMarks,
  factStrip,
}: PeerBandProps) {
  // Repeat within each half so a half is always wider than the viewport — keeps
  // the -50% loop seamless (no empty gap) on any screen width.
  const loopMarks = [...clientMarks, ...clientMarks, ...clientMarks];

  return (
    <section className="section-y page-x border-t border-line">
      <figure className={styles.quoteBlock}>
        <blockquote className={`${styles.quote} reveal`}>
          <span aria-hidden>&ldquo;</span>
          {quote}
          <span aria-hidden>&rdquo;</span>
        </blockquote>
        <figcaption className={styles.attribution}>
          <span className={styles.author}>{authorName}</span>
          <span className={styles.role}> – {authorTitle}</span>
        </figcaption>
      </figure>

      <div className={styles.trusted}>
        <p className={styles.eyebrow}>Trusted by</p>
        <div className={styles.marquee}>
          <div className={styles.track}>
            <div className={styles.group}>
              {loopMarks.map((mark, i) => (
                <span key={`a-${i}`} className={styles.mark}>
                  {mark}
                </span>
              ))}
            </div>
            <div className={styles.group} aria-hidden>
              {loopMarks.map((mark, i) => (
                <span key={`b-${i}`} className={styles.mark}>
                  {mark}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className={styles.facts}>{factStrip}</p>
      </div>
    </section>
  );
}
