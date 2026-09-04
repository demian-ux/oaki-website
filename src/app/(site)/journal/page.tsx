import type { Metadata } from "next";
import Link from "next/link";
import { getJournalPosts } from "@/lib/data";
import { formatJournalDate } from "@/lib/format";
import { getJournalLocalImages } from "@/lib/journal-images";
import JournalCover from "@/components/journal/JournalCover";
import PageHero from "@/components/global/PageHero";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Our work, after your meeting. Most renders retire when the pitch ends. These went on: awards, openings, front pages.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  const countLabel = `${String(posts.length).padStart(3, "0")} ${posts.length === 1 ? "entry" : "entries"}`;

  return (
    <>
      {/* Index hero — shared secondary-page design (PageHero). */}
      <PageHero
        title="Journal"
        lede="Most renders retire when the pitch ends. These went on: awards, openings, front pages."
        counter={posts.length > 0 ? countLabel : undefined}
      />

      {/* Article list — wide rows: thumb, meta + excerpt, arrow */}
      {posts.length === 0 ? (
        <section className="page-x section-y">
          <p className="text-lede text-muted">First entries are on their way.</p>
        </section>
      ) : (
        <section className="page-x pb-16 lg:pb-28">
          <div className="border-t-2 border-ink">
            {posts.map((post) => {
              // Thumbnail fallback chain, identical to the home slider:
              // Sanity cover → image-library hero → local mock path.
              const libHero = getJournalLocalImages(post.slug).hero;
              const libSrc = libHero
                ? [...libHero.webp].sort((a, b) => b.width - a.width)[0]?.src ?? ""
                : "";
              const thumbImg = libSrc || post.img;
              const hasCover = Boolean(post.coverImage?.asset || thumbImg);
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
                      img={thumbImg}
                      alt={post.title}
                      sizes="132px"
                    />
                  </div>
                )}
                <div>
                  <p className="coord mb-2.5">
                    {[post.category, formatJournalDate(post.date), `${post.readMins ?? 1} min`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {/* Title = the home slider's caption serif (.text-quote
                      treatment): SangBleu 300, mixed case, tight leading. */}
                  <h2
                    className="font-serif group-hover:text-warm-deep transition-colors duration-300"
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(1.125rem, 1.7vw, 1.5rem)",
                      lineHeight: 1.2,
                      letterSpacing: "-0.015em",
                      textTransform: "none",
                      textWrap: "balance",
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
                  className="justify-self-end transition-transform duration-300 group-hover:translate-x-1"
                  style={{
                    fontSize: "1.15rem",
                    color: "var(--color-warm-deep)",
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
