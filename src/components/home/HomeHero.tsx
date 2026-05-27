"use client";

import { useRef } from "react";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import Typewriter from "@/components/global/Typewriter";
import HeroBackdrop from "@/components/global/HeroBackdrop";
import IsoSpotlight from "@/components/global/IsoSpotlight";
import SanityImg from "@/components/global/SanityImg";
import type { SanityImage } from "@/lib/types";

interface HomeHeroProps {
  label: string;
  title: string;
  subtext: string;
  primaryCta: string;
  primaryCtaHref?: string;
  image?: SanityImage | null;
}

export default function HomeHero({
  label,
  title,
  subtext,
  primaryCta,
  primaryCtaHref = "/contact",
  image,
}: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const hasImage = !!image?.asset;

  return (
    <section
      ref={heroRef}
      className={`page-x relative overflow-hidden ${
        hasImage
          ? "min-h-[80vh] flex items-end pb-20 lg:pb-28 pt-32 lg:pt-48"
          : "pt-28 lg:pt-40 pb-20 lg:pb-32"
      }`}
    >
      {/* Full-bleed image with top-down protection gradient.
          Renders only when a hero image is set in Sanity. */}
      {hasImage && (
        <>
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <SanityImg
              image={image}
              alt={image?.alt ?? title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
          {/* Protection gradient — bottom dark for copy legibility */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background:
                "linear-gradient(180deg, rgba(34,34,34,0) 0%, rgba(34,34,34,0) 40%, rgba(34,34,34,0.55) 100%)",
            }}
          />
        </>
      )}

      {/* Text-only treatment: animated backdrop + spotlighted isotipo.
          Both quieted to 30% opacity so they support rather than compete. */}
      {!hasImage && (
        <>
          <div style={{ opacity: 0.3 }}>
            <HeroBackdrop parentRef={heroRef} />
          </div>
          <IsoSpotlight
            parentRef={heroRef}
            position="top-right"
            size={220}
            offset={32}
            radius={120}
            zIndex={1}
          />
        </>
      )}

      {/* Hero copy stack */}
      <div
        className={`max-w-3xl relative ${hasImage ? "text-paper" : "text-ink"}`}
        style={{ zIndex: 2 }}
      >
        <SectionLabel
          className="mb-8"
          tone={hasImage ? "ink" : "muted"}
          style={hasImage ? { color: "rgba(255,255,255,0.85)" } : undefined}
        >
          {label}
        </SectionLabel>
        <h1
          className="text-display-xl mb-10"
          style={hasImage ? { color: "var(--color-paper)" } : undefined}
        >
          <Typewriter text={title} charDelay={26} startDelay={120} />
        </h1>
        <p
          className="text-editorial mb-12 max-text"
          style={
            hasImage
              ? { color: "rgba(255,255,255,0.85)" }
              : { color: "var(--color-muted)" }
          }
        >
          {subtext}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href={primaryCtaHref} variant="primary">
            {primaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
