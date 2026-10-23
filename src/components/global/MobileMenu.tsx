"use client";

import Link from "next/link";
import { useEffect } from "react";
import Logotipo from "./Logotipo";
import { getLenis } from "./SmoothScroll";

// Page gutters that never go under a landscape notch (viewport-fit=cover).
const GUTTER_L = "max(var(--spacing-page-x), env(safe-area-inset-left))";
const GUTTER_R = "max(var(--spacing-page-x), env(safe-area-inset-right))";

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  /** Where the logo goes (the selected-work set stays inside itself). */
  homeHref?: string;
  /** Where "Start a project" goes. */
  ctaHref?: string;
}

/**
 * The phone menu, option 1B "Paper ledger" (Claude Design, Mobile Menu
 * Options, 2026-10-23): el gris ground like the site, a MENU / N SECTIONS
 * coordinate line over a negro rule, then one full-width row per section
 * (index, the title in the volume voice, an arrow) separated by hairlines,
 * a short stripe rule, the studio's coordinates at the bottom, and
 * "Start a project" as a negro bar pinned to the foot of the screen.
 *
 * The panel sits above the site header and carries its own logotipo and
 * close cross, so the header's hamburger never shows on top of it.
 */
export default function MobileMenu({
  open,
  onClose,
  links,
  homeHref = "/",
  ctaHref = "/contact",
}: MobileMenuProps) {
  useEffect(() => {
    // iOS Safari ignores overflow:hidden on body, so the page behind the
    // menu kept scrolling under a finger. Lenis owns the (non-passive) touch
    // listeners; stopping it is what actually freezes the page there.
    // Reduced motion has no Lenis: the overflow lock is all that is needed.
    const lenis = getLenis();
    if (open) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open]);

  // Escape closes, as on any sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const count = String(links.length).padStart(2, "0");

  return (
    // inert: while closed (off-screen) nothing inside it can take a tap or a
    // focus; overscroll-contain: a short panel never chains a swipe to the page.
    <div
      className={`mobile-menu fixed inset-0 z-[60] bg-gris flex flex-col overflow-y-auto overscroll-contain transition-transform duration-400 lg:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      inert={!open}
      role="dialog"
      aria-modal={open || undefined}
      aria-label="Menu"
    >
      {/* One column the height of the screen: the ledger at the top, the
          coordinates and the CTA bar pushed to the foot. The bar is full
          bleed, so the gutters live on the two inner blocks, not here. */}
      <div className="flex flex-col min-h-full" style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}>
        <div className="flex flex-col flex-1" style={{ paddingLeft: GUTTER_L, paddingRight: GUTTER_R }}>
        {/* Top bar: logotipo left, the close cross in a hairline box right.
            Same height as the site header so the mark does not jump. */}
        <div className="h-16 flex items-center justify-between">
          <Link href={homeHref} onClick={onClose} aria-label="Oaki Studio, Home" className="inline-flex items-center">
            <Logotipo style={{ fontSize: "clamp(22px, 2.3vw, 30px)" }} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="mobile-menu-close -mr-1 flex h-11 w-11 items-center justify-center border border-ink/40 text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* The ledger */}
        <div className="pt-16">
          <div className="coord flex items-center justify-between pb-3 border-b-2 border-ink">
            <span>Menu</span>
            <span>{count} sections</span>
          </div>
          <nav aria-label="Mobile navigation">
            <ul className="m-0 list-none p-0">
              {links.map((link, i) => (
                <li key={link.href} className="border-b border-ink/60">
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="mobile-menu-row grid items-center gap-4 py-6 text-ink"
                    style={{ gridTemplateColumns: "2.25rem 1fr auto" }}
                  >
                    <span className="coord">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-volume whitespace-nowrap" style={{ fontSize: "clamp(1.5rem, 7.4vw, 2.5rem)" }}>
                      {link.label}
                    </span>
                    <span className="mobile-menu-arrow text-ink" aria-hidden="true">
                      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 8h19M13 1.5L20 8l-7 6.5" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="stripe-rule mt-5 w-20" aria-hidden="true" />
        </div>

          {/* The studio's coordinates, pushed to the foot. */}
          <div className="coord mt-auto flex items-center justify-between pb-5 pt-12 text-muted">
            <span>Buenos Aires · AR</span>
            <span>Reply within two hours</span>
          </div>
        </div>

        <Link
          href={ctaHref}
          onClick={onClose}
          className="mobile-menu-cta flex items-center justify-between bg-ink text-paper"
          style={{
            paddingTop: "1.5rem",
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            paddingLeft: GUTTER_L,
            paddingRight: GUTTER_R,
          }}
        >
          <span className="text-volume" style={{ fontSize: "1.25rem", letterSpacing: "0" }}>
            Start a project
          </span>
          <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 8h19M13 1.5L20 8l-7 6.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
