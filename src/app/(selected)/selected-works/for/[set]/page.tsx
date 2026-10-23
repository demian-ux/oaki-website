import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SelectedLanding from "@/components/selected/SelectedLanding";
import { DEFAULT_SET_KEY, getSelectedSet, selectedSets } from "@/lib/selected-works";

// A client's selected-work landing: /selected-works/for/<key>. Same page
// as /selected-works with the set's own intro, order and chain. Unlisted,
// noindex (the layout), sent as a private link after a conversation.

interface Props {
  params: Promise<{ set: string }>;
}

export function generateStaticParams() {
  return selectedSets.filter((s) => s.key !== DEFAULT_SET_KEY).map((s) => ({ set: s.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { set: key } = await params;
  const set = getSelectedSet(key);
  if (!set || set.key === DEFAULT_SET_KEY) return {};
  return {
    title: set.title,
    description: `${set.slugs.length} projects. Stills and film for architects, interior designers and developers.`,
  };
}

export default async function SelectedSetPage({ params }: Props) {
  const { set: key } = await params;
  const set = getSelectedSet(key);
  if (!set || set.key === DEFAULT_SET_KEY) notFound();
  return <SelectedLanding set={set} />;
}
