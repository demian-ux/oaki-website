"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServicesStage, { type StageData } from "./ServicesStage";
import styles from "./ServicesSequence.module.css";

/**
 * Services — the offering as the life of a project, from first pitch to launch.
 * Three stages firm up (Light to Ultrabold) and warm up (grey to full color)
 * as the reader scrolls. Copy is voice-approved; images are placeholders the
 * founder swaps per stage.
 */
const STAGES: StageData[] = [
  {
    index: 1,
    word: "Concept",
    label: "For investors, boards, juries",
    lede: "Sell the idea before it exists. Images that win the room: investors, boards, juries.",
    image: "/images/03.jpg", // placeholder — atmospheric, moody; reads soft + desaturated
    align: "left",
    weight: 300,
    motionKind: "pan", // slow drift toward the word, stays largely grey
    gradeFrom: "blur(6px) grayscale(1) contrast(0.92) brightness(1.04)",
    gradeTo: "blur(0px) grayscale(0.85) contrast(1) brightness(1)",
  },
  {
    index: 2,
    word: "Proof",
    label: "Materials, light, junctions",
    lede: "Images precise enough to build from. The kind that still match the building years after it opens.",
    image: "/images/07.jpg", // placeholder — high-detail, material; rewards the pull-back
    align: "right",
    weight: 400,
    motionKind: "pullback", // measured zoom-out from a tight crop, sharpening
    gradeFrom: "blur(6px) grayscale(0.7) contrast(0.98)",
    gradeTo: "blur(0px) grayscale(0.05) contrast(1.03)",
  },
  {
    index: 3,
    word: "Campaign",
    label: "Film · book · social",
    lede: "Take it to market. Film, book, and social, composed as one story. Not a folder of jpegs.",
    image: "/images/05.jpg", // placeholder — full-color, lively; pays off the bloom
    align: "left",
    weight: 800,
    motionKind: "pan",
    kenBurns: true, // widest movement: pan + gentle Ken Burns
    gradeFrom: "blur(6px) saturate(0.5)",
    gradeMid: "blur(0px) saturate(1)", // resolved by center ...
    gradeTo: "blur(0px) saturate(1.1)", // ... then the last of the color blooms
  },
];

export default function ServicesSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
      });
      tl.from(eyebrowRef.current, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }).from(
        [line1Ref.current, line2Ref.current],
        { yPercent: 110, stagger: 0.12, duration: 1.0, ease: "expo.out" },
        0.2,
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.section} page-x`} aria-label="Services">
      <p ref={eyebrowRef} className={`${styles.eyebrow} coord`}>
        Services
      </p>
      <h2 className={styles.statement} aria-label="From the first pitch to the launch.">
        <span className={styles.lineMask}>
          <span ref={line1Ref} className={styles.line} aria-hidden="true">
            From the first pitch
          </span>
        </span>
        <span className={styles.lineMask}>
          <span ref={line2Ref} className={styles.line} aria-hidden="true">
            to the launch.
          </span>
        </span>
      </h2>

      <div className={styles.stages}>
        {STAGES.map((stage) => (
          <ServicesStage key={stage.word} {...stage} />
        ))}
      </div>
    </section>
  );
}
