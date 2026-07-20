"use client";

import { useState } from "react";

/**
 * Quick-copy email for the nav bar. Unlike the footer's provider chooser, a
 * single click just copies the address to the clipboard and flashes "Copied"
 * in place — no menu. The two labels are grid-stacked so the swap never shifts
 * the surrounding nav items.
 */
export default function CopyEmail({
  email = "info@oaki.studio",
  className = "",
}: {
  email?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — nothing to fall back to for a copy action */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={className}
      aria-label={copied ? "Email address copied" : `Copy email address ${email}`}
      style={{ display: "inline-grid" }}
    >
      <span
        style={{
          gridArea: "1 / 1",
          opacity: copied ? 0 : 1,
          transition: "opacity 150ms var(--motion-ease, ease)",
        }}
      >
        {email}
      </span>
      <span
        aria-hidden
        style={{
          gridArea: "1 / 1",
          opacity: copied ? 1 : 0,
          transition: "opacity 150ms var(--motion-ease, ease)",
        }}
      >
        Copied
      </span>
    </button>
  );
}
