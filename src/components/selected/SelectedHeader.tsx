"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useLayoutEffect, useState } from "react";
import Logotipo from "@/components/global/Logotipo";
import MobileMenu from "@/components/global/MobileMenu";
import CopyEmail from "@/components/global/CopyEmail";
import { SELECTED_BASE, SELECTED_CONTACT, selectedWorks } from "@/lib/selected-works";

// The selected-work bar: the site header's chrome (same bar, same glass,
// same hide-over-the-hero rule) with a closed set of links, so a prospect
// moves between the three cases and the contact page and never leaves.
// No mega menu, no public sections.

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const links = [
  ...selectedWorks.map((w) => ({ label: w.short, href: `${SELECTED_BASE}/${w.slug}` })),
  { label: "Contact", href: SELECTED_CONTACT },
];

export default function SelectedHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [hasHero, setHasHero] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useIsoLayoutEffect(() => {
    let hero: HTMLElement | null = null;
    let heroBottom = 0;
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 32);
      setPastHero(hero !== null && y >= heroBottom);
    };
    const measure = () => {
      hero = document.querySelector<HTMLElement>("[data-hero]");
      if (hero) heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      setHasHero(!!hero);
      update();
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useEffect(() => {
    startTransition(() => setMenuOpen(false));
  }, [pathname]);

  const heroPage = hasHero ?? false;
  const hideForHero = heroPage && !pastHero;
  const glass = !hideForHero && (scrolled || !heroPage);

  return (
    <>
      <header
        data-nav-ready={hasHero === null ? undefined : ""}
        className={`site-header fixed top-0 left-0 right-0 z-50 ${glass ? "glass" : ""}`}
        style={{
          transition:
            "transform 450ms cubic-bezier(0.66,0,0.2,1), opacity 450ms cubic-bezier(0.66,0,0.2,1), background 300ms, border-color 300ms, backdrop-filter 300ms",
          ...(hideForHero
            ? { transform: "translateY(-100%)", opacity: 0, pointerEvents: "none" as const }
            : null),
        }}
      >
        <div className="pl-8 lg:pl-12 pr-7 flex items-center justify-between h-16 lg:h-20 relative">
          <Link
            href={SELECTED_BASE}
            aria-label="Oaki Studio, Selected work"
            className="inline-flex items-baseline gap-3"
          >
            <Logotipo style={{ fontSize: "clamp(22px, 2.3vw, 30px)" }} />
            <span className="coord text-muted hidden sm:inline">Selected work</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7" aria-label="Selected work navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`coord nav-link-warm inline-flex items-center py-1 transition-colors duration-300 ${
                  pathname === link.href ? "text-ink active" : "hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <CopyEmail className="coord nav-link-warm nav-copy-email hover:text-ink transition-colors duration-300" />
          </nav>

          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-ink transition-transform duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block w-6 h-px bg-ink transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-ink transition-transform duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        homeHref={SELECTED_BASE}
        ctaHref={SELECTED_CONTACT}
      />
    </>
  );
}
