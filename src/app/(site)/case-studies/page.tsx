import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import CaseStudiesClient from "@/components/case-studies/CaseStudiesClient";
import SectionLabel from "@/components/global/SectionLabel";

export const metadata: Metadata = {
  title: "Project Books",
  description:
    "Each project, told as a complete visual story. From first sketch to final image sequence.",
};

export default async function CaseStudiesPage() {
  const projects = await getAllProjects();

  return (
    <>
      {/* Hero */}
      <section className="page-x pt-20 pb-14 border-b border-line">
        <SectionLabel className="mb-6">Library</SectionLabel>
        <h1 className="text-display-xl mb-6">Project Books</h1>
        <p className="text-editorial text-muted max-text">
          Each project, told as a complete visual story.
          From first sketch to final image sequence.
        </p>
      </section>

      {/* Filter + Grid */}
      <CaseStudiesClient projects={projects} />
    </>
  );
}
