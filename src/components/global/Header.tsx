"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import MobileMenu from "./MobileMenu";
import SectionLabel from "./SectionLabel";
import Logotipo from "./Logotipo";
import CopyEmail from "./CopyEmail";
import SanityImg from "./SanityImg";
import { useHeroTheme } from "./HeroTheme";
import type { Project } from "@/lib/types";

interface HeaderProps {
  projects?: Project[];
  ctaLabel?: string;
  navLabels?: {
    caseStudies?: string;
    process?: string;
    about?: string;
    contact?: string;
  };
}

export default function Header({ projects = [], navLabels }: HeaderProps) {
  // The three sections — same set the home hero presents (§02). The nav bar
  // emerges from that masthead, so it carries the same items + mono voice.
  const navLinks = [
    { label: navLabels?.caseStudies ?? "Case Studies", href: "/case-studies" },
    { label: navLabels?.process ?? "Process", href: "/process" },
    { label: navLabels?.about ?? "About", href: "/about" },
    { label: navLabels?.contact ?? "Contact", href: "/contact" },
  ];
  const mobileLinks = navLinks;

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reveal the nav only once the hero section is fully scrolled past.
    // Query the hero on every check instead of capturing it once: with
    // streamed server components the header can mount before the hero exists
    // in the DOM, and a one-time null lookup would show the nav forever.
    // A missing hero counts as "not past it" — hideForHero only applies on
    // the home page, so inner pages still show the nav regardless.
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 32);
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setPastHero(hero ? y >= hero.getBoundingClientRect().bottom + y : false);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    startTransition(() => {
      setMenuOpen(false);
      setMegaOpen(false);
    });
  }, [pathname]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const { overHeroDark } = useHeroTheme();
  const isHome = pathname === "/";
  // overHeroDark is live: the hero reports it true only while its render
  // still sits under the navbar. Invert there; everywhere else, the subtle
  // glass bar (at rest on inner pages, on scroll on home).
  const inverted = overHeroDark && !megaOpen;
  const glass = !inverted && (scrolled || !isHome || megaOpen);
  // The home hero owns the top chrome (its own INFO / oaki. / CONTACT bar),
  // so the site header stays hidden until you scroll past the hero.
  const hideForHero = isHome && !pastHero && !megaOpen;

  return (
    <>
      <header
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
          <Link href="/" aria-label="Oaki Studio, Home" className="inline-flex items-center">
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
