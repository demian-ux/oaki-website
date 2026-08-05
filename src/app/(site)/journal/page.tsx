import type { Metadata } from "next";
import Link from "next/link";
import { getJournalPosts } from "@/lib/data";
import { formatJournalDate } from "@/lib/format";
import JournalCover from "@/components/journal/JournalCover";
import StripeRule from "@/components/global/StripeRule";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Notes on light, material, and the thinking behind the work. Written by the people making it.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <>
      {/* Hero */}
      <section className="page-x pt-20 pb-14 border-b border-line">
        <p className="coord mb-6">Journal</p>
        <h1 className="text-statement text-volume reveal mb-6">
          What the render doesn&rsquo;t show
        </h1>
        <StripeRule className="mb-8" />
        <p className="text-lede text-muted max-text">
          Notes on light, material, and the thinking behind the work. Written
          by the people making it.
        </p>
      </section>

      {/* Entries */}
      {posts.length === 0 ? (
        <section className="page-x section-y">
          <p className="text-lede text-muted">First entries are on their way.</p>
        </section>
      ) : (
        <section className="page-x py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-20">
            {posts.map((post, i) => (
              <article key={post._id}>
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="mb-6">
                    <JournalCover
                      coverImage={post.coverImage}
                      img={post.img}
                      alt={post.title}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      priority={i < 2}
                    />
                  </div>
                  {post.category && (
                    <span className="tag-negro">{post.category}</span>
                  )}
                  <h2
                    className="font-serif mt-4 mb-3 group-hover:text-warm-deep transition-colors duration-300"
                    style={{
                      fontWeight: 300,
                      fontSize: "clamp(1.375rem, 2.2vw, 1.875rem)",
                      lineHeight: 1.2,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-lede text-muted mb-4 max-w-xl">{post.excerpt}</p>
                  )}
                  <p className="text-meta">
                    {[formatJournalDate(post.date), `${post.readMins ?? 1} min read`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
