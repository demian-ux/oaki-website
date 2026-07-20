import Link from "next/link";
import EmailLink from "./EmailLink";

// The real site links (not the placeholder labels from the design mock).
const navLinks = [
  { label: "Case Studies", href: "/case-studies" },
  { label: "Process", href: "/process" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/oaki.studio" },
  { label: "LinkedIn", href: "https://linkedin.com/company/oaki-studio" },
];

const linkClass =
  "coord nav-link-warm hover:text-ink transition-colors duration-300";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-mega bg-paper">
      <div className="page-x pt-20 lg:pt-28">
        {/* Link row — nav on the left, contact on the right */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <nav
            className="flex flex-wrap gap-x-8 gap-y-4"
            aria-label="Footer navigation"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            className="flex flex-wrap items-center gap-x-8 gap-y-4"
            aria-label="Footer contact"
          >
            <EmailLink className={linkClass} />
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Meta row */}
        <div className="mt-8 pt-6 border-t border-line flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-meta">© Oaki.Studio {year}</p>
          <p className="text-meta">Buenos Aires · AR</p>
        </div>
      </div>

      {/* The full-bleed word mark — sized to fit, never clipped */}
      <div className="footer-wordmark" aria-hidden="true">
        <span className="logotipo">
          oaki<span className="dot">.</span>
        </span>
      </div>
    </footer>
  );
}
