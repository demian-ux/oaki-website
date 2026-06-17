"use client";

import { useRef } from "react";
import SanityImg from "@/components/global/SanityImg";
import { useHeroDarkWhileCovering } from "@/components/global/HeroTheme";
import type { SanityImage } from "@/lib/types";

/**
 * Case-study hero (v3.0 Case mode): a clean full-bleed render that carries
 * only the navbar. The ocre binding and title spread begin in the band
 * below. The render stays full-colour — never tinted into the palette.
 */
export default function CaseHero({
  image,
  alt,
}: {
  image?: SanityImage | null;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useHeroDarkWhileCovering(ref, true);

  return (
    <div
      ref={ref}
      className="-mt-16 lg:-mt-20 relative w-full h-[62vh] min-h-[440px] lg:h-[78vh] overflow-hidden bg-soft"
    >
      <SanityImg
        image={image}
        alt={alt}
        fill
        sizes="100vw"
        priority
        className="object-cover"
        fallback={<div className="w-full h-full bg-soft" />}
      />
    </div>
  );
}
