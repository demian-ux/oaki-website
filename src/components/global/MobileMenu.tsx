"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import Button from "./Button";

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-40 bg-paper flex flex-col transition-transform duration-400 lg:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="page-x flex flex-col h-full pt-6 pb-12 gap-12">
        {/* Logo at top */}
        <div className="h-16 flex items-center">
          <Link href="/" onClick={onClose} aria-label="Oaki Studio, Home">
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
          <Button href="/contact" variant="outline" onClick={onClose}>
            Begin the conversation
          </Button>
        </div>
      </div>
    </div>
  );
}
