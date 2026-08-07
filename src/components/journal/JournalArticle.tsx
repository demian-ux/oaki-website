import type { JournalPost } from "@/lib/types";
import { formatJournalDate } from "@/lib/format";
import { getJournalLocalImages } from "@/lib/journal-images";
import JournalBody from "@/components/journal/JournalBody";
import JournalCover from "@/components/journal/JournalCover";
import JournalPicture from "@/components/journal/JournalPicture";

// The journal article, to the Article design (claude.ai/design · Article.dc):
// coord meta line, calm Plain headline with the ocre period, dek, full-bleed
// hero with a negro figure tag, single centered measure, byline baseline.
// Shared by the public /journal/[slug] page and the private preview routes
// so the client sees the real page.
// Hero preference: pipeline-generated local image (journal-images/) →
// Sanity cover → labeled placeholder slot. Renders are never cropped.

const MEASURE = 820;

// The headline's ocre period, optically seated (STRIA 4.2/T2). Titles that
// already end in "." get the plain dot swapped for the ocre one; titles
// ending in other punctuation (?, !) are left alone.
function splitTitle(title: string): { text: string; dot: boolean } {
  const trimmed = title.trim();
  if (/[?!…]$/.test(trimmed)) return { text: trimmed, dot: false };
  return { text: trimmed.replace(/\.$/, ""), dot: true };
}

export default async function JournalArticle({ post }: { post: JournalPost }) {
  const local = getJournalLocalImages(post.slug);
  const metaLine = [
    post.category,
    formatJournalDate(post.date),
    `${post.readMins ?? 1} min read`,
  ]
    .filter(Boolean)
    .join(" · ");

  const hasHero = Boolean(local.hero || post.coverImage?.asset || post.img);
  const { text: titleText, dot: titleDot } = splitTitle(post.title);
  let fig = 1;

  return (
    <article>
      {/* Masthead — coord line, calm headline with the ocre period, dek */}
      <section className="page-x pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="mx-auto" style={{ maxWidth: MEASURE }}>
          <p className="coord reveal mb-8">{metaLine}</p>
          <h1 className="text-article-title reveal">
            {titleText}
            {titleDot && (
              <span aria-hidden className="dot" style={{ marginLeft: "-0.05em" }}>
                .
              </span>
            )}
          </h1>
          {post.dek && (
            <p
              className="text-lede text-muted mt-8"
              style={{ maxWidth: "52ch" }}
            >
              {post.dek}
            </p>
          )}
        </div>
      </section>

      {/* Hero — natural ratio, never cropped, capped to the viewport and
          centered with air around it (Mir-style, replaces the full bleed).
          While the render is pending, a labeled slot holds its place so the
          review page reads complete. */}
      <section className="page-x pt-4 lg:pt-8">
        {local.hero || hasHero ? (
          <div className="relative w-fit max-w-full mx-auto">
            {local.hero ? (
              <JournalPicture
                image={local.hero}
                alt={post.title}
                sizes="(min-width: 1536px) 1400px, 100vw"
                priority
                contain
              />
            ) : (
              <JournalCover
                coverImage={post.coverImage}
                img={post.img}
                alt={post.coverImage?.alt ?? post.title}
                sizes="(min-width: 1536px) 1400px, 100vw"
                priority
                className="mx-auto"
                style={{ width: "auto", maxWidth: "100%", maxHeight: "82vh" }}
              />
            )}
            <span className="tag-negro absolute bottom-0 left-0">
              Fig. {String(fig++).padStart(2, "0")}
              {post.coverImage?.alt ? ` · ${post.coverImage.alt}` : ""}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center justify-center border border-line"
            style={{ aspectRatio: "3 / 2", background: "var(--color-gris)" }}
          >
            <p className="text-meta text-muted max-w-md text-center px-6">
              Hero image to come{post.heroNote ? `: ${post.heroNote}` : ""}
            </p>
          </div>
        )}
      </section>

      {/* Body — single centered measure */}
      {post.body && post.body.length > 0 && (
        <section className="page-x py-16 lg:py-24">
          <div className="mx-auto" style={{ maxWidth: MEASURE }}>
            <JournalBody value={post.body} />
          </div>
        </section>
      )}

      {/* Support images — up to 3, after the body. A pair reads as the
          two-figure compare; a single or triple stacks. Framed plates with
          negro figure tags, natural ratio always. */}
      {local.supports.length > 0 && (
        <section className="page-x pb-16 lg:pb-24">
          <div
            className={
              local.supports.length === 2
                ? "mx-auto grid grid-cols-1 sm:grid-cols-2 items-center gap-8 lg:gap-12"
                : "mx-auto flex flex-col gap-16 lg:gap-24"
            }
            style={{ maxWidth: 1100 }}
          >
            {local.supports.map((img) => (
              <div key={img.name} className="relative frame-plate w-fit max-w-full mx-auto">
                <JournalPicture
                  image={img}
                  alt={post.title}
                  sizes={
                    local.supports.length === 2
                      ? "(min-width: 640px) 550px, 100vw"
                      : "(min-width: 1280px) 1100px, 100vw"
                  }
                  contain
                />
                <span className="tag-negro absolute left-0 bottom-0">
                  Fig. {String(fig++).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Byline — the 2px negro baseline: author left, coord date right */}
      {post.author && (
        <section className="page-x pb-16 lg:pb-24">
          <div
            className="mx-auto baseline-rule flex flex-wrap justify-between items-baseline gap-4 pt-4"
            style={{ maxWidth: MEASURE }}
          >
            <span className="text-body" style={{ fontWeight: 500, fontSize: "0.9375rem" }}>
              {post.author.name}
              {post.author.role ? ` · ${post.author.role}` : ""}
            </span>
            <span className="coord" style={{ color: "var(--color-muted)" }}>
              {formatJournalDate(post.date)}
            </span>
          </div>
        </section>
      )}

      {/* Credit block — fixed format, rendered in order */}
      {post.credits && post.credits.length > 0 && (
        <section className="page-x py-12 border-t border-line">
          <div className="mx-auto" style={{ maxWidth: MEASURE }}>
            <dl>
              {post.credits.map((c) => (
                <div
                  key={c._key ?? c.label}
                  className="flex flex-col sm:flex-row sm:gap-6 py-2 border-b border-line last:border-b-0"
                >
                  <dt className="text-meta sm:w-48 shrink-0">{c.label}</dt>
                  <dd className="text-body">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Source line */}
      {post.sourceLinks && post.sourceLinks.length > 0 && (
        <section className="page-x pb-12">
          <p className="text-meta mx-auto" style={{ maxWidth: MEASURE }}>
            Source:{" "}
            {post.sourceLinks.map((s, i) => (
              <span key={s._key ?? s.url}>
                {i > 0 && " · "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-warm-deep transition-colors duration-300"
                >
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </section>
      )}
    </article>
  );
}
