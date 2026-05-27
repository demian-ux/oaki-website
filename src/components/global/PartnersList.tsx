"use client";

import { useEffect, useRef } from "react";

export interface Partner {
  name: string;
  meta: string;
}

interface PartnersListProps {
  partners: Partner[];
}

export default function PartnersList({ partners }: PartnersListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let revealed = false;
    const reveal = () => {
      if (revealed || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      if (r.top < window.innerHeight - 80) {
        revealed = true;
        ref.current.classList.add("partners-in");
        cleanup();
      }
    };
    const interval = setInterval(reveal, 100);
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("wheel", reveal, { passive: true });
    window.addEventListener("touchmove", reveal, { passive: true });
    function cleanup() {
      clearInterval(interval);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("wheel", reveal);
      window.removeEventListener("touchmove", reveal);
    }
    reveal();
    return cleanup;
  }, [partners.length]);

  return (
    <div ref={ref}>
      {partners.map((p, i) => (
        <div className="partner-row" key={p.name}>
          <span className="partner-num">
            <span style={{ ["--i" as string]: i } as React.CSSProperties}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </span>
          <span className="partner-name">
            <span style={{ ["--i" as string]: i } as React.CSSProperties}>{p.name}</span>
          </span>
          <span className="partner-meta">
            <span style={{ ["--i" as string]: i } as React.CSSProperties}>{p.meta}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
