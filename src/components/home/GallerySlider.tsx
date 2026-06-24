"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./GallerySlider.module.css";

export type GallerySlide = {
  src: string;
  collection?: string;
  title?: string;
  client?: string;
  year?: string;
  description?: string;
};

/**
 * Peek carousel — one image centred at a time with its neighbours peeking on
 * either side, full colour on a light ground. Infinite loop (tripled list with
 * a seamless snap), auto-advancing (reduced-motion safe), with pointer
 * drag/swipe, dot nav and arrows. The per-slide caption (collection / title /
 * client · year) matches the hero; the bottom-left tab describes the image.
 */
export default function GallerySlider({
  slides,
  intervalMs = 5500,
}: {
  slides: GallerySlide[];
  intervalMs?: number;
}) {
  const n = slides.length;
  const loop = n > 1;
  const items = loop ? [...slides, ...slides, ...slides] : slides;

  const [pos, setPos] = useState(loop ? n : 0); // index into `items`
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);

  const startXRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const active = ((pos % n) + n) % n;

  // Auto-advance — disabled for a single slide or reduced-motion users.
  useEffect(() => {
    if (!loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!startXRef.current) {
        setAnimate(true);
        setPos((p) => p + 1);
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [loop, intervalMs]);

  // Re-enable the transition one frame after a seamless snap.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (!loop || e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (pos >= 2 * n || pos < n) {
      setAnimate(false);
      setPos(active + n); // jump to the equivalent slide in the middle copy
    }
  };

  const step = (dir: number) => {
    setAnimate(true);
    setPos((p) => p + dir);
  };
  const goTo = (i: number) => {
    setAnimate(true);
    setPos((p) => p + (i - active));
  };

  // Pointer drag / swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX || 1;
    setAnimate(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startXRef.current) return;
    setDragPx(e.clientX - startXRef.current);
  };
  const endDrag = () => {
    if (!startXRef.current) return;
    const moved = dragPx;
    startXRef.current = 0;
    setDragPx(0);
    setAnimate(true);
    const threshold = 80;
    if (loop && moved <= -threshold) setPos((p) => p + 1);
    else if (loop && moved >= threshold) setPos((p) => p - 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  };

  if (n === 0) return null;
  const cap = slides[active];

  return (
    <section className={styles.section} aria-label="Selected project images">
      <div
        className={styles.viewport}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          ref={trackRef}
          className={`${styles.track} ${animate ? "" : styles.noAnim}`}
          style={{ ["--pos" as string]: pos, ["--drag" as string]: dragPx }}
          onTransitionEnd={onTransitionEnd}
        >
          {items.map((s, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === pos ? styles.active : ""}`}
              aria-hidden={i !== pos}
            >
              <div className={styles.frame}>
                <Image
                  src={s.src}
                  alt={s.description ?? s.title ?? ""}
                  fill
                  sizes="64vw"
                  className={styles.img}
                  draggable={false}
                  priority={i === pos}
                />
                {s.description ? <span className={styles.tab}>{s.description}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.caption}>
          {cap.collection ? <span className={styles.capCollection}>{cap.collection}</span> : null}
          {cap.title ? <span className={styles.capTitle}>{cap.title}</span> : null}
          {cap.client ? (
            <span className={styles.capMeta}>
              {cap.client}
              {cap.year ? ` · ${cap.year}` : ""}
            </span>
          ) : null}
        </div>

        {loop ? (
          <div className={styles.controls}>
            <div className={styles.dots} role="tablist" aria-label="Gallery slides">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-selected={i === active}
                  role="tab"
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <div className={styles.arrows}>
              <button type="button" className={styles.arrow} aria-label="Previous" onClick={() => step(-1)}>
                ←
              </button>
              <button type="button" className={styles.arrow} aria-label="Next" onClick={() => step(1)}>
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
