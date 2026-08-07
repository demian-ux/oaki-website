import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { getCaseDraftCards } from "@/lib/case-drafts";
import { ponceCases } from "@/lib/ponce-cases";
import CaseStudiesClient from "@/components/case-studies/CaseStudiesClient";
import StripeRule from "@/components/global/StripeRule";

export const metadata: Metadata = {
  title: "Project Books",
  description:
    "Each project, told as a complete visual story. From first sketch to final image sequence.",
};

export default async function CaseStudiesPage() {
  // Library = Sanity/placeholder projects + repo case studies (deduped by
  // slug, Sanity card wins) + the external Ponce-portfolio cases.
  const sanityProjects = await getAllProjects();
  const taken = new Set(sanityProjects.map((p) => p.slug));
  const draftCards = getCaseDraftCards().filter((p) => !taken.has(p.slug));
  const projects = [...sanityProjects, ...draftCards, ...ponceCases];

  return (
    <>
      {/* Hero */}
      <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
        <p className="coord mb-6">Library</p>
        <h1 className="text-statement text-volume reveal mb-6">Project Books</h1>
        <StripeRule className="mb-8" />
        <p className="text-lede text-muted max-text">
          Each project, told as a complete visual story.
          From first sketch to final image sequence.
        </p>
      </section>

      {/* Filter + Grid */}
      <CaseStudiesClient projects={projects} />
    </>
  );
}
