"use client";

import { useRef } from "react";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import Typewriter from "@/components/global/Typewriter";
import HeroBackdrop from "@/components/global/HeroBackdrop";
import IsoSpotlight from "@/components/global/IsoSpotlight";
import SanityImg from "@/components/global/SanityImg";
import { urlFor } from "@/sanity/client";
import type { SanityImage } from "@/lib/types";

interface HomeHeroProps {
  label: string;
  title: string;
  subtext: string;
  primaryCta: string;
  primaryCtaHref?: string;
  image?: SanityImage | null;
  video?: {
    asset?: { url?: string; mimeType?: string } | null;
  } | null;
}

export default function HomeHero({
  label,
  title,
  subtext,
  primaryCta,
  primaryCtaHref = "/contact",
  image,
  video,
}: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const hasImage = !!image?.asset;
  const hasVideo = !!video?.asset?.url;
  const hasMedia = hasImage || hasVideo;

  // Resolve a poster URL for the video element. We use the hero image
  // resized to ~1920w as a JPEG so it ships small and shows instantly
  // while the video downloads. If there's no image, no poster — the
  // video will still load, just without an instant first paint.
  const posterUrl = hasImage
    ? urlFor(image!).width(1920).quality(75).auto("format").url()
    : undefined;

  return (
    <section
      ref={heroRef}
      className={`page-x relative overflow-hidden ${
        hasMedia
          ? "min-h-[80vh] flex items-end pb-20 lg:pb-28 pt-32 lg:pt-48"
          : "pt-28 lg:pt-40 pb-20 lg:pb-32"
      }`}
    >
      {/* Media layer: video (with poster) > image-only > text-only */}
      {hasVideo && (
        <video
          // Decorative — no controls, no audio.
          autoPlay
          muted
          loop
          playsInline
          // Aggressive preload because this IS the page above the fold.
          // The encoded file should be small (<5MB); see schema description.
          preload="auto"
          poster={posterUrl}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source
            src={video!.asset!.url!}
            type={video!.asset!.mimeType ?? "video/mp4"}
          />
        </video>
      )}

      {!hasVideo && hasImage && (
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
      )}

      {/* Protection gradient — applies to either media path so copy stays
          legible against bright frames. Stronger at the bottom where the
          copy sits. */}
      {hasMedia && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background:
              "linear-gradient(180deg, rgba(34,34,34,0) 0%, rgba(34,34,34,0) 40%, rgba(34,34,34,0.55) 100%)",
          }}
        />
      )}

      {/* Text-only treatment: animated backdrop + spotlighted isotipo.
          Both quieted to 30% opacity so they support rather than compete. */}
      {!hasMedia && (
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
        className={`max-w-3xl relative ${hasMedia ? "text-paper" : "text-ink"}`}
        style={{ zIndex: 2 }}
      >
        <SectionLabel
          className="mb-8"
          tone={hasMedia ? "ink" : "muted"}
          style={hasMedia ? { color: "rgba(255,255,255,0.85)" } : undefined}
        >
          {label}
        </SectionLabel>
        <h1
          className="text-display-xl mb-10"
          style={hasMedia ? { color: "var(--color-paper)" } : undefined}
        >
          <Typewriter text={title} charDelay={26} startDelay={120} />
        </h1>
        <p
          className="text-editorial mb-12 max-text"
          style={{
            // Sit just below the 18px logo-matched title so the hero
            // hierarchy reads title → subtext, not the reverse.
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            color: hasMedia ? "rgba(255,255,255,0.85)" : "var(--color-muted)",
          }}
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
