import Image from "next/image";
import { urlFor } from "@/sanity/client";
import { type SanityImage } from "@/lib/types";
import { tabletSizes } from "@/lib/image-sizes";

interface SanityImgProps {
  image: SanityImage | null | undefined;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function SanityImg({
  image,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  priority,
  quality = 85,
  fallback = null,
  style,
}: SanityImgProps) {
  if (!image?.asset) return <>{fallback}</>;

  const src = urlFor(image).auto("format").quality(quality).url();

  if (fill) {
    return (
      <Image
        src={src}
        alt={image.alt ?? alt ?? ""}
        fill
        sizes={tabletSizes(sizes ?? "100vw")}
        className={className}
        priority={priority}
        placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image.asset.metadata?.lqip}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={image.alt ?? alt ?? ""}
      width={width ?? 1200}
      height={height ?? 800}
      sizes={tabletSizes(sizes)}
      className={className}
      style={style}
      priority={priority}
      quality={quality}
      placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
      blurDataURL={image.asset.metadata?.lqip}
    />
  );
}
