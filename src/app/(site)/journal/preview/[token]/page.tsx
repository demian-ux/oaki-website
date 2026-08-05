import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJournalPostForPreview } from "@/lib/data";
import { previewLinks } from "@/lib/preview-links";
import JournalArticle from "@/components/journal/JournalArticle";

// Private client preview: unguessable token, renders unpublished posts,
// noindex. One article per link, or the whole set for a grouped review
// (the ICRAVE link shows Andrew all three on one page).

interface Props {
  params: Promise<{ token: string }>;
}

// Never prerendered, never in the sitemap; each request resolves live so a
// revoked token 404s immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const link = previewLinks[token];
  return {
    title: link ? `Private preview · ${link.label}` : "Not found",
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  };
}

export default async function JournalPreviewPage({ params }: Props) {
  const { token } = await params;
  const link = previewLinks[token];
  if (!link) notFound();

  const posts = (
    await Promise.all(link.slugs.map((slug) => getJournalPostForPreview(slug)))
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  if (posts.length === 0) notFound();

  return (
    <>
      <section className="page-x pt-10">
        <p className="text-meta border border-line inline-block px-4 py-2">
          Private preview. Not published, not indexed. Please do not share this
          link.
        </p>
      </section>

      {posts.map((post, i) => (
        <div key={post._id}>
          {i > 0 && <div className="page-x pt-16" />}
          {posts.length > 1 && (
            <section className="page-x pt-12">
              <p className="coord">
                {i + 1} / {posts.length}
              </p>
            </section>
          )}
          <JournalArticle post={post} />
        </div>
      ))}
    </>
  );
}
