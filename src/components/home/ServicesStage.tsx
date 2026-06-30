"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import styles from "./ServicesStage.module.css";

export interface StageData {
  /** 1-based stage number, rendered as the 01 / 02 / 03 tag. */
  index: number;
  /** Giant stage word (proper case; uppercased via CSS). */
  word: string;
  /** Small audience / angle label under the word. */
  label: string;
  lede: string;
  image: string;
  /** Which side the giant word sits on (the image strip takes the other). */
  align: "left" | "right";
  /** Real font weight for the type ramp (Inktrap is static: 300/400/800). */
  weight: 300 | 400 | 800;
  /**
   * How the image moves inside the frame across the scroll:
   *  - "pan"      a slow X drift toward the word (Concept, Campaign)
   *  - "pullback" a measured zoom-out from a tight crop (Proof)
   */
  motionKind: "pan" | "pullback";
  /** The develop grade: blurred/loose start, resolved end, optional mid for a late bloom. */
  gradeFrom: string;
  gradeTo: string;
  /** Campaign: state at center (progress ~0.5); the last of the saturation blooms 0.5 -> 1. */
  gradeMid?: string;
  /** Campaign: a gentle Ken Burns scale layered on top of the pan. */
  kenBurns?: boolean;
}

/**
 * One Services stage row — "the developing frame". The strip is never a
 * finished block: as the row scrolls, an aperture opens from a center line,
 * the image is already panning (or pulling back) inside it, and the grade
 * resolves from loose/desaturated to its target around center. Everything on
 * the image is scrubbed to the row's scroll progress, so it can't "just
 * appear". The type/label/lede keep their one-shot entrance.
 *
 * Resting state (CSS defaults + inline `gradeTo`) is the reduced-motion / no-JS
 * state: aperture open, image graded, static.
 */
export default function ServicesStage({
  index,
  word,
  label,
  lede,
  image,
  align,
  weight,
  motionKind,
  gradeFrom,
  gradeTo,
  gradeMid,
  kenBurns = false,
}: StageData) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wordEl = wordRef.current;
    const strip = stripRef.current;
    const pan = panRef.current;
    const grade = gradeRef.current;
    if (!root || !wordEl || !strip || !pan || !grade) return;
    const textItems = textRef.current ? Array.from(textRef.current.children) : [];

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const mm = gsap.matchMedia();
    const mmIntro = gsap.matchMedia();

    // ── Type (one-shot): word rises, label/lede lift last, ocre band-sweep
    //    binds the band on desktop. Kept in its OWN matchMedia keyed only on
    //    reduced-motion, so a width / orientation change across 768px does NOT
    //    tear the entrance down and replay it on already-revealed content.
    mmIntro.add("(prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(wordEl, { type: "chars", charsClass: styles.char });
      const intro = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
      intro
        .from(split.chars, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.025,
          duration: 0.9,
          ease: "power4.out",
        })
        .from(
          textItems,
          { autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.7, ease: "power3.out" },
          0.35,
        );
      // Desktop-only flourish; a one-time check (not a reactive condition) is
      // fine for a single entry pass.
      if (window.matchMedia("(min-width: 768px)").matches && sweepRef.current) {
        intro
          .fromTo(
            sweepRef.current,
            { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 },
            { clipPath: "inset(0 0 0 0)", duration: 0.7, ease: "expo.out" },
            0.05,
          )
          .to(sweepRef.current, { autoAlpha: 0, duration: 0.45, ease: "power2.out" });
      }
      return () => split.revert();
    });

    // ── Continuous, scrubbed developing-frame + responsive (desktop) effects.
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        isDesktop: "(min-width: 768px)",
      },
      (self) => {
        const { motion, isDesktop } = self.conditions as {
          motion: boolean;
          isDesktop: boolean;
        };
        if (!motion) return; // reduced motion: the CSS resting state stands

        // ── The developing frame (one scrubbed timeline = one ScrollTrigger per
        //    strip). Mapped to row progress 0 (enters bottom) -> 1 (exits top);
        //    duration 1 so tween times read as progress fractions.
        const dev = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // A. Aperture: thin center line -> full height (progress 0 -> 0.3).
        dev.fromTo(
          strip,
          { clipPath: "inset(50% 0% 50% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "expo.out" },
          0,
        );

        // C. Develop: blur clears + grade resolves by center (progress 0 -> 0.5),
        //    then Campaign blooms the last saturation (0.5 -> 1).
        dev.fromTo(
          grade,
          { filter: gradeFrom },
          { filter: gradeMid ?? gradeTo, duration: 0.5, ease: "power2.out" },
          0,
        );
        if (gradeMid) dev.to(grade, { filter: gradeTo, duration: 0.5 }, 0.5);

        // B/D. The pan (or pull-back), continuous across the whole row.
        if (motionKind === "pullback") {
          dev.fromTo(pan, { scale: 1.25 }, { scale: 1, duration: 1 }, 0);
        } else {
          const amp = isDesktop ? 6 : 3; // ~6% mobile / ~12% desktop of image width
          const end = align === "left" ? -1 : 1; // pan toward the word
          dev.fromTo(pan, { xPercent: -end * amp }, { xPercent: end * amp, duration: 1 }, 0);
          if (kenBurns) dev.fromTo(pan, { scale: 1.06 }, { scale: 1.12, duration: 1 }, 0);
        }

        // Word drift, on the SAME scrub so type + image move as one band.
        if (isDesktop) {
          const sign = align === "left" ? 1 : -1;
          dev.fromTo(
            wordEl,
            { x: () => -window.innerWidth * 0.03 * sign },
            { x: () => window.innerWidth * 0.03 * sign, duration: 1 },
            0,
          );
        }

        // Active stage takes the ocre tag while it owns the viewport center.
        ScrollTrigger.create({
          trigger: root,
          start: "top center",
          end: "bottom center",
          toggleClass: { targets: root, className: styles.active },
        });

        // Scroll-velocity skew on the word (desktop only).
        if (isDesktop) {
          const setSkew = gsap.quickTo(wordEl, "skewY", { duration: 0.4, ease: "power3" });
          ScrollTrigger.create({
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (st) => setSkew(gsap.utils.clamp(-3, 3, st.getVelocity() / -350)),
          });
        }
      },
    );

    return () => {
      mm.revert();
      mmIntro.revert();
    };
  }, [align, motionKind, gradeFrom, gradeMid, gradeTo, kenBurns]);

  return (
    <div ref={rootRef} className={styles.stage} data-align={align}>
      <div className={styles.wordRow}>
        <div className={styles.wordCol}>
          <h3 className={styles.wordHeading}>
            <span className="sr-only">{word}</span>
            <span className={styles.wordMask} aria-hidden="true">
              <span ref={wordRef} className={styles.word} style={{ fontWeight: weight }}>
                {word}
              </span>
            </span>
          </h3>
          <span className={styles.ocreRule} aria-hidden="true" />
        </div>

        <div className={styles.stripCol}>
          <div ref={stripRef} className={styles.strip}>
            <div ref={panRef} className={styles.stripPan} data-kind={motionKind}>
              <div ref={gradeRef} className={styles.stripGrade} style={{ filter: gradeTo }}>
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className={styles.img}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
            <span ref={tagRef} className={styles.tag}>
              {String(index).padStart(2, "0")}
            </span>
          </div>
        </div>

        <span ref={sweepRef} className={styles.bandSweep} aria-hidden="true" />
      </div>

      <div ref={textRef} className={styles.textRow}>
        <span className={`${styles.label} coord`}>{label}</span>
        <p className={`${styles.lede} text-lede`}>{lede}</p>
      </div>
    </div>
  );
}
