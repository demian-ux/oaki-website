import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import { getCaseDraftCards } from "@/lib/case-drafts";
import { ponceCases } from "@/lib/ponce-cases";
import { HIDDEN_PROJECT_SLUGS } from "@/lib/hidden-projects";
import { applyTaxonomy, COLLECTIONS } from "@/lib/project-taxonomy";
import CaseStudiesClient from "@/components/case-studies/CaseStudiesClient";
import PageHero from "@/components/global/PageHero";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Each project, told as a complete visual story. From first sketch to final image sequence.",
};

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  // Deep link from the header mega menu: /case-studies?collection=Residential
  const { collection } = await searchParams;
  const initialCollection =
    collection && (COLLECTIONS as readonly string[]).includes(collection) ? collection : undefined;
  // Library = Sanity/placeholder projects + repo case studies (deduped by
  // slug, Sanity card wins) + the external Ponce-portfolio cases.
  const sanityProjects = await getAllProjects();
  const taken = new Set(sanityProjects.map((p) => p.slug));
  const draftCards = getCaseDraftCards().filter((p) => !taken.has(p.slug));
  const projects = [...sanityProjects, ...draftCards, ...ponceCases]
    .filter((p) => !HIDDEN_PROJECT_SLUGS.has(p.slug))
    .map(applyTaxonomy);

  return (
    <>
      {/* Hero */}
      <PageHero
        title="Case Studies"
        lede="Each project, told as a complete visual story. From first sketch to final image sequence."
        counter={`${projects.length} case studies`}
      />

      {/* Filter + Grid */}
      <CaseStudiesClient
        key={initialCollection ?? "all"}
        projects={projects}
        initialCollection={initialCollection}
      />
    </>
  );
}
