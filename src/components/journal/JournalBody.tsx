import type { PortableTextBlock } from "@portabletext/react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import SanityImg from "@/components/global/SanityImg";
import type { SanityImage } from "@/lib/types";

// Portable-text renderer for journal entries, mapped onto the Stria type
// registers: Neue Montreal body, Inktrap section headings, SangBleu reserved
// for the pull-quote (its sanctioned editorial home). Images render at their
// natural ratio — renders are never cropped.

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-body mb-6">{children}</p>,
    h2: ({ children }) => (
      <h2 className="text-mode-title text-volume reveal mt-16 mb-6">{children}</h2>
    ),
    h3: ({ children }) => <h3 className="text-title mt-12 mb-4">{children}</h3>,
    // The serif pull-quote band (Article design 04-B): centered SangBleu
    // between two hairlines, narrow measure. SangBleu's one sanctioned home.
    blockquote: ({ children }) => (
      <blockquote
        className="text-quote reveal my-16 py-10 text-center border-line"
        style={{
          borderTop: "1px solid var(--color-line)",
          borderBottom: "1px solid var(--color-line)",
          fontSize: "clamp(1.625rem, 3.6vw, 3rem)",
        }}
      >
        <span className="mx-auto block" style={{ maxWidth: "20ch" }}>
          {children}
        </span>
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="underline underline-offset-4 hover:text-warm-deep transition-colors duration-300"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const image = value as SanityImage;
      const dims = image.asset?.metadata?.dimensions;
      return (
        <figure className="my-12">
          <SanityImg
            image={image}
            width={dims?.width ?? 1600}
            height={dims?.height ?? 1000}
            sizes="(min-width: 1024px) 672px, 100vw"
            className="w-full h-auto"
          />
          {image.alt && (
            <figcaption className="text-meta mt-3">{image.alt}</figcaption>
          )}
        </figure>
      );
    },
  },
};

export default function JournalBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
