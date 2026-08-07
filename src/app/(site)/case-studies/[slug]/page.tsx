import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectSlugs, getAllProjects, getProjectBySlug, getNextProject } from "@/lib/data";
import { getCaseDraft, listCaseDraftSlugs } from "@/lib/case-drafts";
import CaseDraftView from "@/components/case-studies/CaseDraft";
import PhaseSection from "@/components/case-studies/PhaseSection";
import CaseHero from "@/components/case-studies/CaseHero";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  const all = new Set([...slugs, ...listCaseDraftSlugs()]);
  return [...all].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const draft = getCaseDraft(slug);
  if (draft) return { title: draft.title, description: draft.subtitle };
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.subtitle,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;

  // Repo case studies (content/cases) take precedence: they carry the full
  // image arc from the library, where the Sanity projects so far hold only
  // a cover. The Sanity phase template remains the fallback.
  const draft = getCaseDraft(slug);
  if (draft) {
    return (
      <>
        <section className="page-x pt-16">
          <Link
            href="/case-studies"
            className="coord nav-link-warm inline-block hover:text-ink transition-colors duration-300"
          >
            ← Project Books
          </Link>
        </section>
        <CaseDraftView draft={draft} />
      </>
    );
  }

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

  const displayLocation =
    project.city && project.country
      ? `${project.city}, ${project.country}`
      : project.city || project.country || null;

  const testimonial =
    project.testimonial?.approved && project.testimonial.quote
      ? project.testimonial
      : null;

  return (
    <>
      {/* Full-bleed render hero — carries only the navbar (v3.0 Case mode).
          heroMedia = the flat cover art; coverImage = the BOOK mockup (menu &
          library surfaces), so it only backfills when no hero is set. */}
      <CaseHero image={project.heroMedia ?? project.coverImage} alt={project.title} />

      {/* Ocre-drench binding — the Case title spread. ocre-600 ground, type
          in ocre-50 (AA). SangBleu for the subtitle: its one home. */}
      <section className="case-drench page-x py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] lg:gap-16">
          {/* Left column: collection / title / subtitle */}
          <div>
            <p className="coord mb-6" style={{ color: "var(--color-warm-200)" }}>
              {project.collectionLabel}
            </p>
            <h1 className="text-statement text-volume reveal mb-8" style={{ color: "var(--color-warm-pale)" }}>
              {project.title}
            </h1>
            {project.subtitle && (
              <p
                className="font-serif max-w-2xl"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(1.25rem, 2.4vw, 1.75rem)",
                  lineHeight: 1.3,
                  color: "var(--color-warm-pale)",
                }}
              >
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Right column: metadata — keys in ocre-200, values in ocre-50 */}
          <aside
            className="mt-12 lg:mt-0 lg:pt-1 lg:border-l lg:pl-8"
            style={{ borderColor: "var(--color-warm-500)" }}
          >
            <div className="flex flex-col gap-5">
              {[
                { label: "Location", value: displayLocation },
                { label: "Type", value: project.projectType },
                { label: "Client", value: displayClient },
                { label: "Year", value: project.year },
                { label: "Goal", value: project.mainGoal },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <span
                      className="coord block mb-1"
                      style={{ color: "var(--color-warm-200)" }}
                    >
                      {item.label}
                    </span>
                    <p style={{ color: "var(--color-warm-pale)", fontSize: "0.9375rem" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Narrative intro — CMS copy only, no template prose */}
      {project.introText && (
        <section className="page-x section-y border-b border-line">
          <div className="max-w-2xl">
            <p className="text-quote reveal" style={{ whiteSpace: "pre-line" }}>
              {project.introText}
            </p>
          </div>
        </section>
      )}

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

      {/* Result — CMS copy only */}
      {project.resultText && (
        <section className="page-x section-y border-b border-line bg-soft">
          <div className="max-w-2xl">
            <p className="coord mb-6">The result</p>
            <p className="text-editorial text-muted" style={{ whiteSpace: "pre-line" }}>
              {project.resultText}
            </p>
          </div>
        </section>
      )}

      {/* Testimonial — only a real, approved quote from Sanity ever renders */}
      {testimonial && (
        <section className="page-x section-y border-b border-line">
          <div className="max-w-xl">
            <p className="text-quote reveal mb-8 leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <p className="text-meta text-muted">
              {testimonial.displayName ??
                [testimonial.personName, testimonial.personTitle, testimonial.company]
                  .filter(Boolean)
                  .join(", ")}
            </p>
          </div>
        </section>
      )}

      {/* Credits */}
      <section className="page-x py-16 border-b border-line">
        <p className="coord mb-8">Credits</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {(
            project.credits ?? [
              { label: "Client", value: displayClient ?? "Undisclosed" },
              { label: "Architecture", value: project.architect ?? "Undisclosed" },
              { label: "Visualization", value: "Oaki Studio" },
              { label: "Creative Direction", value: "Oaki Studio" },
              { label: "Year", value: project.year },
              { label: "Location", value: displayLocation },
            ].filter((credit) => credit.value)
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

      {/* CTA — the page should not dead-end after the story */}
      <section className="page-x section-y text-center border-b border-line">
        <div className="max-w-lg mx-auto">
          <h2 className="text-mode-title text-volume reveal mb-8">
            Tell us what you’re building<span className="dot">.</span>
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            Start a project
          </Button>
        </div>
      </section>

      {/* Next project — hidden while the library has a single book */}
      {nextProject && nextProject.slug !== slug && (
        <section className="page-x py-16">
          <p className="coord mb-3">Next Project Book</p>
          <Link
            href={`/case-studies/${nextProject.slug}`}
            className="group flex items-baseline gap-4 hover:text-warm-deep transition-colors duration-300"
          >
            <span className="text-title">{nextProject.title}</span>
            <span className="text-meta text-muted group-hover:text-warm-deep transition-colors duration-300">
              →
            </span>
          </Link>
        </section>
      )}
    </>
  );
}
