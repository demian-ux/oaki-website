import Link from "next/link";
import Image from "next/image";

// The "Next read" band from the Article design: a negro ground with the
// ghost isotipo in the corner (sphere grammar: ghost crop, opacity 0.12,
// max one per page), coord label in ocre, headline plus arrow. Public
// article pages only; private previews do not cross-link.

export default function JournalNextRead({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  return (
    <Link
      href={`/journal/${slug}`}
      className="group relative block overflow-hidden"
      style={{ background: "var(--color-negro)", color: "var(--color-gris)" }}
    >
      <Image
        src="/brand/oaki-isotipo-white.png"
        alt=""
        width={380}
        height={380}
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{ right: -110, top: -130, opacity: 0.12 }}
      />
      <div className="relative page-x py-16 lg:py-24">
        <p className="coord mb-4" style={{ color: "var(--color-warm)" }}>
          Next read
        </p>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2
            className="m-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 4.5vw, 3.75rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.01em",
              textTransform: "none",
              color: "var(--color-gris)",
              textWrap: "balance",
            }}
          >
            {title}
          </h2>
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-2"
            style={{
              fontFamily: "var(--font-display-volume)",
              fontWeight: 800,
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1,
              color: "var(--color-warm)",
            }}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
