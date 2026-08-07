import Image from "next/image";
import SanityImg from "@/components/global/SanityImg";
import type { SanityImage } from "@/lib/types";

interface JournalCoverProps {
  coverImage?: SanityImage | null;
  /** Local /public path fallback for mock entries. */
  img?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Journal covers are renders: they display at their natural aspect ratio,
// re-scaled to the column, never cropped (no object-fit cover, no aspect
// boxes). Sanity covers use their real dimensions from asset metadata.
export default function JournalCover({
  coverImage,
  img,
  alt,
  sizes,
  priority,
  className,
  style,
}: JournalCoverProps) {
  const sizeClass = style ? "h-auto" : "w-full h-auto";
  if (coverImage?.asset) {
    const dims = coverImage.asset.metadata?.dimensions;
    return (
      <SanityImg
        image={coverImage}
        alt={alt}
        width={dims?.width ?? 1600}
        height={dims?.height ?? 1000}
        sizes={sizes}
        priority={priority}
        className={`${sizeClass} ${className ?? ""}`}
        style={style}
      />
    );
  }
  if (img) {
    return (
      <Image
        src={img}
        alt={alt}
        width={1600}
        height={1000}
        sizes={sizes}
        priority={priority}
        className={`${sizeClass} ${className ?? ""}`}
        style={style}
      />
    );
  }
  return null;
}
