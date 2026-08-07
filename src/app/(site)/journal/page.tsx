import type { Metadata } from "next";
import Link from "next/link";
import { getJournalPosts } from "@/lib/data";
import { formatJournalDate } from "@/lib/format";
import JournalCover from "@/components/journal/JournalCover";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes on light, material, and the work before the work. Written by the people making it.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  const years = posts
    .map((p) => (p.date ? new Date(p.date).getUTCFullYear() : NaN))
    .filter((y) => !Number.isNaN(y));
  const sinceYear = years.length > 0 ? Math.min(...years) : null;
  const countLabel = [
    `${String(posts.length).padStart(3, "0")} ${posts.length === 1 ? "entry" : "entries"}`,
    sinceYear !== null && `since ${sinceYear}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* Index hero — title + running count */}
      <section className="page-x pt-24 lg:pt-32 pb-10 lg:pb-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="coord" style={{ color: "var(--color-warm-deep)" }}>
            Journal
          </p>
          {posts.length > 0 && <p className="coord text-muted">{countLabel}</p>}
        </div>
        <h1
          className="text-volume reveal mt-4"
          style={{
            fontSize: "clamp(3rem, 10vw, 9.375rem)",
            lineHeight: 0.86,
          }}
        >
          Field notes
          <span className="dot" style={{ marginLeft: "-0.05em" }}>.</span>
        </h1>
        <p className="text-lede text-muted mt-8 lg:mt-10 max-w-[50ch]">
          Notes on light, material, and the work before the work, written by
          the people making it.
        </p>
      </section>

      {/* Article list — wide rows: thumb, meta + excerpt, arrow */}
      {posts.length === 0 ? (
        <section className="page-x section-y">
          <p className="text-lede text-muted">First entries are on their way.</p>
        </section>
      ) : (
        <section className="page-x pb-16 lg:pb-28">
          <div className="border-t-2 border-ink">
            {posts.map((post) => {
              const hasCover = Boolean(post.coverImage?.asset || post.img);
              return (
              <Link
                key={post._id}
                href={`/journal/${post.slug}`}
                className={`group grid ${
                  hasCover
                    ? "grid-cols-[96px_1fr_auto] sm:grid-cols-[132px_1fr_auto]"
                    : "grid-cols-[1fr_auto]"
                } gap-5 lg:gap-10 items-center py-6 lg:py-8 border-b border-line`}
              >
                {/* Renders display at natural ratio, scaled to the column — never cropped. */}
                {hasCover && (
                  <div className="transition-[filter] duration-300 group-hover:contrast-105">
                    <JournalCover
                      coverImage={post.coverImage}
                      img={post.img}
                      alt={post.title}
                      sizes="132px"
                    />
                  </div>
                )}
                <div>
                  <p
                    className="coord mb-2.5"
                    style={{ color: "var(--color-warm-deep)" }}
                  >
                    {[post.category, formatJournalDate(post.date), `${post.readMins ?? 1} min`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h2
                    className="group-hover:text-warm-deep transition-colors duration-300"
                    style={{
                      fontSize: "clamp(1.25rem, 2.6vw, 2.125rem)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.015em",
                      textTransform: "none",
                    }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm leading-relaxed text-muted mt-2.5 max-w-[56ch]">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <span
                  aria-hidden
                  className="justify-self-end"
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(1.25rem, 2vw, 1.875rem)",
                    color: "var(--color-warm)",
                  }}
                >
                  →
                </span>
              </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
