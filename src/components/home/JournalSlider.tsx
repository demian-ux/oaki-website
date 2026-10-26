"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./JournalSlider.module.css";
import useCoarsePointer from "@/components/global/useCoarsePointer";
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
  heading = "Our work, after your meeting",
  intro = "Most renders retire when the pitch ends. These went on: awards, openings, front pages.",
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
  const viewportRef = useRef<HTMLDivElement>(null);
  // iPad tier (IPAD_AUDIT_2026-10.md): on a tablet the swipe comes through
  // native touch listeners (below) and the pointer handlers ignore touch
  // pointers. A mouse or pen keeps the pointer path exactly as it was.
  const tablet = useCoarsePointer(true);

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

  // Drag core, shared by the pointer path and the tablet touch path.
  const dragStart = (x: number, target: EventTarget | null) => {
    startXRef.current = x || 1;
    draggedRef.current = false;
    const el = (target as HTMLElement | null)?.closest("[data-idx]") as HTMLElement | null;
    pressedRef.current = el ? Number(el.dataset.idx) : null;
    setAnimate(false);
  };
  const dragMove = (x: number) => {
    if (!startXRef.current) return;
    const dx = x - startXRef.current;
    if (Math.abs(dx) > 5) draggedRef.current = true;
    setDragPx(dx);
  };
  // A touch that turned out to be a vertical page scroll: let go without a
  // step and without a tap.
  const cancelDrag = () => {
    if (!startXRef.current) return;
    startXRef.current = 0;
    pressedRef.current = null;
    setDragPx(0);
    setAnimate(true);
  };

  // Pointer drag / swipe (mouse, pen; touch too outside the tablet tier).
  const isTabletTouch = (e: React.PointerEvent) => tablet && e.pointerType === "touch";
  const onPointerDown = (e: React.PointerEvent) => {
    if (isTabletTouch(e)) return;
    dragStart(e.clientX, e.target);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (isTabletTouch(e)) return;
    dragMove(e.clientX);
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    if (isTabletTouch(e)) return;
    endDrag();
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

  // Tablet touch path. iOS Safari and pointer capture on a touch pointer
  // did not deliver the horizontal moves, so the swipe is read from the
  // touch events themselves: the first clear direction decides whether the
  // gesture is ours (horizontal: the page must not pan, so the move is
  // prevented) or the page's (vertical: touch-action: pan-y scrolls it and
  // the drag is dropped). The handlers are read through a ref so the
  // listeners, bound once, always call the current render's closures.
  const touchApi = useRef({ dragStart, dragMove, endDrag, cancelDrag });
  useEffect(() => {
    touchApi.current = { dragStart, dragMove, endDrag, cancelDrag };
  });
  useEffect(() => {
    if (!tablet) return;
    const el = viewportRef.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    let axis: "x" | "y" | null = null;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      axis = null;
      touchApi.current.dragStart(t.clientX, e.target);
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") {
          touchApi.current.cancelDrag();
          return;
        }
      }
      if (axis !== "x") return;
      if (e.cancelable) e.preventDefault();
      touchApi.current.dragMove(t.clientX);
    };
    const onEnd = () => {
      if (axis === "y") return;
      touchApi.current.endDrag();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [tablet]);

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
        ref={viewportRef}
        className={styles.viewport}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
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
                  {/* Deliberate exception to the studio's no-crop rule, this
                      section only: the carousel reads as a row of equal cards,
                      so the frame is a fixed ratio and the render covers it. */}
                  <Image
                    src={a.img}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 84vw, 46vw"
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
