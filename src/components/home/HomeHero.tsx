"use client";

import { useRef } from "react";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import Typewriter from "@/components/global/Typewriter";
import HeroBackdrop from "@/components/global/HeroBackdrop";
import IsoSpotlight from "@/components/global/IsoSpotlight";

interface HomeHeroProps {
  label: string;
  title: string;
  subtextLines: string[];
  primaryCta: string;
  secondaryCta: string;
}

export default function HomeHero({
  label,
  title,
  subtextLines,
  primaryCta,
  secondaryCta,
}: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={heroRef}
      className="page-x relative overflow-hidden pt-28 lg:pt-40 pb-20 lg:pb-32"
    >
      <HeroBackdrop parentRef={heroRef} />
      <IsoSpotlight
        parentRef={heroRef}
        position="top-right"
        size={220}
        offset={32}
        radius={120}
        zIndex={1}
      />

      <div className="max-w-3xl relative" style={{ zIndex: 2 }}>
        <SectionLabel className="mb-8">{label}</SectionLabel>
        <h1 className="text-display-xl mb-10">
          <Typewriter text={title} charDelay={26} startDelay={120} />
        </h1>
        <div className="mb-12 max-text flex flex-col gap-5">
          {subtextLines.map((line, i) => (
            <p key={i} className="text-editorial text-muted">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button href="/case-studies" variant="outline">
            {secondaryCta}
          </Button>
          <Button href="/contact" variant="primary">
            {primaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
