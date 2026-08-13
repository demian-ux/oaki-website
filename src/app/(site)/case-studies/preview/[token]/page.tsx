import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseDraft } from "@/lib/case-drafts";
import { casePreviewLinks } from "@/lib/case-preview-links";
import CaseDraftView from "@/components/case-studies/CaseDraft";

// Private case-study draft preview: unguessable token, repo-only content,
// noindex. Demi reviews the prose here; client-facing sharing only after
// approval (Esther sees hers before anything goes live). Mirrors the
// journal preview rules exactly.

interface Props {
  params: Promise<{ token: string }>;
}

// Never prerendered, never in the sitemap; each request resolves live so a
// revoked token 404s immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const link = casePreviewLinks[token];
  return {
    title: link ? `Private draft · ${link.label}` : "Not found",
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  };
}

export default async function CasePreviewPage({ params }: Props) {
  const { token } = await params;
  const link = casePreviewLinks[token];
  if (!link) notFound();

  const draft = getCaseDraft(link.slug);
  if (!draft) notFound();

  return (
    <>
      <section className="page-x pt-10">
        <p className="text-meta border border-line inline-block px-4 py-2">
          Private draft for review. Not published, not indexed. Please do not
          share this link.
        </p>
      </section>

      {/* The internal review header (argument / flags / gaps) used to render
          here; removed 2026-08-13 — these token links are now shared with
          clients, so the preview shows the page as it will publish. */}
      <CaseDraftView draft={draft} showGaps />
    </>
  );
}
