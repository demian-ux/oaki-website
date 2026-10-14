"use client";

import { useEffect, useState } from "react";
import { type ContactPageData } from "@/lib/data";
import ContactForm from "@/components/contact/ContactForm";
import BookingPicker from "@/components/contact/BookingPicker";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-line" role="tablist">
        {PATHS.map((p) => {
          const active = path === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`path-${p.id}`}
              onClick={() => choose(p.id)}
              className={`text-left py-8 sm:pr-8 border-b transition-colors duration-300 ${
                active ? "border-ink" : "border-line hover:border-muted"
              }`}
            >
              <span
                className={`text-body block mb-2 transition-colors duration-300 ${
                  active || !path ? "text-ink" : "text-muted"
                }`}
              >
                {p.title}
                <span className="ml-3 text-warm-deep" aria-hidden>
                  {active ? "↓" : "→"}
                </span>
              </span>
              <span className="text-meta text-muted block">{p.text}</span>
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
