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
// The cover the ticker lands on stays centred when the shelf opens, at every
// width, and the drift runs from there (Ruben Stom's spec, Demi 2026-10-26):
// the row never slides as it spreads. It used to slide on desktop so cover
// 01 met the left edge, which moved the centred cover sideways by an amount
// that depends on the screen width and made the opening feel heavy. On a
// viewport so wide that centring set 1 would leave a gap left of cover 01,
// the row is centred on set 2 from the first frame instead (two identical
// sets, same picture, gap filled) and the ticker plays on set 2's cover.
const DRIFT_PX_PER_SEC = 26; // slow right-to-left drift
// Click-and-drag on the open row. Only wired while the drift runs (i.e.
// once every cover has settled). On release the row keeps the gesture's
// speed and eases back to the drift over FLING_SETTLE_S; a pointer that
// travelled more than DRAG_CLICK_PX is a drag, not a click on a cover.
const FLING_SETTLE_S = 0.9;
const FLING_MAX_PX_PER_SEC = 4000;
const DRAG_CLICK_PX = 6;
const COVER_RATIO = 0.66; // HeroShelf.module.css .cover aspect-ratio
const WM_LOGO_PX = 30; // the logotipo size the wordmark lands on (HeroShelf.module.css .wmOpen)
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
// A returning visitor lands straight on the open row, so its covers must be
// decoded before the hero is revealed: every <img> is new on each mount and
// Chrome paints a cover progressively as its bytes and decode arrive, which
// showed half-painted and blank covers for a moment on every return from a
// case study. Capped so a cold cache never holds the hero back for long.
const DECODE_WAIT_MS = 900;

function decodeCovers(projects: Project[], sizes: string): Promise<unknown> {
  const jobs = projects.map((p) => {
    const i = new Image();
    if (p.srcSet) {
      i.sizes = sizes;
      i.srcset = p.srcSet;
    }
    i.src = p.img;
    return i.decode().catch(() => {});
  });
  return Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, DECODE_WAIT_MS))]);
}

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
  if (project.video && shown === project) {
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
        // The <img> is exactly what it was before the phone pass (no srcset,
        // no decoding hint: the ticker swaps src every 200ms and must paint
        // each frame at once). Phones alone take the 960 export through the
        // <source media>, which desktop never evaluates.
        // srcset at every width: a shelf cover is at most 460px wide, so the
        // 960 export is sharp up to 2x and a third of the bytes of the 1920
        // master, which is what made the covers paint in stages after a
        // navigation. The browser keeps the 1920 for denser screens.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shown.img}
          srcSet={shown.srcSet}
          sizes={sizes}
          alt={project.title}
          loading="eager"
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
  // Rendered cover width (HeroShelf.module.css .item / .itemLarge), so the
  // browser picks the 960 export wherever it is sharp enough.
  const coverSizes =
    size === "large" ? "min(22vw, 38svh)" : "(min-width: 768px) min(20vw, 460px), 132px";
  const CENTER = Math.min(centerIndex, N - 1);
  // A still row is centred as a whole (its midpoint, which for an even N
  // falls between two covers); a drifting row centres the CENTER cover.
  const MID = moving ? CENTER : (N - 1) / 2;
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
  // true when the row is centred on set 2 (see the note above DRIFT_PX_PER_SEC)
  const [shifted, setShifted] = useState(false);
  // The giant wordmark shrinks to the logotipo with a transform (never
  // font-size, which re-lays out and re-rasterises the text every frame):
  // this is the scale that takes the ticker size down to the 30px logotipo.
  const [wmScale, setWmScale] = useState(0.05);
  // Scale of the opening cover relative to its resting size, so it opens at
  // ~34vh tall (Ruben Stom's 30-35vh) and GROWS into the row. Capped at 1.3,
  // which is what phones always hit (their 132px covers), so they are
  // unchanged; on desktop the resting cover is far larger than 34vh.
  const [openScale, setOpenScale] = useState(1.3);
  // The fan: while the covers spread, only the ones that can land on screen
  // take part, the SAME number on each side of the centred card (the row
  // itself is lopsided, 15 covers left of it and 8 right, and the extra
  // ones showed as a thicker fan on the left). The rest are revealed once
  // the spread has settled, by which time they sit off-screen.
  const [fanReach, setFanReach] = useState(3);
  const [fanned, setFanned] = useState(false);
  const wmRef = useRef<HTMLDivElement>(null);
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
        // reveal only once the covers can paint whole (see DECODE_WAIT_MS)
        decodeCovers(PROJECTS, coverSizes).then(() => {
          // as before, the settled row appears at once, no fade
          setSnapping(true);
          setReady(true);
        });
        return;
      }
      setReady(true);
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(start).catch(start);
    const safety = setTimeout(start, 1500);
    return () => clearTimeout(safety);
    // seenKey and N are fixed per surface; listed so the effect is honest
    // about what it reads, never expected to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- PROJECTS/coverSizes are fixed per surface
  }, [seenKey, N, moving]);

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const baseRef = useRef(0);
  const setWRef = useRef(0);
  const wrapRef = useRef(0);
  const wrapRightRef = useRef(0);
  const dragRef = useRef({ active: false, captured: false, pointerId: 0, startX: 0, startOffset: 0, lastX: 0, lastT: 0, moved: 0, v: 0 });
  const suppressClickRef = useRef(false);

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

  // ── once spread, reveal the covers that sat out the fan (off-screen) ──
  // (reset to false by replay(), the only way back to the ticker)
  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => setFanned(true), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  // ── measure item geometry → centring offset (before drift) ──
  useIsoLayoutEffect(() => {
    const measure = () => {
      const item = itemRef.current;
      if (!item) return;
      // Layout width from computed style: fractional (offsetWidth rounds,
      // and a slot pitch off by a fraction let the covers stacked behind
      // the centred one peek out across the row) and unaffected by the
      // item's own transform (a bounding rect would include the opening
      // scale).
      const cs = getComputedStyle(item);
      const w = parseFloat(cs.width) || item.offsetWidth;
      const mr = parseFloat(cs.marginRight) || 0;
      const f = w + mr;
      const base = window.innerWidth / 2 - (MID * f + w / 2);
      // A drifting row is centred on set 2's cover, always: set 1 then
      // fills the left (N + CENTER covers) and the rest of set 2 the right
      // (N - 1 - CENTER covers), so the covers fan out of the centred card
      // to both sides at the same density. Centred on set 1 there were only
      // CENTER covers to the left and the whole of set 2 to the right.
      const shift = moving ? f * N : 0;
      // The drift recycles the row (jumps one set to the right, which is
      // invisible since the sets are identical) as soon as the right end of
      // set 2 would come within a cover of the viewport's right edge,
      // instead of after a full set width, which left the right side empty
      // for a while on every loop.
      wrapRef.current = Math.max(f, (N - 1 - CENTER) * f - window.innerWidth / 2 - f);
      // ...and the mirror for a row dragged to the right: set 1 runs out on
      // the left after N + CENTER covers
      wrapRightRef.current = Math.max(f, (N + CENTER) * f - window.innerWidth / 2 - f);
      setFull(f);
      const coverH = w / COVER_RATIO;
      // slots whose cover can be (partly) on screen once spread
      setFanReach(Math.ceil((window.innerWidth / 2 + w / 2) / f));
      setOpenScale(Math.min(1.3, Math.max(0.5, (0.34 * window.innerHeight) / coverH)));
      setShifted(shift > 0);
      setBaseOffset(base - shift);
      fullSet(f, base - shift);
      const wm = wmRef.current;
      if (wm) {
        const fs = parseFloat(getComputedStyle(wm).fontSize) || 0;
        if (fs > 0) setWmScale(WM_LOGO_PX / fs);
      }
    };
    const fullSet = (f: number, start: number) => {
      offsetRef.current = start;
      baseRef.current = start;
      setWRef.current = f * N;
    };
    measure();
    // Re-measure whenever the cover's own box changes, not only on a window
    // resize: the width also moves with the 768px media query, a font load
    // and the viewport height cap, and a stale --full leaves the stacked
    // covers fanned out across the row before the open.
    window.addEventListener("resize", measure);
    let ro: ResizeObserver | null = null;
    if (itemRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(itemRef.current);
    }
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  // ── the drift loop (direct style writes; no React churn) ──
  // Runs only while the hero is actually on screen: a perpetual rAF mutating
  // a large composited layer would otherwise keep competing with the scroll
  // for frame time long after the hero is gone.
  useEffect(() => {
    if (!drift) return;
    offsetRef.current = baseRef.current;
    const d = dragRef.current;
    d.active = false;
    d.v = -DRIFT_PX_PER_SEC;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    // Infinite in both directions: the two sets are identical, so jumping
    // the row a whole set is invisible. Returns the jump so a drag in
    // progress can keep its anchor.
    const wrap = () => {
      const setW = setWRef.current;
      if (setW <= 0) return 0;
      let jumped = 0;
      while (baseRef.current - offsetRef.current >= wrapRef.current) {
        offsetRef.current += setW;
        jumped += setW;
      }
      while (offsetRef.current - baseRef.current >= wrapRightRef.current) {
        offsetRef.current -= setW;
        jumped -= setW;
      }
      return jumped;
    };
    const write = () => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }
    };
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!d.active) {
        // the fling speed eases back to the drift; with no gesture this is
        // just the drift
        d.v = -DRIFT_PX_PER_SEC + (d.v + DRIFT_PX_PER_SEC) * Math.exp(-dt / (FLING_SETTLE_S / 3));
        offsetRef.current += d.v * dt;
        wrap();
        write();
      }
      raf = requestAnimationFrame(loop);
    };
    // ── click-and-drag ──
    const track = trackRef.current;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      d.active = true;
      d.moved = 0;
      d.startX = e.clientX;
      d.startOffset = offsetRef.current;
      d.lastX = e.clientX;
      d.lastT = performance.now();
      d.v = 0;
      d.pointerId = e.pointerId;
      // No pointer capture yet: captured from pointerdown, the pointerup
      // would land on the track and the browser would fire the click on
      // the track instead of the cover's link, so a plain click never
      // opened a case. The capture starts once this is clearly a drag.
      d.captured = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!d.active) return;
      const dx = e.clientX - d.startX;
      d.moved = Math.max(d.moved, Math.abs(dx));
      if (d.moved <= DRAG_CLICK_PX) return; // still a click
      if (!d.captured) {
        d.captured = true;
        try {
          track?.setPointerCapture(d.pointerId);
        } catch {}
        track?.classList.add(styles.dragging);
      }
      offsetRef.current = d.startOffset + dx;
      d.startOffset += wrap();
      const now = performance.now();
      const dt = (now - d.lastT) / 1000;
      if (dt > 0) {
        const inst = (e.clientX - d.lastX) / dt;
        d.v = d.v * 0.5 + inst * 0.5;
      }
      d.lastX = e.clientX;
      d.lastT = now;
      write();
    };
    const onUp = (e: PointerEvent) => {
      if (!d.active) return;
      d.active = false;
      // a pointer that rested before release carries no speed
      if (performance.now() - d.lastT > 80) d.v = 0;
      d.v = Math.max(-FLING_MAX_PX_PER_SEC, Math.min(FLING_MAX_PX_PER_SEC, d.v));
      if (d.moved > DRAG_CLICK_PX) {
        // the click that follows a drag is swallowed (onClickCapture); if
        // none comes (released off the row), the mark must not linger and
        // eat the next real click
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 300);
      }
      if (d.captured) {
        try {
          track?.releasePointerCapture(e.pointerId);
        } catch {}
      }
      track?.classList.remove(styles.dragging);
      last = performance.now();
    };
    // The covers are links: a few pixels into a drag the browser would
    // start its own drag-and-drop of the link and cancel the pointer
    // events, so the row only ever moved a little.
    const onDragStart = (e: DragEvent) => e.preventDefault();
    track?.addEventListener("dragstart", onDragStart);
    track?.addEventListener("pointerdown", onDown);
    track?.addEventListener("pointermove", onMove);
    track?.addEventListener("pointerup", onUp);
    track?.addEventListener("pointercancel", onUp);
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
    // Watch the hero section, not the track: the track box is only as wide
    // as the shelf, and once the row has drifted that far left (a second on
    // a phone, where it starts 340px off) it stops intersecting while its
    // covers are still fully on screen, and the row would just freeze.
    const watched = heroRef.current ?? trackRef.current;
    let io: IntersectionObserver | null = null;
    if (watched && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(watched);
    } else {
      start();
    }
    if (visible) start();
    return () => {
      io?.disconnect();
      stop();
      track?.removeEventListener("dragstart", onDragStart);
      track?.removeEventListener("pointerdown", onDown);
      track?.removeEventListener("pointermove", onMove);
      track?.removeEventListener("pointerup", onUp);
      track?.removeEventListener("pointercancel", onUp);
      track?.classList.remove(styles.dragging);
      d.active = false;
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
      trackRef.current.style.transform = `translateX(${baseOffset}px)`;
    }
    setSnapping(true);
    setSkipIntro(false);
    setDrift(false);
    setFanned(false);
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

  // two sets of covers so the drift can loop seamlessly; one set when the
  // row stays put
  const items = Array.from({ length: moving ? N * 2 : N }, (_, g) => {
    const idx = g % N;
    const project = PROJECTS[idx];
    const primaryG = CENTER + (shifted ? N : 0); // slot of the centred cover
    const isPrimary = g === primaryG;
    // The ticker frame is painted only once the opening is actually
    // running (ready, first visit). Before that, and for a returning
    // visitor who lands straight on the open row, the centred card shows
    // its own cover: it used to start on the ticker's first frame (Raghsa)
    // and swap to Manhattan an effect later, and the <img> kept showing
    // Raghsa until Manhattan had decoded, a visible flash on every return
    // from a case study.
    const shown = isPrimary && !open && ready && !skipIntro ? tickerProject : project;

    // Before the open every cover sits in the centred card's exact box
    // (same slot, same 6vh drop, same opening scale), stacked beneath it,
    // so on open they come out from behind it and grow with it to their
    // resting size (Ruben Stom's opening). The z-order falls off with the
    // distance from the centred card, so each one emerges from under its
    // nearer neighbour. Measured per set (as before) the far covers would
    // collapse toward their own set's centre, off-screen.
    let transform = "none";
    // Only the centred card is visible before the open: the stacked covers
    // are hidden (not just beneath it) so nothing can peek out, and they are
    // revealed at the instant the open state is committed, when they are
    // still exactly behind it.
    const slotDist = Math.abs(g - primaryG);
    const hiddenNow = !open ? !isPrimary : !fanned && !skipIntro && slotDist > fanReach;
    const visibility = hiddenNow ? "hidden" : undefined;
    if (!open) {
      transform = `translateX(calc((${MID - CENTER} + ${primaryG - g}) * var(--full, 0px))) translateY(6vh) scale(${size === "large" ? 1.08 : openScale})`;
    }
    const zIndex = N * 2 - slotDist;
    // Every cover leaves the stack at the same instant: with a stagger the
    // far ones were still waiting in the stack, at the small opening size,
    // while the centred card had already grown and risen off it, and they
    // showed underneath. Moving together, each one slides out from under
    // its nearer neighbour (the fan of the reference). Only the captions
    // stagger, by slot distance, so both sides read at the same pace.
    const itemDelay = "0ms";
    const capDelay = open ? `${480 + slotDist * 55}ms` : "0ms";

    return (
      <div
        key={g}
        ref={g === 0 ? itemRef : undefined}
        className={`${styles.item} ${size === "large" ? styles.itemLarge : ""}`}
        // No transition while the ticker plays: the first paint uses set 1's
        // centred slot, the measure may then move the centred cover to set 2
        // (wide viewports), and that style change must snap, not animate as
        // a 1050ms zoom from scale(0.6) to scale(1.3). The class transition
        // takes over the moment the open state is committed.
        // transitionDuration, not the `transition` shorthand: React cannot
        // mix a shorthand with the transitionDelay longhand in one style
        // object, and the delay was silently dropped on the open render.
        style={{ transform, zIndex, visibility, transitionDelay: itemDelay, transitionDuration: open ? undefined : "0s" }}
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
      <div
        ref={wmRef}
        className={`${styles.wm} ${open ? styles.wmOpen : styles.wmTicker}`}
        style={{ "--wm-scale": wmScale } as React.CSSProperties}
        aria-hidden="true"
      >
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
          className={`${styles.track} ${drift ? styles.trackLive : ""}`}
          // a drag must not open the cover it ended on
          onClickCapture={(e) => {
            if (!suppressClickRef.current) return;
            suppressClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          // The track itself never moves during the opening: it sits on the
          // centring offset while the ticker plays and while the covers
          // spread, and the drift loop takes over from that same offset with
          // direct style writes once the spread has settled. Keeping the
          // offset in the drift state too means the handover frame paints
          // the row where it already was, never at x=0 for one flash.
          style={{ "--full": `${full}px`, transform: `translateX(${baseOffset}px)` } as React.CSSProperties}
        >
          {items}
        </div>
      </div>
    </section>
  );
}
