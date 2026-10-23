"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import Button from "./Button";
import { getLenis } from "./SmoothScroll";

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

  return (
    // inert: while closed (off-screen) nothing inside it can take a tap or a
    // focus; overscroll-contain: a short panel never chains a swipe to the page.
    <div
      className={`fixed inset-0 z-40 bg-paper flex flex-col overflow-y-auto overscroll-contain transition-transform duration-400 lg:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className="page-x flex flex-col min-h-full gap-12"
        style={{
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          // the CTA stays above the iPhone home indicator
          paddingBottom: "max(3rem, env(safe-area-inset-bottom) + 1.5rem)",
        }}
      >
        {/* Logo at top */}
        <div className="h-16 flex items-center">
          <Link href={homeHref} onClick={onClose} aria-label="Oaki Studio, Home">
            <Image
              src="/brand/oaki-logotipo.png"
              alt="Oaki Studio"
              width={150}
              height={32}
              style={{ width: "clamp(120px, 30vw, 150px)", height: "auto" }}
            />
          </Link>
        </div>

        <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-title text-ink hover:text-warm-deep transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <Button href={ctaHref} variant="outline" onClick={onClose}>
            Start a project
          </Button>
        </div>
      </div>
    </div>
  );
}
