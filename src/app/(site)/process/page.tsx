import type { Metadata } from "next";
import { getProcessPage } from "@/lib/data";
import { defaultPhases } from "@/lib/placeholder-data";
import Button from "@/components/global/Button";
import StripeRule from "@/components/global/StripeRule";

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
      {/* Hero — Process mode: a drawing-set masthead on a construction grid.
          Mono coordinate labels in ocre-700 structure-ink; sans body. */}
      <section className="process-grid border-b border-line">
        <div className="page-x pt-24 pb-16 lg:pt-32 lg:pb-20">
          <div className="flex items-center justify-between mb-10">
            <p className="coord">DOC. 01 — PROCESS</p>
            <p className="coord" style={{ color: "var(--color-muted)" }}>OAKI STUDIO</p>
          </div>
          <p className="coord mb-6">{process.heroLabel ?? "How we work"}</p>
          <h1 className="text-mode-title text-volume reveal mb-8 max-w-3xl">
            {process.heroTitle ?? "Our process starts before the image."}
          </h1>
          <p className="text-lede text-muted max-text">
            {process.heroText ??
              "We read the project, find its tone, and build the image world that lets others see what you see."}
          </p>
          {/* Scale bar — drawing-set signature */}
          <div className="flex items-center gap-4 mt-12">
            <span className="coord" style={{ color: "var(--color-muted)" }}>Scale</span>
            <span className="flex" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-2 border border-warm-deep"
                  style={{ background: i % 2 ? "var(--color-warm-deep)" : "transparent" }}
                />
              ))}
            </span>
            <span className="coord" style={{ color: "var(--color-muted)" }}>5 steps · 6 fases</span>
          </div>
        </div>
      </section>

      {/* Process steps — coordinate-numbered rows, hairline rules between */}
      <section className="page-x section-y border-b border-line">
        <div>
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`grid grid-cols-[3.5rem_1fr] lg:grid-cols-[6rem_1fr] gap-5 lg:gap-12 py-12 ${
                i < steps.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <span className="coord pt-1">{`STEP ${step.number}`}</span>
              <div>
                <h2 className="text-title reveal mb-4">{step.title}</h2>
                <p className="text-body text-muted max-text">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FASES method — a drawing-set table: hairline grid, coordinate labels */}
      <section className="page-x section-y border-b border-line">
        <p className="coord mb-4">{process.fasesLabel ?? "The FASES Method"}</p>
        <h2 className="text-mode-title text-volume reveal mb-8 max-w-3xl">
          {process.fasesHeading ?? "Every project book follows the same six-part structure."}
        </h2>
        <StripeRule className="mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-line bg-line">
          {defaultPhases.map((phase) => (
            <div key={phase._id} className="p-8 bg-paper">
              <p className="coord mb-3">FASE {phase.phaseNumber}</p>
              <p className="text-title mb-2">{phase.phaseTitle}</p>
              <p className="text-meta text-muted">{phase.whatItIs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-x section-y border-t border-line text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-mode-title text-volume reveal mb-6">
            {process.ctaHeading ?? "Your images need to do a job."}
          </h2>
          <p className="text-lede text-muted mb-10">
            {process.ctaBody ?? "Let us figure out what it is."}
          </p>
          <Button href="/contact" variant="primary" size="lg">
            {process.ctaButtonLabel ?? "Start a project"}
          </Button>
        </div>
      </section>
    </>
  );
}
