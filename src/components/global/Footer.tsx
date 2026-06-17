import Link from "next/link";
import Image from "next/image";
import SectionLabel from "./SectionLabel";
import Logotipo from "./Logotipo";

const footerLinks = {
  studio: [
    { label: "Case Studies", href: "/case-studies" },
    { label: "Process", href: "/process" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com", external: true },
    { label: "LinkedIn", href: "https://linkedin.com", external: true },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper relative overflow-hidden">
      {/* Isotipo background motif */}
      <div
        className="pointer-events-none select-none absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4"
        aria-hidden="true"
      >
        <Image
          src="/brand/oaki-isotipo.png"
          alt=""
          width={480}
          height={480}
          style={{ opacity: 0.04 }}
        />
      </div>

      <div className="page-x py-16 lg:py-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="Oaki Studio, Home" className="inline-flex mb-5">
              <Logotipo style={{ fontSize: "clamp(26px, 2.6vw, 34px)" }} />
            </Link>
            <p className="text-meta text-muted max-w-xs">
              Stories for architecture that doesn&apos;t exist yet.
            </p>
          </div>

          {/* Studio links */}
          <div>
            <SectionLabel className="mb-4">Studio</SectionLabel>
            <nav className="flex flex-col gap-3" aria-label="Footer studio links">
              {footerLinks.studio.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-meta hover:text-ink transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social & Legal */}
          <div>
            <SectionLabel className="mb-4">Follow</SectionLabel>
            <nav className="flex flex-col gap-3 mb-8" aria-label="Footer social links">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-meta hover:text-ink transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <nav className="flex flex-col gap-3" aria-label="Footer legal links">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-meta hover:text-ink transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-line mt-12 pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p className="text-meta text-muted">
            © {year} Oaki Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
