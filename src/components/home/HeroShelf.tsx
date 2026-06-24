"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./HeroShelf.module.css";

// Avoid the SSR "useLayoutEffect does nothing on the server" warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Project = { n: string; collection: string; title: string; client: string; year: string; img: string };

// Project order = shelf order (01 … 07). 04 (Manhattan) is the one the
// ticker lands on and that stays centred.
const PROJECTS: Project[] = [
  { n: "01", collection: "The Competition Collection", title: "Raghsa Tower", client: "AFT", year: "2026", img: "/images/01.jpg" },
  { n: "02", collection: "The Competition Collection", title: "Cazouls les Bézier", client: "Naos", year: "2025", img: "/images/02.jpg" },
  { n: "03", collection: "The Residential Collection", title: "Dillido Residence", client: "Ceïba", year: "2024", img: "/images/03.jpg" },
  { n: "04", collection: "The Residential Collection", title: "Manhattan Apartment", client: "TBD Architecture + Design", year: "2024", img: "/images/04.jpg" },
  { n: "05", collection: "The Residential Collection", title: "NY Penthouse", client: "TBD Architecture + Design", year: "2024", img: "/images/05.jpg" },
  { n: "06", collection: "The Residential Collection", title: "Windsor Residence", client: "KoDA", year: "2024", img: "/images/06.jpg" },
  { n: "07", collection: "The Residential Collection", title: "803 Hunter Rd", client: "TBD Architecture + Design", year: "2025", img: "/images/07.jpg" },
];

const N = PROJECTS.length;
const CENTER = 3; // index that lands centred (04 — Manhattan)
const TICKER_ORDER = [0, 1, 2, 4, 5, 6, 3]; // 1, 2, 3, 5, 6, 7, 4
const TICK_MS = 200;
const DRIFT_PX_PER_SEC = 26; // slow right-to-left drift

function Cover({ project, src }: { project: Project; src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={styles.cover}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={project.title} loading="eager" onError={() => setFailed(true)} />
      ) : (
        <div className={styles.ph}>{project.n}</div>
      )}
    </div>
  );
}

export default function HeroShelf() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"ticker" | "open">("ticker");
  const [tick, setTick] = useState(0);
  const [drift, setDrift] = useState(false);
  const [full, setFull] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);

  // ── start once webfonts are ready, so the giant wordmark renders in
  //    Inktrap (not a fallback) from the first frame ──
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setReady(true);
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(start).catch(start);
    const safety = setTimeout(start, 1500);
    return () => clearTimeout(safety);
  }, []);

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const baseRef = useRef(0);
  const setWRef = useRef(0);

  // ── the ticker: flip through the covers, then open ──
  useEffect(() => {
    if (!ready) return;
    if (tick < TICKER_ORDER.length - 1) {
      const t = setTimeout(() => setTick((v) => v + 1), TICK_MS);
      return () => clearTimeout(t);
    }
    // dev: ?freezehero holds the final opening frame for design review
    if (window.location.search.includes("freezehero")) return;
    const t = setTimeout(() => setPhase("open"), 360);
    return () => clearTimeout(t);
  }, [tick, ready]);

  // ── once spread, start the perpetual drift ──
  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => setDrift(true), 1150);
    return () => clearTimeout(t);
  }, [phase]);

  // ── measure item geometry → centring offset (before drift) ──
  useIsoLayoutEffect(() => {
    const measure = () => {
      const item = itemRef.current;
      if (!item) return;
      const w = item.offsetWidth;
      const mr = parseFloat(getComputedStyle(item).marginRight) || 0;
      const f = w + mr;
      const base = window.innerWidth / 2 - (CENTER * f + w / 2);
      setFull(f);
      setBaseOffset(base);
      fullSet(f, base);
    };
    const fullSet = (f: number, base: number) => {
      offsetRef.current = base;
      baseRef.current = base;
      setWRef.current = f * N;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── the drift loop (direct style writes; no React churn) ──
  useEffect(() => {
    if (!drift) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      offsetRef.current -= DRIFT_PX_PER_SEC * dt;
      while (baseRef.current - offsetRef.current >= setWRef.current) {
        offsetRef.current += setWRef.current;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drift]);

  const open = phase === "open";
  const tickerImg = PROJECTS[TICKER_ORDER[Math.min(tick, TICKER_ORDER.length - 1)]].img;

  // two sets of covers so the drift can loop seamlessly
  const items = Array.from({ length: N * 2 }, (_, g) => {
    const idx = g % N;
    const project = PROJECTS[idx];
    const isPrimary = g === CENTER; // the centred cover in set 1
    const src = isPrimary && !open ? tickerImg : project.img;

    let transform = "none";
    let opacity = 1;
    if (!open) {
      if (isPrimary) {
        // opening cover ≈ 30–35vh, kissing the wordmark's baseline; the
        // word+cover group is centred vertically in the viewport
        transform = "translateY(6vh) scale(1.3)";
        opacity = 1;
      } else {
        // collapsed toward the centre so it can spread outward on open
        transform = `translateX(calc((${CENTER} - ${idx}) * var(--full, 0px) * 0.82)) scale(0.6)`;
        opacity = 0;
      }
    }
    const dist = Math.abs(idx - CENTER);
    const itemDelay = open ? `${dist * 45}ms` : "0ms";
    const capDelay = open ? `${480 + dist * 55}ms` : "0ms";

    return (
      <div
        key={g}
        ref={g === 0 ? itemRef : undefined}
        className={styles.item}
        style={{ transform, opacity, transitionDelay: itemDelay }}
      >
        <Cover project={project} src={src} />
        <div
          className={`${styles.cap} ${open ? styles.capOpen : ""}`}
          style={{ transitionDelay: capDelay }}
        >
          <div className={styles.collection}>{project.collection}</div>
          <div className={styles.title}>{project.title}</div>
          <div className={styles.meta}>{`${project.client} · ${project.year}`}</div>
        </div>
      </div>
    );
  });

  return (
    <section
      className={`${styles.hero} ${ready ? styles.heroReady : ""} -mt-16 lg:-mt-20`}
      aria-label="Oaki Studio, featured project books"
    >
      <h1 className={styles.srOnly}>
        Oaki Studio, creative production studio for architectural projects
      </h1>

      {/* wordmark → logotipo */}
      <div className={`${styles.wm} ${open ? styles.wmOpen : styles.wmTicker}`} aria-hidden="true">
        oaki<span className={styles.dot}>.</span>
      </div>

      {/* subtitle — descriptor, body voice (§09 sentence case) */}
      <p className={`${styles.subtitle} ${open ? styles.subtitleOpen : ""}`} aria-hidden={!open}>
        Creative production studio for architectural projects
      </p>

      {/* CONTACT (top-right) — section links live in the nav bar */}
      <button type="button" className={`${styles.nav} ${styles.contact} ${open ? styles.navOpen : ""}`}>
        Contact
      </button>

      {/* the shelf */}
      <div className={styles.shelf}>
        <div
          ref={trackRef}
          className={styles.track}
          style={
            drift
              ? ({ "--full": `${full}px` } as React.CSSProperties)
              : ({ "--full": `${full}px`, transform: `translateX(${baseOffset}px)` } as React.CSSProperties)
          }
        >
          {items}
        </div>
      </div>
    </section>
  );
}
