import type { Metadata } from "next";
import { getAllProjects } from "@/lib/data";
import CaseStudiesClient from "@/components/case-studies/CaseStudiesClient";

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
        <p className="coord mb-6">Library</p>
        <h1 className="text-statement text-volume mb-6">Project Books</h1>
        <div className="stripe-rule mb-8" aria-hidden="true" />
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
