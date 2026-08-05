import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllJournalSlugs, getJournalPostBySlug, getJournalPosts } from "@/lib/data";
import JournalArticle from "@/components/journal/JournalArticle";
import JournalNextRead from "@/components/journal/JournalNextRead";
import SanityImg from "@/components/global/SanityImg";
import Button from "@/components/global/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllJournalSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.dek ?? post.excerpt,
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) notFound();

  // Next read: the entry after this one in the journal's order, wrapping to
  // the first so the last article never dead-ends without a next.
  const all = await getJournalPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const next = all.length > 1 && idx >= 0 ? all[(idx + 1) % all.length] : null;

  return (
    <>
      <section className="page-x pt-16">
        <Link
          href="/journal"
          className="coord nav-link-warm inline-block hover:text-ink transition-colors duration-300"
        >
          ← Journal
        </Link>
      </section>

      <JournalArticle post={post} />

      {/* Author + related project */}
      {(post.author || post.project) && (
        <section className="page-x py-12 border-t border-line">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {post.author && (
              <div className="flex items-center gap-4">
                {post.author.portrait && (
                  <div className="relative w-12 h-12 overflow-hidden rounded-full">
                    <SanityImg
                      image={post.author.portrait}
                      alt={post.author.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-meta" style={{ color: "var(--color-ink)" }}>
                    {post.author.name}
                  </p>
                  {post.author.role && <p className="text-meta">{post.author.role}</p>}
                </div>
              </div>
            )}
            {post.project && (
              <div>
                <p className="coord mb-3">From the library</p>
                <Link
                  href={`/case-studies/${post.project.slug}`}
                  className="group flex items-baseline gap-4 hover:text-warm-deep transition-colors duration-300"
                >
                  <span className="text-title">{post.project.title}</span>
                  <span className="text-meta text-muted group-hover:text-warm-deep transition-colors duration-300">
                    →
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {next && <JournalNextRead title={next.title} slug={next.slug} />}

      {/* CTA — the page should not dead-end after the story */}
      <section className="page-x section-y text-center border-t border-line">
        <div className="max-w-lg mx-auto">
          <h2 className="text-mode-title text-volume reveal mb-8">
            Tell us what you are building.
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            Start a project
          </Button>
        </div>
      </section>
    </>
  );
}
