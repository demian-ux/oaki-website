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

      {/* Review header — internal: the argument, flags, and open gaps.
          This block is for Demi's review and is removed when the case
          study graduates to its public page. */}
      {(draft.argument || draft.flags.length > 0 || draft.gaps.length > 0) && (
        <section className="page-x pt-8">
          <div
            className="mx-auto px-5 py-4"
            style={{ maxWidth: 820, border: "1px solid var(--color-line)", background: "var(--color-soft)" }}
          >
            {draft.argument && (
              <>
                <p className="coord mb-2">The argument</p>
                <p className="text-meta mb-4" style={{ color: "var(--color-ink)" }}>
                  {draft.argument}
                </p>
              </>
            )}
            {draft.flags.length > 0 && (
              <>
                <p className="coord mb-2" style={{ color: "var(--color-error)" }}>
                  Flags
                </p>
                <ul className="mb-4" style={{ margin: 0, paddingLeft: "1rem" }}>
                  {draft.flags.map((f, i) => (
                    <li key={i} className="text-meta mb-1">
                      {f}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {draft.gaps.length > 0 && (
              <>
                <p className="coord mb-2" style={{ color: "var(--color-warm-deep)" }}>
                  Open gaps
                </p>
                <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                  {draft.gaps.map((g, i) => (
                    <li key={i} className="text-meta mb-1">
                      {g}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      <CaseDraftView draft={draft} showGaps />
    </>
  );
}
