import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectSlugs, getAllProjects, getProjectBySlug, getNextProject } from "@/lib/data";
import PhaseSection from "@/components/case-studies/PhaseSection";
import SanityImg from "@/components/global/SanityImg";
import SectionLabel from "@/components/global/SectionLabel";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.subtitle,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getAllProjects(),
  ]);

  if (!project) notFound();

  const nextProject = getNextProject(slug, allProjects);

  const displayClient =
    project.clientVisibility === "Public"
      ? project.clientName
      : project.clientVisibility === "Undisclosed"
      ? "Undisclosed"
      : null;

  return (
    <>
      {/* Cover */}
      <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] lg:gap-16">
          {/* Left column: collection / title / subtitle */}
          <div>
            <SectionLabel className="mb-8">{project.collectionLabel}</SectionLabel>
            <h1 className="text-display-xl mb-8">{project.title}</h1>
            {project.subtitle && (
              <p className="text-editorial text-muted max-text">{project.subtitle}</p>
            )}
          </div>

          {/* Right column: metadata, stacked editorially */}
          <aside className="mt-12 lg:mt-0 lg:pt-2 border-t lg:border-t-0 lg:border-l border-line lg:pl-8 pt-8">
            <div className="flex flex-col gap-6">
              {[
                { label: "Location", value: project.city && project.country ? `${project.city}, ${project.country}` : project.city || project.country || null },
                { label: "Type", value: project.projectType },
                { label: "Client", value: displayClient },
                { label: "Year", value: project.year },
                { label: "Goal", value: project.mainGoal },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <SectionLabel>{item.label}</SectionLabel>
                    <p className="text-meta text-ink mt-1">{item.value}</p>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Hero */}
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <SanityImg
          image={project.heroMedia ?? project.coverImage}
          alt={project.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fallback={<div className="w-full h-full bg-soft" />}
        />
      </div>

      {/* Narrative intro */}
      <section className="page-x section-y border-b border-line">
        <div className="max-w-2xl">
          <p className="text-display-md mb-6 font-serif">
            Before the image, there is the story.
          </p>
          <p className="text-editorial text-muted">
            The project needed more than a set of views. It needed a clear atmosphere, a sense of place, and a visual rhythm that could help the client understand the life inside the architecture.
          </p>
        </div>
      </section>

      {/* FASES sections */}
      {project.phases && project.phases.length > 0 && (
        <div>
          {project.phases.map((phase) => (
            <section
              key={phase._id}
              className="page-x section-y border-b border-line"
              id={`fase-${phase.phaseNumber}`}
            >
              <PhaseSection phase={phase} />
            </section>
          ))}
        </div>
      )}

      {/* Result */}
      <section className="page-x section-y border-b border-line bg-soft">
        <div className="max-w-2xl">
          <SectionLabel className="mb-6">What the narrative helped clarify.</SectionLabel>
          <p className="text-editorial text-muted">
            The final image sequence gave the project a clear tone, a stronger sense of place, and a complete visual world for presentation, approval, and marketing.
          </p>
        </div>
      </section>

      {/* Testimonial */}
      <section className="page-x section-y border-b border-line">
        <div className="max-w-xl">
          <p className="text-display-md mb-8 leading-relaxed font-serif">
            &ldquo;Oaki gave the project a voice before the building existed.&rdquo;
          </p>
          <p className="text-meta text-muted">
            Founder, Undisclosed Architecture Studio
          </p>
        </div>
      </section>

      {/* Credits */}
      <section className="page-x py-16 border-b border-line">
        <SectionLabel className="mb-8">Credits</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            project.credits ?? [
              { label: "Client", value: displayClient ?? "Undisclosed" },
              { label: "Architecture", value: project.architect ?? "Undisclosed" },
              { label: "Visualization", value: "Oaki Studio" },
              { label: "Creative Direction", value: "Oaki Studio" },
              { label: "Year", value: project.year },
              { label: "Location", value: `${project.city}, ${project.country}` },
            ]
          ).map((credit) => (
            <div key={credit.label}>
              <SectionLabel>{credit.label}</SectionLabel>
              <p className="text-meta mt-1" style={{ color: "var(--color-ink)" }}>
                {credit.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Next project */}
      {nextProject && (
        <section className="page-x py-16">
          <SectionLabel className="mb-3">Next Project Book</SectionLabel>
          <Link
            href={`/case-studies/${nextProject.slug}`}
            className="group flex items-baseline gap-4 hover:text-warm-deep transition-colors duration-300"
          >
            <span className="text-display-lg">{nextProject.title}</span>
            <span className="text-meta text-muted group-hover:text-warm-deep transition-colors duration-300">
              →
            </span>
          </Link>
        </section>
      )}
    </>
  );
}
