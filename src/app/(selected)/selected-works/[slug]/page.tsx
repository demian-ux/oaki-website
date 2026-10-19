import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseDraft } from "@/lib/case-drafts";
import {
  SELECTED_BASE,
  SELECTED_CONTACT,
  getNextSelectedWork,
  getSelectedWork,
  selectedWorkSlugs,
} from "@/lib/selected-works";
import CaseEditorialView from "@/components/case-studies/CaseEditorial";

// A selected case: the editorial template (content/cases/<slug>.md), with
// the set's own next-project chain and every link kept inside
// /selected-works. Cases hidden from the public site render here.

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return selectedWorkSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = getSelectedWork(slug);
  const draft = work ? getCaseDraft(slug) : null;
  if (!work || !draft) return {};
  return { title: draft.title, description: draft.description ?? draft.subtitle };
}

export default async function SelectedCasePage({ params }: Props) {
  const { slug } = await params;
  const work = getSelectedWork(slug);
  if (!work) notFound();
  const draft = getCaseDraft(slug);
  if (!draft?.editorial) notFound();

  return (
    <CaseEditorialView
      draft={draft}
      caseBase={SELECTED_BASE}
      contactHref={SELECTED_CONTACT}
      next={getNextSelectedWork(slug)}
    />
  );
}
