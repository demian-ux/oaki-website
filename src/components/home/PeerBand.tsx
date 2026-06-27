"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PeerBand.module.css";

export interface PeerQuote {
  quote: string;
  authorName: string;
  authorTitle: string;
}

export interface ClientMark {
  name: string;
  url?: string;
}

interface PeerBandProps {
  quotes: PeerQuote[];
  clientMarks: ClientMark[];
  factStrip: string;
  intervalMs?: number;
}

/**
 * Split a quote into `n` lines, breaking only on word boundaries and minimising
 * the longest line (balanced wrap). Keeps every testimonial to the same line
 * count, and the most even shape, so the block holds steady as quotes rotate.
 */
function splitIntoLines(text: string, n: number): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= n) return words;
  const lens = words.map((w) => w.length);
  const total = lens.reduce((a, b) => a + b, 0) + (words.length - 1);

  // Greedily pack words into lines no wider than `cap` (chars). Returns the
  // line count, or Infinity if a single word exceeds the cap.
  const lineCount = (cap: number): number => {
    let lines = 1;
    let cur = 0;
    for (let i = 0; i < words.length; i++) {
      if (lens[i] > cap) return Infinity;
      const add = (cur === 0 ? 0 : 1) + lens[i];
      if (cur + add <= cap) cur += add;
      else {
        lines++;
        cur = lens[i];
      }
    }
    return lines;
  };

  // Smallest cap that still fits in <= n lines → the most balanced split.
  let lo = Math.max(Math.max(...lens), Math.ceil(total / n));
  let hi = total;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lineCount(mid) <= n) hi = mid;
    else lo = mid + 1;
  }

  const out: string[] = [];
  let cur: string[] = [];
  let curLen = 0;
  for (let i = 0; i < words.length; i++) {
    const add = (curLen === 0 ? 0 : 1) + lens[i];
    if (curLen + add <= lo) {
      cur.push(words[i]);
      curLen += add;
    } else {
      out.push(cur.join(" "));
      cur = [words[i]];
      curLen = lens[i];
    }
  }
  if (cur.length) out.push(cur.join(" "));
  return out;
}

/**
 * The Peer Band — a centred SangBleu anchor quote that cycles through the
 * client testimonials (Andrew's first, then the rest in sequence), each one
 * rising in with the same reveal motion. Below it, a "Trusted by" row of client
 * names drifts continuously, then the fact strip. Rotation starts only once the
 * band scrolls into view, so the first quote is always seen first; it is
 * disabled for reduced-motion.
 */
export default function PeerBand({
  quotes,
  clientMarks,
  factStrip,
  intervalMs = 7000,
}: PeerBandProps) {
  const n = quotes.length;
  const [i, setI] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Start the rotation only when the band is on screen — keeps Andrew's quote
  // first for everyone, regardless of how long the page sat before scrolling.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || n <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % n), intervalMs);
    return () => window.clearInterval(id);
  }, [inView, n, intervalMs]);

  // Each half must be wider than the viewport so the -50% loop is seamless. With
  // a long client list one pass is already wide enough; triple only short lists.
  const half = clientMarks.length >= 12 ? clientMarks : [...clientMarks, ...clientMarks, ...clientMarks];
  const active = quotes[i] ?? quotes[0];

  const renderMark = (m: ClientMark, key: string, hidden: boolean) =>
    m.url ? (
      <a
        key={key}
        href={m.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mark}
        tabIndex={hidden ? -1 : undefined}
      >
        {m.name}
      </a>
    ) : (
      <span key={key} className={styles.mark}>
        {m.name}
      </span>
    );

  return (
    <section ref={sectionRef} className="section-y page-x border-t border-line">
      <figure className={`${styles.quoteBlock} reveal`}>
        {/* `key` remounts on each change so the rise animation replays */}
        <div key={i} className={styles.quoteSwap}>
          <blockquote className={styles.quote}>
            {splitIntoLines(active.quote, 3).map((line, idx, arr) => (
              <span className={styles.qline} key={idx}>
                {idx === 0 ? "“" : ""}
                {line}
                {idx === arr.length - 1 ? "”" : ""}
              </span>
            ))}
          </blockquote>
          <figcaption className={styles.attribution}>
            <span className={styles.author}>{active.authorName}</span>
            <span className={styles.role}> – {active.authorTitle}</span>
          </figcaption>
        </div>
      </figure>

      <div className={styles.trusted}>
        <p className={styles.eyebrow}>Trusted by</p>
        <div className={styles.marquee}>
          <div className={styles.track}>
            <div className={styles.group}>
              {half.map((mark, i) => renderMark(mark, `a-${i}`, false))}
            </div>
            <div className={styles.group} aria-hidden>
              {half.map((mark, i) => renderMark(mark, `b-${i}`, true))}
            </div>
          </div>
        </div>
        <p className={styles.facts}>{factStrip}</p>
      </div>
    </section>
  );
}
