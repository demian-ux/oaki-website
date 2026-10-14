"use client";

import { useEffect, useState } from "react";
import { type ContactPageData } from "@/lib/data";
import ContactForm from "@/components/contact/ContactForm";
import BookingPicker from "@/components/contact/BookingPicker";
import { FOCUS, INVERSE_MUTED, MOTION, OCRE_ON_NEGRO } from "@/components/contact/ui";

// Two ways in, chosen up front: a call on the calendar, or the written
// brief. Each opens its own block below. #book and #brief deep-link to a
// path (a CTA elsewhere can send people straight to the calendar).

type Path = "book" | "brief";

const PATHS: { id: Path; title: string; text: string }[] = [
  { id: "book", title: "Book a call", text: "Thirty minutes on video. Pick a time that suits you." },
  { id: "brief", title: "Send a brief", text: "Tell us about the project in writing. Files welcome." },
];

export default function ContactPaths({ config }: { config?: ContactPageData }) {
  const [path, setPath] = useState<Path | null>(null);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (h === "book" || h === "brief") setPath(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const choose = (p: Path) => {
    setPath(p);
    history.replaceState(null, "", `#${p}`);
  };

  return (
    <>
      {/* 2b "Split plate": two cells in one 1px negro frame. The chosen cell
          turns negro, the strongest signal in the system. */}
      <div
        className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border border-ink"
        role="tablist"
      >
        {PATHS.map((p, i) => {
          const active = path === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`path-${p.id}`}
              onClick={() => choose(p.id)}
              className={`text-left flex flex-col justify-end min-h-[180px] pt-7 px-6 pb-6 ${MOTION} ${FOCUS} ${
                i > 0 ? "border-t sm:border-t-0 sm:border-l border-ink" : ""
              } ${active ? "bg-ink" : "bg-paper"}`}
            >
              <span
                className={`flex items-baseline justify-between gap-4 text-[30px] font-light tracking-[-0.012em] ${MOTION} ${
                  active ? "text-paper" : "text-ink"
                }`}
              >
                <span>{p.title}</span>
                <span
                  aria-hidden
                  className={active ? undefined : "text-warm-deep"}
                  style={active ? { color: OCRE_ON_NEGRO } : undefined}
                >
                  {active ? "↓" : "→"}
                </span>
              </span>
              <span
                className={`mt-2.5 text-[14px] leading-[1.5] ${MOTION} ${active ? "" : "text-muted"}`}
                style={active ? { color: INVERSE_MUTED } : undefined}
              >
                {p.text}
              </span>
            </button>
          );
        })}
      </div>

      {path && (
        <div id={`path-${path}`} role="tabpanel" className="pt-14">
          {path === "book" ? <BookingPicker /> : <ContactForm config={config} />}
        </div>
      )}
    </>
  );
}
