import type { Metadata } from "next";
import SelectedLanding from "@/components/selected/SelectedLanding";
import { DEFAULT_SET_KEY, getSelectedSet } from "@/lib/selected-works";

// The default selected-work landing (the BDNY set). Client-specific sets
// render the same page at /selected-works/for/<key>.

const set = getSelectedSet(DEFAULT_SET_KEY)!;

export const metadata: Metadata = {
  title: "Selected work",
  description: `${set.slugs.length} projects. Stills and film for architects, interior designers and developers.`,
};

export default function SelectedWorksPage() {
  return <SelectedLanding set={set} />;
}
