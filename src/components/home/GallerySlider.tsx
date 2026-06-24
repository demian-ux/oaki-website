"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./GallerySlider.module.css";

export type GallerySlide = { src: string; alt?: string; label?: string };

/**
 * One-image-at-a-time editorial gallery: crossfade between CMS-driven project
 * images, auto-advancing (paused for reduced-motion), with pointer drag/swipe,
 * dot nav and a counter. B&W treatment per the design-system "B&W lane".
 */
export default function GallerySlider({
  slides,
  intervalMs = 5500,
}: {
  slides: GallerySlide[];
  intervalMs?: number;
}) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startXRef = useRef(0);
  const widthRef = useRef(1);
  const viewportRef = useRef<HTMLDivElement>(null);

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  // Auto-advance — disabled for a single slide or reduced-motion users.
  useEffect(() => {
    if (n <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!startXRef.current) setIndex((p) => (p + 1) % n);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [n, intervalMs]);

  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX || 1;
    widthRef.current = viewportRef.current?.offsetWidth ?? 1;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragPx(e.clientX - startXRef.current);
  };
  const endDrag = () => {
    if (!dragging) return;
    const threshold = widthRef.current * 0.12;
    if (dragPx <= -threshold) go(index + 1);
    else if (dragPx >= threshold) go(index - 1);
    setDragging(false);
    setDragPx(0);
    startXRef.current = 0;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
  };

  if (n === 0) return null;
  const active = slides[index];

  return (
    <section className={styles.section} aria-label="Selected project images">
      <div
        ref={viewportRef}
        className={`${styles.viewport} ${dragging ? styles.dragging : ""}`}
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
        {slides.map((s, i) => (
          <div
            key={s.src + i}
            className={`${styles.slide} ${i === index ? styles.active : ""}`}
            aria-hidden={i !== index}
            style={
              i === index
                ? { transform: `translateX(${dragPx * 0.4}px)`, transition: dragging ? "none" : undefined }
                : undefined
            }
          >
            <Image
              src={s.src}
              alt={s.alt ?? s.label ?? ""}
              fill
              sizes="100vw"
              className={styles.img}
              draggable={false}
              priority={i === 0}
            />
          </div>
        ))}

        {active.label ? <span className={styles.label}>{active.label}</span> : null}
        <span className={styles.counter}>
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
      </div>

      {n > 1 ? (
        <div className={styles.dots} role="tablist" aria-label="Gallery slides">
          {slides.map((s, i) => (
            <button
              key={s.src + i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === index}
              role="tab"
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
