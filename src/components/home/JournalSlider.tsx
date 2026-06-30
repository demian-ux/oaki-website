"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./JournalSlider.module.css";
import type { JournalArticle } from "@/lib/journal-mock";

/**
 * "From the Journal" — an editorial peek carousel. The active entry sits
 * full-colour against the left page edge with the next entry peeking, dimmed,
 * to its right. Each card carries its own caption (category tag / title /
 * date · read time). Same motion model as the gallery: infinite loop (tripled
 * list with a seamless snap), auto-advance (reduced-motion safe), pointer
 * drag/swipe, dot nav and arrows.
 */
export default function JournalSlider({
  articles,
  heading = "What the render\ndoesn't show",
  intro = "Notes on light, material, and the thinking behind our award winning work. Written by the people making it.",
  allHref = "/journal",
  intervalMs = 5500,
}: {
  articles: JournalArticle[];
  heading?: string;
  intro?: string;
  allHref?: string;
  intervalMs?: number;
}) {
  const router = useRouter();
  const n = articles.length;
  const loop = n > 1;
  const items = loop ? [...articles, ...articles, ...articles] : articles;

  const [pos, setPos] = useState(loop ? n : 0); // index into `items`
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);

  const startXRef = useRef(0);
  const draggedRef = useRef(false);
  const pressedRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const active = ((pos % n) + n) % n;

  const hrefFor = (slug: string) => `${allHref.replace(/\/$/, "")}/${slug}`;

  // Auto-advance — disabled for a single entry or reduced-motion.
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
      setPos(active + n); // jump to the equivalent entry in the middle copy
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

  // Tap on the active card opens the entry; tap on a peeking card centres it.
  const onSlideClick = (i: number) => {
    if (draggedRef.current) return;
    if (i === pos) router.push(hrefFor(items[i].slug));
    else {
      setAnimate(true);
      setPos(i);
    }
  };

  // Pointer drag / swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX || 1;
    draggedRef.current = false;
    const el = (e.target as HTMLElement).closest("[data-idx]") as HTMLElement | null;
    pressedRef.current = el ? Number(el.dataset.idx) : null;
    setAnimate(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startXRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 5) draggedRef.current = true;
    setDragPx(dx);
  };
  // Pointer capture suppresses the native click, so resolve tap-vs-drag here.
  const endDrag = () => {
    if (!startXRef.current) return;
    const moved = dragPx;
    const wasDrag = draggedRef.current;
    const pressed = pressedRef.current;
    startXRef.current = 0;
    pressedRef.current = null;
    setDragPx(0);
    setAnimate(true);
    if (wasDrag) {
      const threshold = 80;
      if (loop && moved <= -threshold) setPos((p) => p + 1);
      else if (loop && moved >= threshold) setPos((p) => p - 1);
    } else if (pressed !== null) {
      onSlideClick(pressed);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  };

  if (n === 0) return null;

  return (
    <section className={styles.section} aria-label="From the journal">
      <div className={`${styles.header} page-x`}>
        <div className={styles.headLeft}>
          <h2 className={`${styles.heading} text-statement text-volume reveal`}>
            {heading.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 ? <br /> : null}
              </span>
            ))}
            <span className="dot">.</span>
          </h2>
        </div>
        <Link href={allHref} className={styles.allEntries}>
          All entries <span aria-hidden>→</span>
        </Link>
      </div>

      {intro ? <p className={`${styles.intro} page-x`}>{intro}</p> : null}

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
          {items.map((a, i) => {
            const isActive = i === pos;
            return (
              <article
                key={i}
                className={`${styles.slide} ${isActive ? styles.active : ""}`}
                aria-hidden={!isActive}
                data-idx={i}
              >
                <div className={styles.frame}>
                  <Image
                    src={a.img}
                    alt={a.title}
                    fill
                    sizes="60vw"
                    className={styles.img}
                    draggable={false}
                    priority={i === pos}
                  />
                  <span className={styles.tag}>{a.category}</span>
                </div>

                <div className={styles.caption}>
                  <h3 className={styles.title}>{a.title}</h3>
                  <div className={styles.meta}>
                    {!isActive ? (
                      <Link
                        href={hrefFor(a.slug)}
                        className={styles.readLink}
                        tabIndex={isActive ? 0 : -1}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read <span aria-hidden>→</span>
                      </Link>
                    ) : null}
                    <span className={styles.metaText}>
                      {a.date} · {a.readMins} min read
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {loop ? (
        <div className={`${styles.footer} page-x`}>
          <div className={styles.dots} role="tablist" aria-label="Journal entries">
            {articles.map((a, i) => (
              <button
                key={a.slug}
                type="button"
                className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
                aria-label={`Go to entry ${i + 1}`}
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
    </section>
  );
}
