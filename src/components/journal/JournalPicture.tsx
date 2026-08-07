import type { JournalImage } from "@/lib/journal-images";

// Renders a pipeline-generated journal image as <picture>: AVIF primary,
// WebP fallback, srcset across the generated widths so the browser picks
// the size. Natural ratio always — renders are re-scaled, never cropped.

interface JournalPictureProps {
  image: JournalImage;
  alt: string;
  /** e.g. "(min-width: 1280px) 1200px, 100vw" */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Cap the image to the viewport (max-height 82vh, natural ratio, centered)
   *  so tall frames keep air around them instead of overflowing the screen. */
  contain?: boolean;
}

const srcSet = (sources: { src: string; width: number }[]) =>
  sources.map((s) => `${s.src} ${s.width}w`).join(", ");

export default function JournalPicture({
  image,
  alt,
  sizes,
  priority,
  className,
  contain,
}: JournalPictureProps) {
  const largestWebp = image.webp[0];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.webp)} sizes={sizes} />
      <img
        src={largestWebp.src}
        alt={alt}
        width={image.naturalWidth}
        height={image.naturalHeight}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={`${contain ? "h-auto" : "w-full h-auto"} ${className ?? ""}`}
        style={
          contain
            ? { width: "auto", maxWidth: "100%", maxHeight: "82vh", marginInline: "auto", display: "block" }
            : undefined
        }
      />
    </picture>
  );
}
