"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EmailLink.module.css";

const EMAIL = "info@oaki.studio";

// Compose deeplinks per provider. The visitor can't be sniffed, so we let them
// pick: Gmail and Outlook (365) open a pre-addressed web compose window; the
// mail-app option falls back to their OS default handler.
const providers: { label: string; href: string; external?: boolean }[] = [
  {
    label: "Gmail",
    href: `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}`,
    external: true,
  },
  {
    label: "Outlook",
    href: `https://outlook.office.com/mail/deeplink/compose?to=${EMAIL}`,
    external: true,
  },
  { label: "Mail app", href: `mailto:${EMAIL}` },
];

export default function EmailLink({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the provider links still work */
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {EMAIL}
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label="Open email in">
          {providers.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target={p.external ? "_blank" : undefined}
              rel={p.external ? "noopener noreferrer" : undefined}
              className={styles.item}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {p.label}
            </a>
          ))}
          <button
            type="button"
            className={styles.item}
            role="menuitem"
            onClick={copy}
          >
            {copied ? "Copied" : "Copy address"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
