"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HeroShelf.module.css";
import { homeProjects, type HomeProject } from "@/lib/home-projects";
import { HERO_REPLAY_EVENT } from "@/lib/hero-replay";

// Avoid the SSR "useLayoutEffect does nothing on the server" warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Project = HomeProject;

// Project order = shelf order (01 … 07). By default the homepage set, with
// 04 (Manhattan) as the cover the ticker lands on and that stays centred;
// the selected-work landing passes its own books and centre.
const DEFAULT_CENTER = 3;
const TICK_MS = 200;
// Once the shelf opens the whole track slides left so cover 01 sits on the
// viewport's left edge (no empty gap left of it); the drift then runs from
// there. The ticker still centres cover 04 before the slide.
const OPEN_OFFSET = 0;
const DRIFT_PX_PER_SEC = 26; // slow right-to-left drift
const TYPE_MS = 47; // tagline typewriter cadence, per character
// One frame with transitions suppressed, so a replay snaps back to the ticker
// state instead of visibly rewinding out of the open state first.
const SNAP_MS = 48;
// Safety net only. The real signal is the hero's transitions resolving (see
// the entrance-completion effect); this covers browsers that never report
// them, e.g. a tab/pane that is never painted.
const ENTRANCE_FALLBACK_MS = 2800;
// The opening plays once per browser. Returning visitors land straight on
// the open, drifting shelf. `?intro` forces the opening for review.
const SEEN_KEY = "oaki:hero-seen";

function readAndMarkSeen(key: string) {
  try {
    if (window.location.search.includes("intro")) return false;
    const seen = window.localStorage.getItem(key) === "1";
    window.localStorage.setItem(key, "1");
    return seen;
  } catch {
    return false;
  }
}

function Cover({
  project,
  shown,
  sizes,
}: {
  project: Project;
  /** The book whose cover is painted (the ticker flips other books' covers
   *  through the centred card before it opens). */
  shown: Project;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  // Film cards loop a portrait video (videos may cover; only stills are
  // never cropped). The poster/img doubles as the loading frame.
  // mp4 (H.264) is listed first: iPhones decode it in hardware, and here it
  // is also half the size of the webm, which every other browser plays too.
  if (project.video && shown === project) {
    return (
      <div className={styles.cover}>
        <video autoPlay muted loop playsInline poster={project.img}>
          <source src={project.video.mp4} type="video/mp4" />
          {project.video.webm && <source src={project.video.webm} type="video/webm" />}
        </video>
      </div>
    );
  }
  return (
    <div className={styles.cover}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shown.img}
          srcSet={shown.srcSet}
          sizes={sizes}
          alt={project.title}
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={styles.ph}>{project.n}</div>
      )}
    </div>
  );
}

interface HeroShelfProps {
  /** The one visible positioning line; fades in with the open state. */
  statement?: string;
  /** The books on the shelf, in order. Defaults to the homepage set. */
  projects?: Project[];
  /** Index of the cover the ticker lands on and that stays centred. */
  centerIndex?: number;
  /** Where the top-right CONTACT link goes. */
  contactHref?: string;
  /** localStorage key that remembers the opening has played. */
  seenKey?: string;
  /** Accessible name of the hero section. */
  ariaLabel?: string;
  /** Keep the row drifting after it opens (the homepage). false = the
   *  opening plays, the covers spread and stay put, centred. */
  moving?: boolean;
  /** "book" = the homepage shelf; "large" = a few big covers (selected work). */
  size?: "book" | "large";
  /** Flip the centred cover through every other book before it opens
   *  (the homepage). false = the centred card shows its own cover from
   *  the first frame; the opening still plays. */
  ticker?: boolean;
}

export default function HeroShelf({
  statement,
  projects = homeProjects,
  centerIndex = DEFAULT_CENTER,
  contactHref = "/contact",
  seenKey = SEEN_KEY,
  ariaLabel = "Oaki Studio, featured project books",
  moving = true,
  size = "book",
  ticker = true,
}: HeroShelfProps) {
  const PROJECTS = projects;
  const N = PROJECTS.length;
  const CENTER = Math.min(centerIndex, N - 1);
  // Every other cover flips through first, the centred one lands last.
  const TICKER_ORDER = useMemo(
    () => [...Array.from({ length: N }, (_, i) => i).filter((i) => i !== CENTER), CENTER],
    [N, CENTER]
  );
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"ticker" | "open">("ticker");
  // With the ticker off, start on the last step: the centred card is its
  // own cover and the chain goes straight to the spread.
  const tickStart = ticker ? 0 : N - 1;
  const [tick, setTick] = useState(tickStart);
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
  // returning visitor: render the settled state, no opening
  const [skipIntro, setSkipIntro] = useState(false);
  // read once per mount, so StrictMode's double effect run can't flip a
  // first visit into a skipped one
  const seenRef = useRef<boolean | null>(null);

  // ── start once webfonts are ready, so the giant wordmark renders in
  //    Inktrap (not a fallback) from the first frame ──
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      if (seenRef.current === null) seenRef.current = readAndMarkSeen(seenKey);
      if (seenRef.current) {
        setSkipIntro(true);
        setSnapping(true);
        setTick(N - 1);
        setPhase("open");
        setEntranceDone(true);
        setDrift(moving);
      }
      setReady(true);
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(start).catch(start);
    const safety = setTimeout(start, 1500);
    return () => clearTimeout(safety);
    // seenKey and N are fixed per surface; listed so the effect is honest
    // about what it reads, never expected to re-run.
  }, [seenKey, N, moving]);

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const baseRef = useRef(0);
  const setWRef = useRef(0);

  // ── the ticker: flip through the covers, then open ──
  useEffect(() => {
    if (!ready || skipIntro) return;
    if (tick < N - 1) {
      const t = setTimeout(() => setTick((v) => v + 1), TICK_MS);
      return () => clearTimeout(t);
    }
    // dev: ?freezehero holds the final opening frame for design review
    if (window.location.search.includes("freezehero")) return;
    const t = setTimeout(() => setPhase("open"), 360);
    return () => clearTimeout(t);
    // replayNonce restarts the chain even when tick was already 0
  }, [tick, ready, replayNonce, skipIntro, N]);

  // ── once spread, start the perpetual drift ──
  useEffect(() => {
    if (phase !== "open" || !moving) return;
    const t = setTimeout(() => setDrift(true), 1150);
    return () => clearTimeout(t);
  }, [phase, moving]);

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
    const fullSet = (f: number, _base: number) => {
      offsetRef.current = OPEN_OFFSET;
      baseRef.current = OPEN_OFFSET;
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
    offsetRef.current = OPEN_OFFSET;
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
    offsetRef.current = OPEN_OFFSET;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${baseOffset}px)`;
    }
    setSnapping(true);
    setSkipIntro(false);
    setDrift(false);
    setEntranceDone(false);
    setTypedCount(0);
    setTick(tickStart);
    setPhase("ticker");
    setReplayNonce((n) => n + 1);
  }, [baseOffset]);

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
    if (!totalSteps || !entranceDone || reducedMotion || skipIntro) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedCount(i);
      if (i >= totalSteps) window.clearInterval(id);
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [entranceDone, reducedMotion, totalSteps, skipIntro]);

  // reduced motion: the whole line at once, as soon as the hero is open.
  // (Deliberately not gated on entranceDone — under reduced motion the hero's
  // transitions collapse to ~0ms, so there is nothing to wait for.)
  const visibleCount = (reducedMotion || skipIntro) && open ? totalSteps : typedCount;
  const typingDone = visibleCount >= totalSteps;
  const dotVisible = hasDot && typingDone;

  const tickerProject = PROJECTS[TICKER_ORDER[Math.min(tick, TICKER_ORDER.length - 1)]];
  // Rendered cover width (HeroShelf.module.css .item / .itemLarge), so the
  // browser picks the 960 export on phones and 2x desktops alike.
  const coverSizes =
    size === "large" ? "min(clamp(104px, 22vw, 340px), 38svh)" : "clamp(132px, 12.5vw, 216px)";

  // two sets of covers so the drift can loop seamlessly; one set when the
  // row stays put
  const items = Array.from({ length: moving ? N * 2 : N }, (_, g) => {
    const idx = g % N;
    const project = PROJECTS[idx];
    const isPrimary = g === CENTER; // the centred cover in set 1
    const shown = isPrimary && !open ? tickerProject : project;

    let transform = "none";
    let opacity = 1;
    if (!open) {
      if (isPrimary) {
        // opening cover ≈ 30–35vh, kissing the wordmark's baseline; the
        // word+cover group is centred vertically in the viewport
        transform = `translateY(6vh) scale(${size === "large" ? 1.08 : 1.3})`;
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
        className={`${styles.item} ${size === "large" ? styles.itemLarge : ""}`}
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
          <Cover project={project} shown={shown} sizes={coverSizes} />
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
      aria-label={ariaLabel}
    >
      <h1 className={styles.srOnly}>
        Oaki Studio, visualization and narrative studio for architectural projects
      </h1>

      {/* wordmark → logotipo */}
      <div className={`${styles.wm} ${open ? styles.wmOpen : styles.wmTicker}`} aria-hidden="true">
        oaki<span className={styles.dot}>.</span>
      </div>

      {/* CONTACT (top-right) — section links live in the nav bar */}
      <Link href={contactHref} className={`${styles.nav} ${styles.contact} ${open ? styles.navOpen : ""}`}>
        Contact
      </Link>

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
              : ({
                  "--full": `${full}px`,
                  // a still row keeps its centring offset once open
                  transform: `translateX(${open && moving ? OPEN_OFFSET : baseOffset}px)`,
                  // slides left together with the spread; the drift takes
                  // over (direct style writes) once this has settled
                  transition: open && !snapping ? "transform 1050ms var(--ease)" : "none",
                } as React.CSSProperties)
          }
        >
          {items}
        </div>
      </div>
    </section>
  );
}
