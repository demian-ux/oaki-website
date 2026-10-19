"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import Logotipo from "@/components/global/Logotipo";
import { LEAD_FROM_BOOTH, selectedContactHref } from "@/lib/lead-source";
import s from "./Booth.module.css";

// Attract mode for the iPad on the stand (BDNY): the three cases in a
// loop, films muted and playing on their own, stills crossfading, nothing
// to tap except the one button. No header, no footer, no scroll, no
// opening sequence: the screen is the shelf. The media list is built on
// the server (booth/page.tsx) so this stays a plain player.

export type BoothMedia =
  | { kind: "video"; src: string; poster?: string; dwellMs: number }
  | { kind: "stills"; stills: { src: string; alt: string }[]; eachMs: number };

export interface BoothCase {
  slug: string;
  n: string;
  coord: string;
  title: string;
  blurb: string;
  href: string;
  media: BoothMedia;
}

function Stills({ stills, eachMs }: { stills: { src: string; alt: string }[]; eachMs: number }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (stills.length < 2) return;
    const t = setInterval(() => setK((i) => (i + 1) % stills.length), eachMs);
    return () => clearInterval(t);
  }, [stills.length, eachMs]);
  // Every still is mounted so the next one is decoded before it fades in.
  return (
    <>
      {stills.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          decoding="async"
          className={`${s.still} ${i === k ? s.stillOn : ""}`}
        />
      ))}
    </>
  );
}

export default function Booth({ cases }: { cases: BoothCase[] }) {
  const [i, setI] = useState(0);
  const c = cases[i];
  const dwell =
    c.media.kind === "video" ? c.media.dwellMs : c.media.stills.length * c.media.eachMs;

  // The loop: each case holds the screen for its dwell, then the next.
  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % cases.length), dwell);
    return () => clearTimeout(t);
  }, [i, dwell, cases.length]);

  // Keep the iPad awake while the loop runs (Safari 16.4+); re-request
  // after the tab comes back, since the lock drops when it hides.
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          lock = l;
        })
        .catch(() => {});
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  const bookHref = selectedContactHref(LEAD_FROM_BOOTH, "book");

  return (
    <div className={s.booth} aria-label="Selected work, stand mode">
      <div className={s.top}>
        <span className="inline-flex items-baseline gap-3">
          <Logotipo inverted style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }} />
          <span className={`coord ${s.set}`}>Selected work</span>
        </span>
        <span className={`coord ${s.set}`} aria-hidden>
          {c.n} / {String(cases.length).padStart(2, "0")}
        </span>
      </div>

      <div className={s.stage} aria-live="off">
        {c.media.kind === "video" ? (
          <video
            key={c.media.src}
            className={s.enter}
            src={c.media.src}
            poster={c.media.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={`${c.title}, the film, muted`}
          />
        ) : (
          <div key={c.slug} className={s.enter}>
            <Stills stills={c.media.stills} eachMs={c.media.eachMs} />
          </div>
        )}
      </div>

      <div className={s.bottom}>
        <div key={c.slug} className={`${s.words} ${s.enter}`}>
          <p className={`coord ${s.coord}`}>
            {c.n} · {c.coord}
          </p>
          <Link href={c.href} className={`text-case-title ${s.title}`} aria-label={`Open ${c.title}`}>
            {c.title}
            <span aria-hidden className="dot" style={{ marginLeft: "-0.05em" }}>
              .
            </span>
          </Link>
          <p className={s.blurb}>{c.blurb}</p>
        </div>

        <Link
          href={bookHref}
          className={s.cta}
          onClick={() => track("Booth tap", { to: "book", case: c.slug })}
        >
          <span>Book a call</span>
          <span aria-hidden className={s.arrow}>
            →
          </span>
        </Link>

        <div className={s.progress} aria-hidden>
          {cases.map((x, k) => (
            <span key={x.slug} className={`${s.seg} ${k === i ? s.segOn : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
