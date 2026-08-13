"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { getLenis } from "@/components/global/SmoothScroll";
import styles from "./ServicesDeck.module.css";

/**
 * Services — a horizontal slide deck. Three slides (Concept, Proof, Campaign)
 * pass through a fixed editorial frame: the statement and the bottom progress
 * nav hold still while the image, index, word, and lede travel. The deck warms
 * from grey to full color as it advances (per-slide static grade — pre-baked,
 * never animated live), Campaign's color being the payoff.
 *
 * Desktop (motion): the section pins; vertical scroll scrubs the deck, and it
 * snaps to the nearest slide on pause (snap via Lenis so there is one scroll
 * engine). Mobile (motion): a native swipe carousel (Draggable + Inertia), no
 * pin. Reduced motion: arrows/keyboard cross-fade, zero travel.
 */

interface Slide {
  word: string;
  lede: string;
  image: string;
  /** Static, pre-baked grade — the arc grey -> warm -> full color. */
  grade: string;
}

const SLIDES: Slide[] = [
  {
    word: "Concept",
    lede: "Sell the idea before it exists. Images that win the room: investors, boards, juries.",
    image: "/images/services-comps/concept-sketch.jpg", // annotated hand sketch — already near-monochrome
    grade: "grayscale(1) contrast(1.03) brightness(1.02)",
  },
  {
    word: "Proof",
    lede: "Images precise enough to build from. The kind that still match the building years after it opens.",
    image: "/images/services-comps/proof-hero.jpg", // finished interior — warm light, teak and travertine
    grade: "saturate(0.5) sepia(0.16) contrast(1.03)",
  },
  {
    word: "Campaign",
    lede: "Take it to market. Film, book, and social, composed as one story. Not a folder of jpegs.",
    image: "/images/services-comps/edition-objects.jpg", // book, print and phone — full color, the payoff
    grade: "saturate(1.06)",
  },
];

const N = SLIDES.length;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Single premium curve everywhere (cubic-bezier(0.76,0,0.24,1) ~ easeInOutQuart).
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export default function ServicesDeck() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const track = trackRef.current;
    const underline = underlineRef.current;
    if (!section || !frame || !track || !underline) return;

    gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, CustomEase, ScrollToPlugin);
    if (!CustomEase.get?.("deck")) CustomEase.create("deck", "M0,0 C0.76,0 0.24,1 1,1");
    let killed = false;

    const panels = Array.from(track.querySelectorAll<HTMLElement>("[data-panel]"));
    const labels = navRef.current
      ? Array.from(navRef.current.querySelectorAll<HTMLElement>("[data-label]"))
      : [];

    let frameW = frame.clientWidth;
    let labelGeo: { left: number; width: number }[] = [];
    let lastIdx = -1;

    const measure = () => {
      // Panel widths come from CSS (flex: 0 0 100%), so they are correct before
      // JS runs (no FOUC/CLS); we only read the frame width + label geometry.
      frameW = frame.clientWidth;
      labelGeo = labels.map((l) => ({ left: l.offsetLeft, width: l.offsetWidth }));
    };

    // The single source of truth for the deck's visual state at a continuous
    // position `pos` in [0, N-1]. ownTrack=false when a dragger owns the track x.
    const render = (pos: number, ownTrack = true) => {
      pos = clamp(pos, 0, N - 1);
      if (ownTrack) track.style.transform = `translate3d(${-pos * frameW}px,0,0)`;

      panels.forEach((panel, i) => {
        const d = pos - i; // >0 outgoing (left), <0 incoming (right)
        const ad = Math.min(Math.abs(d), 1);
        const scale = d >= 0 ? 1 - 0.04 * Math.min(d, 1) : 1 + 0.04 * Math.min(-d, 1);
        panel.style.transform = `scale(${scale})`;
        panel.style.opacity = `${1 - 0.4 * ad}`;

        const img = panel.querySelector<HTMLElement>("[data-img]");
        if (img) img.style.transform = `translate3d(${(i - pos) * frameW * 0.08}px,0,0)`;

        // Text couples to the image, entering during the back third of the move.
        const text = panel.querySelector<HTMLElement>("[data-text]");
        if (text) {
          const tIn = clamp(1 - ad / 0.34, 0, 1);
          text.style.opacity = `${tIn}`;
          text.style.transform = `translate3d(${(i - pos) * frameW * 0.05}px, ${(1 - tIn) * 26}px, 0)`;
        }
      });

      // Bottom nav: underline tweens to the active label; active takes weight.
      const f = clamp(Math.floor(pos), 0, N - 1);
      const c = clamp(Math.ceil(pos), 0, N - 1);
      const frac = pos - f;
      if (labelGeo[f] && labelGeo[c]) {
        const left = lerp(labelGeo[f].left, labelGeo[c].left, frac);
        const width = lerp(labelGeo[f].width, labelGeo[c].width, frac);
        underline.style.transform = `translateX(${left}px)`;
        underline.style.width = `${width}px`;
      }
      const navIdx = Math.round(pos);
      labels.forEach((l, i) => l.classList.toggle(styles.labelActive, i === navIdx));
      panels.forEach((p, i) => p.toggleAttribute("data-active", i === navIdx));

      if (navIdx !== lastIdx) {
        lastIdx = navIdx;
        if (liveRef.current) liveRef.current.textContent = `Slide ${navIdx + 1} of ${N}: ${SLIDES[navIdx].word}`;
      }
    };

    measure();
    render(0);

    // ── Shared input wiring (arrows + keyboard + frame swipe). `goTo` is set
    //    per mode below; the listeners just call the live handler via a ref.
    const handlers = { goTo: (i: number) => render(i), index: () => 0, refresh: () => {} };
    const onPrev = () => handlers.goTo(handlers.index() - 1);
    const onNext = () => handlers.goTo(handlers.index() + 1);
    let inView = false;
    const onKey = (e: KeyboardEvent) => {
      if (!inView) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    const io = new IntersectionObserver(([en]) => (inView = en.isIntersecting), { threshold: 0.4 });
    io.observe(section);
    prevRef.current?.addEventListener("click", onPrev);
    nextRef.current?.addEventListener("click", onNext);
    window.addEventListener("keydown", onKey);
    labels.forEach((l, i) => l.addEventListener("click", () => handlers.goTo(i)));

    // Frame swipe (pointer) — advance on a horizontal-dominant gesture. Works
    // alongside the desktop pin (vertical scroll is untouched).
    let downX = 0;
    let downY = 0;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      // Touch/pen only: desktop uses wheel/arrows/keyboard, and a mouse drag
      // here would otherwise hijack lede text selection.
      if (e.pointerType === "mouse") return;
      downX = e.clientX;
      downY = e.clientY;
      dragging = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext();
        else onPrev();
      }
    };

    const mm = gsap.matchMedia();
    const cleanups: Array<() => void> = [];

    // ════════════ DESKTOP (motion): pin + scrub + Lenis snap ════════════
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      let isSnapping = false;
      let snapTimer: ReturnType<typeof setTimeout> | null = null;
      let snapSafety: ReturnType<typeof setTimeout> | null = null;

      const st = ScrollTrigger.create({
        trigger: section,
        pin: pinRef.current,
        start: "top top",
        end: () => "+=" + (N - 1) * window.innerHeight,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          render(self.progress * (N - 1));
        },
        onUpdate: (self) => {
          render(self.progress * (N - 1));
          if (!isSnapping) {
            if (snapTimer) clearTimeout(snapTimer);
            snapTimer = setTimeout(snapToNearest, 150);
          }
        },
      });

      const scrollForIndex = (i: number) =>
        st.start + (clamp(i, 0, N - 1) / (N - 1)) * (st.end - st.start);

      const endSnap = () => {
        isSnapping = false;
        if (snapSafety) {
          clearTimeout(snapSafety);
          snapSafety = null;
        }
      };
      const scrollDeckTo = (i: number, duration: number) => {
        const target = scrollForIndex(i);
        if (Math.abs(window.scrollY - target) < 1) return;
        isSnapping = true;
        if (snapSafety) clearTimeout(snapSafety);
        // Safety net: clear the flag even if onComplete never fires (e.g. the
        // user interrupts the scroll), so the deck never gets stuck.
        snapSafety = setTimeout(endSnap, duration * 1000 + 300);
        const lenis = getLenis();
        if (lenis) {
          // force: true lets a user advance (arrow/key/label) override an
          // in-flight snap; no lock, so the reader can always interrupt by
          // scrolling and is never trapped.
          lenis.scrollTo(target, { duration, easing: easeInOutQuart, force: true, onComplete: endSnap });
        } else {
          gsap.to(window, { scrollTo: target, duration, ease: "deck", onComplete: endSnap });
        }
      };
      function snapToNearest() {
        if (!st.isActive || isSnapping) return;
        scrollDeckTo(Math.round(st.progress * (N - 1)), 0.9);
      }

      handlers.goTo = (i: number) => scrollDeckTo(i, 1.0);
      handlers.index = () => Math.round(st.progress * (N - 1));
      handlers.refresh = () => ScrollTrigger.refresh();

      // chrome entrance (once)
      const intro = gsap.from([navRef.current, ".deck-statement"], {
        autoAlpha: 0,
        y: 22,
        duration: 0.8,
        ease: "deck",
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: "top 65%", once: true },
      });

      frame.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);

      return () => {
        if (snapTimer) clearTimeout(snapTimer);
        if (snapSafety) clearTimeout(snapSafety);
        st.kill();
        intro.scrollTrigger?.kill();
        intro.kill();
        frame.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
      };
    });

    // ════════════ MOBILE (motion): swipe carousel (Draggable + Inertia) ═══
    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      measure();
      let index = 0;
      const minX = () => -(N - 1) * frameW;

      const drag = Draggable.create(track, {
        type: "x",
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        edgeResistance: 0.85,
        dragResistance: 0.05,
        bounds: { minX: minX(), maxX: 0 },
        snap: { x: (v: number) => clamp(Math.round(v / frameW) * frameW, minX(), 0) },
        onDrag() {
          render(-this.x / frameW, false);
        },
        onThrowUpdate() {
          render(-this.x / frameW, false);
        },
        onThrowComplete() {
          index = clamp(Math.round(-this.x / frameW), 0, N - 1);
          render(index, false);
        },
        onDragEnd() {
          if (!this.tween) {
            index = clamp(Math.round(-this.x / frameW), 0, N - 1);
            render(index, false);
          }
        },
      })[0];

      const goToMobile = (i: number) => {
        index = clamp(i, 0, N - 1);
        gsap.to(track, {
          x: -index * frameW,
          duration: 0.9,
          ease: "deck",
          onUpdate: () => render(-(gsap.getProperty(track, "x") as number) / frameW, false),
          onComplete: () => {
            drag.update();
            render(index, false);
          },
        });
      };
      handlers.goTo = goToMobile;
      handlers.index = () => index;

      const onResize = () => {
        measure();
        drag.applyBounds({ minX: minX(), maxX: 0 });
        gsap.set(track, { x: -index * frameW });
        render(index, false);
      };
      handlers.refresh = onResize; // re-measure (e.g. after web fonts swap)
      window.addEventListener("resize", onResize, { passive: true });
      render(0, false);

      return () => {
        drag.kill();
        window.removeEventListener("resize", onResize);
      };
    });

    // ════════════ REDUCED MOTION: cross-fade, zero travel ════════════════
    mm.add("(prefers-reduced-motion: reduce)", () => {
      let index = 0;
      const positionUnderline = () => {
        if (labelGeo[index]) {
          underline.style.transform = `translateX(${labelGeo[index].left}px)`;
          underline.style.width = `${labelGeo[index].width}px`;
        }
      };
      // Panels are stacked (CSS); show one, cross-fade with arrows/keyboard.
      // dur=0 for the initial set so nothing fades on load (zero travel).
      const show = (i: number, dur = 0.25) => {
        index = clamp(i, 0, N - 1);
        panels.forEach((p, k) => {
          p.style.transform = "none";
          gsap.to(p, { autoAlpha: k === index ? 1 : 0, duration: dur, ease: "none", overwrite: true });
        });
        positionUnderline();
        labels.forEach((l, k) => l.classList.toggle(styles.labelActive, k === index));
        if (liveRef.current) liveRef.current.textContent = `Slide ${index + 1} of ${N}: ${SLIDES[index].word}`;
      };
      handlers.goTo = (i: number) => show(i);
      handlers.index = () => index;
      handlers.refresh = () => {
        measure();
        positionUnderline();
      };
      measure();
      show(0, 0);
      const onResize = () => {
        measure();
        positionUnderline();
      };
      window.addEventListener("resize", onResize, { passive: true });
      return () => window.removeEventListener("resize", onResize);
    });

    cleanups.push(() => {
      io.disconnect();
      prevRef.current?.removeEventListener("click", onPrev);
      nextRef.current?.removeEventListener("click", onNext);
      window.removeEventListener("keydown", onKey);
    });

    // Label geometry is measured with fallback fonts; re-measure once the web
    // fonts swap in so the underline aligns to the active label.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (killed) return;
        measure();
        handlers.refresh();
      });
    }

    return () => {
      killed = true;
      mm.revert();
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.deck}
      aria-roledescription="carousel"
      aria-label="Services, from the first pitch to the launch"
    >
      <div ref={pinRef} className={styles.pin}>
        <h2 className={`${styles.statement} deck-statement`}>
          From the first pitch
          <br />
          to the launch<span className={styles.dot}>.</span>
        </h2>

        <div ref={frameRef} className={styles.frame}>
          <div ref={trackRef} className={styles.track}>
            {SLIDES.map((s, i) => (
              <article
                key={s.word}
                data-panel
                {...(i === 0 ? { "data-active": true } : {})}
                className={styles.panel}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${N}`}
              >
                <div className={styles.panelImage}>
                  <div data-img className={styles.panelImageInner} style={{ filter: s.grade }}>
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className={styles.img}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>
                </div>
                <div data-text className={styles.panelText}>
                  <h3 className={styles.word}>{s.word}</h3>
                  <p className={styles.lede}>{s.lede}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.deckNav}>
          <button ref={prevRef} type="button" className={styles.arrow} aria-label="Previous slide">
            <span aria-hidden="true">←</span>
          </button>

          <div ref={navRef} className={styles.navList}>
            {SLIDES.map((s, i) => (
              <button
                key={s.word}
                data-label
                type="button"
                className={styles.label}
                aria-label={`Go to slide ${i + 1}, ${s.word}`}
              >
                <span>{s.word}</span>
              </button>
            ))}
            <span ref={underlineRef} className={styles.underline} aria-hidden="true" />
          </div>

          <button ref={nextRef} type="button" className={styles.arrow} aria-label="Next slide">
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <p ref={liveRef} className="sr-only" aria-live="polite" />
      </div>
    </section>
  );
}
