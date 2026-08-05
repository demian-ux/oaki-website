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
}

const srcSet = (sources: { src: string; width: number }[]) =>
  sources.map((s) => `${s.src} ${s.width}w`).join(", ");

export default function JournalPicture({
  image,
  alt,
  sizes,
  priority,
  className,
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
        className={`w-full h-auto ${className ?? ""}`}
      />
    </picture>
  );
}
