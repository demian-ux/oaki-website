import type { Metadata } from "next";
import { getProcessPage } from "@/lib/data";
import { defaultPhases } from "@/lib/placeholder-data";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";

export async function generateMetadata(): Promise<Metadata> {
  const process = await getProcessPage();
  return {
    title: process.seoTitle ?? "Process",
    description:
      process.seoDescription ??
      "Our process starts before the image. We read the project, find its tone, and build the image world that lets others see what you see.",
  };
}

const fallbackSteps = [
  {
    number: "01",
    title: "Read the project",
    body: "We study the brief, the site, the audience, and what the project is trying to prove. We ask the questions the images will have to answer.",
  },
  {
    number: "02",
    title: "Find the narrative",
    body: "We define the feeling. What should someone experience when they first see this project? That answer drives every image we make.",
  },
  {
    number: "03",
    title: "Build the visual language",
    body: "We build the reference world: mood, material, light, color, rhythm. The complete atmosphere of the project before a single frame is rendered.",
  },
  {
    number: "04",
    title: "Craft the image sequence",
    body: "We create every view, detail, and moment that tells the story. Nothing is generic. Nothing is accidental.",
  },
  {
    number: "05",
    title: "Prepare the project for use",
    body: "We deliver images built to work. For your pitch deck. Your sales launch. Your competition submission. Not just a folder of files.",
  },
];

export default async function ProcessPage() {
  const process = await getProcessPage();
  const steps =
    process.steps && process.steps.length > 0 ? process.steps : fallbackSteps;

  return (
    <>
      {/* Hero */}
      <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
        <SectionLabel className="mb-6">{process.heroLabel ?? "How we work"}</SectionLabel>
        <h1 className="text-display-xl mb-8 max-w-2xl">
          {process.heroTitle ?? "Our process starts before the image."}
        </h1>
        <p className="text-editorial text-muted max-text">
          {process.heroText ??
            "We read the project, find its tone, and build the image world that lets others see what you see."}
        </p>
      </section>

      {/* Process steps */}
      <section className="page-x section-y border-b border-line">
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`flex flex-col lg:flex-row lg:items-start gap-6 py-12 ${
                i < steps.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="text-label text-warm-deep shrink-0 w-12 font-display">
                {step.number}
              </span>
              <div className="flex-1">
                <h2 className="text-display-md mb-4">{step.title}</h2>
                <p className="text-editorial text-muted max-text">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FASES method */}
      <section className="page-x section-y border-b border-line bg-soft">
        <SectionLabel className="mb-4">{process.fasesLabel ?? "The FASES Method"}</SectionLabel>
        <h2 className="text-display-md mb-14">
          {process.fasesHeading ?? "Every project book follows the same six-part structure."}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-line">
          {defaultPhases.map((phase) => (
            <div key={phase._id} className="p-8 bg-soft">
              <p className="text-label text-warm-deep mb-3 font-display">
                FASE {phase.phaseNumber}
              </p>
              <p className="mb-2 font-display" style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}>
                {phase.phaseTitle}
              </p>
              <p className="text-meta text-muted">{phase.whatItIs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-x section-y border-t border-line text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-display-md mb-4">
            {process.ctaHeading ?? "Your images need to do a job."}
          </h2>
          <p className="text-editorial text-muted mb-10">
            {process.ctaBody ?? "Let us figure out what it is."}
          </p>
          <Button href="/contact" variant="primary" size="lg">
            {process.ctaButtonLabel ?? "Begin the conversation"}
          </Button>
        </div>
      </section>
    </>
  );
}
