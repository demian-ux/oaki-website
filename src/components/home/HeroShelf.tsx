"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HeroShelf.module.css";
import { homeProjects, type HomeProject } from "@/lib/home-projects";
import { HERO_REPLAY_EVENT } from "@/lib/hero-replay";

// Avoid the SSR "useLayoutEffect does nothing on the server" warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Project = HomeProject;

// Project order = shelf order (01 … 07). 04 (Manhattan) is the one the
// ticker lands on and that stays centred.
const PROJECTS: Project[] = homeProjects;

const N = PROJECTS.length;
const CENTER = 3; // index that lands centred (04 — Manhattan)
// Every other cover flips through first, the centred one lands last.
const TICKER_ORDER = [
  ...Array.from({ length: N }, (_, i) => i).filter((i) => i !== CENTER),
  CENTER,
];
const TICK_MS = 200;
const DRIFT_PX_PER_SEC = 26; // slow right-to-left drift
const TYPE_MS = 47; // tagline typewriter cadence, per character
// One frame with transitions suppressed, so a replay snaps back to the ticker
// state instead of visibly rewinding out of the open state first.
const SNAP_MS = 48;
// Safety net only. The real signal is the hero's transitions resolving (see
// the entrance-completion effect); this covers browsers that never report
// them, e.g. a tab/pane that is never painted.
const ENTRANCE_FALLBACK_MS = 2800;

function Cover({ project, src }: { project: Project; src: string }) {
  const [failed, setFailed] = useState(false);
  // Film cards loop a portrait video (videos may cover; only stills are
  // never cropped). The poster/img doubles as the loading frame.
  if (project.video && src === project.img) {
    return (
      <div className={styles.cover}>
        <video autoPlay muted loop playsInline poster={project.img}>
          {project.video.webm && <source src={project.video.webm} type="video/webm" />}
          <source src={project.video.mp4} type="video/mp4" />
        </video>
      </div>
    );
  }
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

interface HeroShelfProps {
  /** The one visible positioning line; fades in with the open state. */
  statement?: string;
}

export default function HeroShelf({ statement }: HeroShelfProps) {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"ticker" | "open">("ticker");
  const [tick, setTick] = useState(0);
  const [drift, setDrift] = useState(false);
  const [full, setFull] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);
  // tagline typewriter
  const [entranceDone, setEntranceDone] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  // replay (header logotipo on the home route)
  const [replayNonce, setReplayNonce] = useState(0);
  const [snapping, setSnapping] = useState(false);

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
    // replayNonce restarts the chain even when tick was already 0
  }, [tick, ready, replayNonce]);

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
  // Runs only while the hero is actually on screen: a perpetual rAF mutating
  // a large composited layer would otherwise keep competing with the scroll
  // for frame time long after the hero is gone.
  useEffect(() => {
    if (!drift) return;
    let raf = 0;
    let last = performance.now();
    let visible = true;
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
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const track = trackRef.current;
    let io: IntersectionObserver | null = null;
    if (track && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(track);
    } else {
      start();
    }
    if (visible) start();
    return () => {
      io?.disconnect();
      stop();
    };
  }, [drift]);

  // ── replay: play the whole opening again, in place ────────────────────
  // Every entrance effect is keyed on state this resets, so they all re-run:
  // the ticker (tick/replayNonce), the spread (phase), the drift (drift), the
  // getAnimations completion chain (open + entranceDone) and the typewriter
  // (entranceDone + typedCount). No remount, so the hero keeps its measured
  // geometry and the covers never re-decode.
  const replay = useCallback(() => {
    // put the drifting track back on its centring offset before React
    // re-takes ownership of the transform
    offsetRef.current = baseRef.current;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${baseRef.current}px)`;
    }
    setSnapping(true);
    setDrift(false);
    setEntranceDone(false);
    setTypedCount(0);
    setTick(0);
    setPhase("ticker");
    setReplayNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    const onReplay = () => replay();
    window.addEventListener(HERO_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(HERO_REPLAY_EVENT, onReplay);
  }, [replay]);

  // drop the transition suppression a frame later so the opening animates
  useEffect(() => {
    if (!snapping) return;
    const t = window.setTimeout(() => setSnapping(false), SNAP_MS);
    return () => window.clearTimeout(t);
  }, [snapping]);

  const open = phase === "open";

  // ── prefers-reduced-motion ────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ── entrance completion ───────────────────────────────────────────────
  // The hero opens with CSS transitions (wordmark, covers, captions, nav),
  // not a GSAP timeline, so the honest "it's finished" signal is the Web
  // Animations view of those transitions: collect every running animation in
  // the hero subtree once the open state has been committed, then wait on
  // all of their .finished promises. The tagline itself has no transition,
  // so it can't wait on itself.
  useEffect(() => {
    if (!open || entranceDone) return;
    const el = heroRef.current;
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    const finish = () => {
      if (!cancelled) setEntranceDone(true);
    };
    const safety = window.setTimeout(finish, ENTRANCE_FALLBACK_MS);
    // two frames: let React commit the class change and the browser start
    // the transitions before we ask what is running
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return;
        const running =
          el && typeof el.getAnimations === "function"
            ? el.getAnimations({ subtree: true })
            : [];
        if (running.length === 0) {
          finish();
          return;
        }
        Promise.allSettled(running.map((a) => a.finished)).then(finish);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(safety);
    };
  }, [open, entranceDone]);

  // ── the typewriter ────────────────────────────────────────────────────
  const statementText = statement ?? "";
  // A trailing period becomes the ocre brand dot, the same accent the section
  // headings carry — typed as the final character, never rendered twice.
  const hasDot = statementText.endsWith(".");
  const bodyText = hasDot ? statementText.slice(0, -1) : statementText;
  const totalSteps = bodyText.length + (hasDot ? 1 : 0);

  useEffect(() => {
    // reduced motion is handled by derivation below, no timer at all
    if (!totalSteps || !entranceDone || reducedMotion) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedCount(i);
      if (i >= totalSteps) window.clearInterval(id);
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [entranceDone, reducedMotion, totalSteps]);

  // reduced motion: the whole line at once, as soon as the hero is open.
  // (Deliberately not gated on entranceDone — under reduced motion the hero's
  // transitions collapse to ~0ms, so there is nothing to wait for.)
  const visibleCount = reducedMotion && open ? totalSteps : typedCount;
  const typingDone = visibleCount >= totalSteps;
  const dotVisible = hasDot && typingDone;

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
        <Link
          href={project.href}
          target={project.href.startsWith("http") ? "_blank" : undefined}
          rel={project.href.startsWith("http") ? "noopener" : undefined}
          className={styles.itemLink}
          tabIndex={open ? 0 : -1}
          aria-label={`Open case study: ${project.title}`}
        >
          <Cover project={project} src={src} />
          <div
            className={`${styles.cap} ${open ? styles.capOpen : ""}`}
            style={{ transitionDelay: capDelay }}
          >
            <div className={styles.collection}>{project.collection}</div>
            <div className={styles.title}>{project.title}</div>
            <div className={styles.meta}>
              {[project.client, project.year].filter(Boolean).join(" · ")}
            </div>
          </div>
        </Link>
      </div>
    );
  });

  return (
    <section
      data-hero
      ref={heroRef}
      className={`${styles.hero} ${ready ? styles.heroReady : ""} ${snapping ? styles.snapReset : ""} -mt-16 lg:-mt-20`}
      data-hero-phase={phase}
      aria-label="Oaki Studio, featured project books"
    >
      <h1 className={styles.srOnly}>
        Oaki Studio, visualization and narrative studio for architectural projects
      </h1>

      {/* wordmark → logotipo */}
      <div className={`${styles.wm} ${open ? styles.wmOpen : styles.wmTicker}`} aria-hidden="true">
        oaki<span className={styles.dot}>.</span>
      </div>

      {/* CONTACT (top-right) — section links live in the nav bar */}
      <button type="button" className={`${styles.nav} ${styles.contact} ${open ? styles.navOpen : ""}`}>
        Contact
      </button>

      {/* statement — the one line a stranger reads first. Footer line of the
          hero, typed out after the rest of it has settled, closing on the
          ocre dot. The ghost copy (body + dot) reserves the final line box so
          nothing reflows, and the visually-hidden copy keeps the full
          sentence in the accessibility tree at all times, never a half-typed
          fragment. */}
      {statementText && (
        <div
          className={styles.subtitle}
          data-tagline
          data-entrance-done={entranceDone ? "true" : "false"}
          data-typing-done={typingDone ? "true" : "false"}
        >
          <p className={styles.subtitleInner}>
            <span className={styles.srOnly}>{statementText}</span>
            <span className={styles.typeBox} aria-hidden="true">
              <span className={styles.ghost}>
                {bodyText}
                {hasDot && <span className={styles.dot}>.</span>}
              </span>
              <span className={styles.typed}>
                {bodyText.slice(0, Math.min(visibleCount, bodyText.length))}
                {dotVisible && <span className={styles.dot}>.</span>}
                {entranceDone && !reducedMotion && !typingDone && (
                  <span className={styles.caret} />
                )}
              </span>
            </span>
          </p>
        </div>
      )}

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
