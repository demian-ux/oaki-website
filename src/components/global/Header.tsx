"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import SectionLabel from "./SectionLabel";
import Logotipo from "./Logotipo";
import CopyEmail from "./CopyEmail";
import SanityImg from "./SanityImg";
import { useHeroTheme } from "./HeroTheme";
import { getLenis } from "./SmoothScroll";
import { HERO_REPLAY_EVENT } from "@/lib/hero-replay";
import type { Project } from "@/lib/types";

// Avoid the SSR "useLayoutEffect does nothing on the server" warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface HeaderProps {
  projects?: Project[];
  ctaLabel?: string;
  /** Site-settings toggle: when true, Journal joins the nav after About. */
  showJournal?: boolean;
  navLabels?: {
    caseStudies?: string;
    process?: string;
    about?: string;
    contact?: string;
  };
}

export default function Header({ projects = [], navLabels, showJournal = false }: HeaderProps) {
  // The three sections — same set the home hero presents (§02). The nav bar
  // emerges from that masthead, so it carries the same items + mono voice.
  // Journal is content-gated: it appears once the Studio toggle is flipped.
  const navLinks = [
    { label: navLabels?.caseStudies ?? "Case Studies", href: "/case-studies" },
    { label: navLabels?.process ?? "Process", href: "/process" },
    { label: navLabels?.about ?? "About", href: "/about" },
    ...(showJournal ? [{ label: "Journal", href: "/journal" }] : []),
    { label: navLabels?.contact ?? "Contact", href: "/contact" },
  ];
  const mobileLinks = navLinks;

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  // null = not yet measured (SSR / first paint). Whether the page has a hero
  // is read from the DOM, never derived from the route: in production the
  // layout is prerendered without a concrete pathname, so usePathname() can't
  // be trusted for the initial chrome. The layout-effect below corrects the
  // state before first paint, and that state change also forces the re-render
  // React needs to patch any stale SSR attributes it kept on hydration.
  const [hasHero, setHasHero] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useIsoLayoutEffect(() => {
    // Reveal the nav only once the hero section is fully scrolled past.
    // The scroll path must stay cheap — Lenis emits a scroll event per frame,
    // so the hero's document-space bottom is measured once (and on resize /
    // streamed-content arrival) and scroll frames only compare scrollY
    // against that cached number, throttled to one update per frame.
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
    // With streamed server components the header can mount before the hero
    // exists in the DOM; watch for it, then stop — the observer must not
    // stay hot (its callback forces layout) once the hero is measured.
    const mo = new MutationObserver(() => {
      if (hero) {
        mo.disconnect();
        return;
      }
      measure();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      mo.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  useEffect(() => {
    startTransition(() => {
      setMenuOpen(false);
      setMegaOpen(false);
    });
  }, [pathname]);

  // Logotipo on the home route: <Link href="/"> is a no-op there, so take the
  // click over and "start again" instead — jump to the top and play the hero
  // opening from zero. Every other route keeps the plain navigation.
  // The route is read from the DOM at click time (post-hydration), not from
  // render state: the layout is prerendered without a concrete pathname.
  const onLogotipoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // let cmd/ctrl/shift/alt-click and middle-click open a tab as usual
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.location.pathname !== "/") return;
    if (!document.querySelector("[data-hero]")) return;
    e.preventDefault();
    // Immediate, not smooth-scrolled: the opening is the thing being replayed,
    // and a second of travel would start it halfway down the page.
    // Both calls are needed. Lenis only applies scrollTo on its next rAF tick
    // (and holds its own internal position, which it would otherwise write
    // back over ours), so tell Lenis where we are AND move the document now.
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new CustomEvent(HERO_REPLAY_EVENT));
  };

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const { overHeroDark } = useHeroTheme();
  // Server and first client render must agree (nav visible), otherwise React
  // silently keeps the prerendered attributes on hydration and later state
  // changes never patch the real DOM. Until the layout-effect measures the
  // DOM, the pre-hydration hide is handled by CSS (body:has([data-hero])
  // in globals.css), which the data-nav-ready attribute below switches off.
  const heroPage = hasHero ?? false;
  // overHeroDark is live: the hero reports it true only while its render
  // still sits under the navbar. Invert there; everywhere else, the subtle
  // glass bar (at rest on inner pages, on scroll on hero pages).
  const inverted = overHeroDark && !megaOpen;
  // The hero owns the top chrome (its own INFO / oaki. / CONTACT bar), so the
  // site header stays hidden until you scroll past it.
  const hideForHero = heroPage && !pastHero && !megaOpen;
  // Never dress the bar while it's hidden: an off-screen element with a
  // painted background still costs the compositor a full-width layer on
  // every scrolled frame.
  const glass = !inverted && !hideForHero && (scrolled || !heroPage || megaOpen);

  return (
    <>
      <header
        data-nav-ready={hasHero === null ? undefined : ""}
        className={`site-header fixed top-0 left-0 right-0 z-50 ${glass ? "glass" : ""} ${inverted ? "inverted" : ""} ${megaOpen ? "mega-open" : ""}`}
        style={{
          transition:
            "transform 450ms cubic-bezier(0.66,0,0.2,1), opacity 450ms cubic-bezier(0.66,0,0.2,1), background 300ms, border-color 300ms, backdrop-filter 300ms",
          ...(hideForHero
            ? { transform: "translateY(-100%)", opacity: 0, pointerEvents: "none" as const }
            : null),
        }}
      >
        <div className="pl-8 lg:pl-12 pr-7 flex items-center justify-between h-16 lg:h-20 relative">
          {/* Logotipo — the word mark (Brand Guidelines 4.1 §01) */}
          <Link
            href="/"
            aria-label="Oaki Studio, Home"
            className="inline-flex items-center"
            onClick={onLogotipoClick}
          >
            <Logotipo
              inverted={inverted}
              style={{ fontSize: "clamp(22px, 2.3vw, 30px)" }}
            />
          </Link>

          {/* Desktop nav — the three sections, mono coordinate voice */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isCaseStudies = link.href === "/case-studies";
              return (
                <div
                  key={link.href}
                  className="relative flex items-center"
                  onMouseEnter={isCaseStudies && projects.length > 0 ? openMega : undefined}
                  onMouseLeave={isCaseStudies && projects.length > 0 ? scheduleClose : undefined}
                >
                  <Link
                    href={link.href}
                    className={`coord nav-link-warm inline-flex items-center gap-1 py-1 transition-colors duration-300 ${
                      pathname === link.href ? "text-ink active" : "hover:text-ink"
                    } ${isCaseStudies && megaOpen ? "open" : ""}`}
                    aria-haspopup={isCaseStudies ? "true" : undefined}
                    aria-expanded={isCaseStudies ? megaOpen : undefined}
                  >
                    {link.label}
                    {isCaseStudies && projects.length > 0 && (
                      <span className="nav-caret" aria-hidden="true">›</span>
                    )}
                  </Link>
                </div>
              );
            })}
            <CopyEmail className="coord nav-link-warm nav-copy-email hover:text-ink transition-colors duration-300" />
          </nav>

          {/* Mobile menu button */}
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

        {/* Mega menu */}
        {projects.length > 0 && (
          <CaseStudiesMegaMenu
            open={megaOpen}
            projects={projects}
            onEnter={openMega}
            onLeave={scheduleClose}
            onClose={() => setMegaOpen(false)}
          />
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={mobileLinks} />
    </>
  );
}

function CaseStudiesMegaMenu({
  open,
  projects,
  onEnter,
  onLeave,
  onClose,
}: {
  open: boolean;
  projects: Project[];
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  // Prefer explicitly-featured books, but fall back to the most recent case
  // studies so the column never renders empty when nothing is flagged featured.
  const flagged = projects.filter((p) => p.featured);
  const featured = (flagged.length > 0 ? flagged : projects).slice(0, 3);
  const recent = projects.slice(0, 5);
  const collections = Array.from(
    new Set(projects.map((p) => p.collectionLabel).filter(Boolean))
  ) as string[];

  return (
    <div
      className={`mega-menu ${open ? "open" : ""}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-hidden={!open}
    >
      <div className="mega-inner page-x">
        <div className="mega-grid">
          {/* Column 1 — By collection */}
          <div>
            <SectionLabel className="mega-label">By Collection</SectionLabel>
            <ul className="mega-list">
              {collections.map((c, i) => (
                <li key={c}>
                  <Link
                    href="/case-studies"
                    onClick={onClose}
                    className="mega-link"
                    style={{ transitionDelay: `${60 + i * 30}ms` }}
                  >
                    <span className="mega-link-num">{String(i + 1).padStart(2, "0")}</span>
                    <span>{c}</span>
                    <span className="mega-link-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Featured */}
          <div>
            <SectionLabel className="mega-label">Featured Books</SectionLabel>
            <div className="mega-featured-grid">
              {featured.map((p, i) => (
                <Link
                  key={p._id || p.slug}
                  href={`/case-studies/${p.slug}`}
                  onClick={onClose}
                  className="mega-card"
                  style={{ transitionDelay: `${120 + i * 60}ms` }}
                >
                  <div className="mega-card-cover">
                    <SanityImg
                      image={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="220px"
                      className="object-cover"
                      fallback={<div className="cover-paint-mini" />}
                    />
                    <div className="mega-card-hover">
                      <span className="text-label">Open Book →</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-label text-muted" style={{ marginBottom: 4 }}>
                      {p.collectionLabel}
                    </p>
                    <p className="card-title">{p.title.toUpperCase()}</p>
                    <p className="text-meta text-muted">
                      {[p.city, p.country].filter(Boolean).join(", ")}
                      {p.year ? ` · ${p.year}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 — Recent + CTA */}
          <div>
            <SectionLabel className="mega-label">Recently Added</SectionLabel>
            <ul className="mega-list mega-list-recent">
              {recent.map((p, i) => (
                <li key={p._id || p.slug}>
                  <Link
                    href={`/case-studies/${p.slug}`}
                    onClick={onClose}
                    className="mega-recent-link"
                    style={{ transitionDelay: `${160 + i * 30}ms` }}
                  >
                    <span>{p.title}</span>
                    <span className="mega-recent-year text-meta text-muted">{p.year}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mega-cta">
              <Link href="/case-studies" onClick={onClose} className="mega-cta-link">
                <span>View the Library</span>
                <span className="mega-cta-arrow" aria-hidden="true">→</span>
              </Link>
              <p className="text-meta text-muted" style={{ marginTop: 8 }}>
                {projects.length} case stud{projects.length === 1 ? "y" : "ies"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mega-backdrop" />
    </div>
  );
}
