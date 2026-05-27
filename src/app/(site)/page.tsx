import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProjects, getHomePage } from "@/lib/data";
import { defaultPhases } from "@/lib/placeholder-data";
import BookGrid from "@/components/case-studies/BookGrid";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import HomeHero from "@/components/home/HomeHero";
import PartnersList from "@/components/global/PartnersList";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();
  return {
    title:
      home.seoTitle ?? "Oaki Studio — Architectural Storytelling",
    description:
      home.seoDescription ??
      "We work with architects, interior designers, and developers to build the image world around a project before it exists. We reply within two hours. We deliver on time.",
  };
}

const fallbackPartners = [
  { name: "Estudio Marelli", meta: "Buenos Aires" },
  { name: "Rosen & Fiore", meta: "New York" },
  { name: "Haus Nordlicht", meta: "Berlin" },
  { name: "Atelier Venn", meta: "Paris" },
  { name: "Arquitectura del Sur", meta: "Madrid" },
  { name: "Bureau Delacroix", meta: "Brussels" },
  { name: "Costa / Rivera", meta: "Lisbon" },
  { name: "Bosco Studio", meta: "Milan" },
];

export default async function HomePage() {
  const [featured, home] = await Promise.all([
    getFeaturedProjects(),
    getHomePage(),
  ]);

  // Pick the testimonial — referenced > inline > default
  const testimonialQuote =
    home.testimonialRef?.shortQuote ||
    home.testimonialRef?.quote ||
    home.testimonialQuote ||
    "Oaki helped us find the tone of the project before a single final image was made.";
  const testimonialAttribution =
    home.testimonialRef?.displayName ||
    (home.testimonialRef?.personName && home.testimonialRef?.personTitle
      ? `${home.testimonialRef.personTitle}, ${home.testimonialRef.company ?? home.testimonialRef.personName}`
      : home.testimonialAttribution) ||
    "Creative Director, Undisclosed Studio";

  const partners =
    home.collaborators && home.collaborators.length > 0
      ? home.collaborators
      : fallbackPartners;

  return (
    <>
      {/* 1. Hero */}
      <HomeHero
        label={home.heroLabel ?? "Architectural Storytelling Studio"}
        title={home.heroTitle ?? "Your project, told the way Phaidon would publish it."}
        subtext={
          home.heroSubtext ??
          "We work with architects, interior designers, and developers across New York and Europe. We reply within two hours. We deliver on time. Every time."
        }
        primaryCta={home.heroPrimaryCta ?? "Begin the conversation"}
        secondaryCta={home.heroSecondaryCta ?? "View Case Studies"}
      />

      {/* 2. Featured Project Books */}
      <section className="section-y page-x border-t border-line">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <SectionLabel className="mb-4">
              {home.featuredLabel ?? "Selected Project Books"}
            </SectionLabel>
            <h2 className="text-display-md">
              {home.featuredHeading ?? "Each project is a complete story, not a folder of renders."}
            </h2>
          </div>
          <Link
            href="/case-studies"
            className="text-label text-muted hover:text-ink transition-colors duration-300 shrink-0"
          >
            {home.featuredViewAllLabel ?? "View the Library →"}
          </Link>
        </div>
        <BookGrid projects={featured.slice(0, 4)} />
      </section>

      {/* 3. Positioning Statement */}
      <section className="section-y page-x border-t border-line">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <p className="text-display-md mb-8">
            {home.positioningHeading ?? "Most studios start with the image. We start with the story."}
          </p>
          <p className="text-editorial text-muted mb-6">
            {home.positioningParagraph1 ??
              "Our role is to read the project, find its tone, and build the visual world that makes others want to be part of it before the first brick is laid."}
          </p>
          <p className="text-editorial text-muted">
            {home.positioningParagraph2 ?? "For sales. For approval. For competitions. For memory."}
          </p>
        </div>
      </section>

      {/* 4. FASES Method Preview */}
      <section className="section-y page-x border-t border-line bg-soft">
        <SectionLabel className="mb-12">
          {home.fasesLabel ?? "Before we make a single image, we build the story."}
        </SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-line">
          {defaultPhases.map((phase) => (
            <div key={phase._id} className="p-8 bg-soft border-line">
              <p className="text-label text-warm mb-3 font-display">
                {phase.phaseNumber}
              </p>
              <p className="text-display-md" style={{ fontSize: "1.125rem", letterSpacing: "-0.01em" }}>
                {phase.phaseTitle}
              </p>
              <p className="text-meta text-muted mt-2">{phase.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/process" variant="outline">
            {home.fasesButtonLabel ?? "See the full process"}
          </Button>
        </div>
      </section>

      {/* 5. Testimonial */}
      <section className="section-y page-x border-t border-line">
        <div className="max-w-2xl">
          <p className="text-display-md mb-8 leading-relaxed font-serif">
            &ldquo;{testimonialQuote}&rdquo;
          </p>
          <p className="text-meta text-muted">{testimonialAttribution}</p>
        </div>
      </section>

      {/* 6. Selected Collaborators */}
      <section className="section-y page-x border-t border-line">
        <div className="flex flex-col gap-6 mb-12">
          <SectionLabel>{home.collaboratorsLabel ?? "Selected Collaborators"}</SectionLabel>
          <h2 className="text-display-md max-w-xl">
            {home.collaboratorsHeading ?? "We publish for studios who want their projects read closely."}
          </h2>
        </div>
        <PartnersList partners={partners} />
      </section>

      {/* 7. About Preview */}
      <section className="section-y page-x border-t border-line bg-soft">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <SectionLabel className="mb-6">{home.aboutLabel ?? "About the Studio"}</SectionLabel>
            <h2 className="text-display-md mb-8">
              {home.aboutHeading ?? "A boutique team. A Phaidon standard."}
            </h2>
            <p className="text-editorial text-muted mb-8">
              {home.aboutBody ??
                "Small enough to know every detail of your project. Skilled enough to make it look like a museum commission."}
            </p>
            <Button href="/about" variant="outline">
              {home.aboutButtonLabel ?? "About the Studio"}
            </Button>
          </div>
          <div className="hidden lg:block aspect-square mt-0 bg-line" />
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="section-y page-x border-t border-line text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-display-lg mb-10">
            {home.finalCtaHeading ?? "Tell us what you are building."}
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            {home.finalCtaButtonLabel ?? "Begin the conversation"}
          </Button>
        </div>
      </section>
    </>
  );
}
