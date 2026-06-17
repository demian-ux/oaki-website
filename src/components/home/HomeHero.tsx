"use client";

import { useRef } from "react";
import Button from "@/components/global/Button";
import HeroBackdrop from "@/components/global/HeroBackdrop";
import IsoSpotlight from "@/components/global/IsoSpotlight";
import SanityImg from "@/components/global/SanityImg";
import { useHeroDarkWhileCovering } from "@/components/global/HeroTheme";
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
  const renderRef = useRef<HTMLDivElement>(null);

  const hasImage = !!image?.asset;
  const hasVideo = !!video?.asset?.url;
  const hasMedia = hasImage || hasVideo;

  // v3.0 Studio rule: a full-bleed render carries ONLY the navbar. Register
  // it so the header inverts (white chrome + scrim) while it's on screen.
  useHeroDarkWhileCovering(renderRef, hasMedia);

  // Poster: the hero image resized small so it paints instantly while the
  // video downloads.
  const posterUrl = hasImage
    ? urlFor(image!).width(1920).quality(75).auto("format").url()
    : undefined;

  // Eyebrow → headline → subtext → ocre rule → CTA. On a render this sits in
  // a SOLID BAND below the image; with no media it sits on paper. No
  // headline or body type ever touches the render.
  const copy = (
    <div className="max-w-4xl">
      <p className="coord mb-6">{label}</p>
      <h1 className="text-statement text-volume mb-8">{title}</h1>
      <p className="text-lede text-muted max-text mb-9">{subtext}</p>
      <span className="ocre-rule mb-9" />
      <div className="flex flex-wrap gap-4">
        <Button href={primaryCtaHref} variant="primary">
          {primaryCta}
        </Button>
      </div>
    </div>
  );

  // ── Studio hero with a render: clean full-bleed image (navbar only), copy
  //    in a solid band below. Pulled up under the fixed header with -mt. ──
  if (hasMedia) {
    return (
      <section className="-mt-16 lg:-mt-20">
        <div
          ref={renderRef}
          className="relative w-full h-[58vh] min-h-[420px] lg:h-[72vh] overflow-hidden bg-soft"
        >
          {hasVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={posterUrl}
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src={video!.asset!.url!}
                type={video!.asset!.mimeType ?? "video/mp4"}
              />
            </video>
          ) : (
            <SanityImg
              image={image}
              alt={image?.alt ?? title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          )}
        </div>
        <div className="bg-soft page-x pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-line">
          {copy}
        </div>
      </section>
    );
  }

  // ── No render: a clean text hero on paper. Still the Studio voice —
  //    type on a solid surface, mark quietly spotlighted to the right. ──
  return (
    <section
      ref={heroRef}
      className="page-x relative overflow-hidden pt-28 lg:pt-40 pb-20 lg:pb-28"
    >
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
      <div className="relative" style={{ zIndex: 2 }}>
        {copy}
      </div>
    </section>
  );
}
