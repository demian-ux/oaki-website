import type { Metadata } from "next";
import { getAboutPage, getTeamMembers } from "@/lib/data";
import Button from "@/components/global/Button";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage();
  return {
    title: about.seoTitle ?? "About",
    description:
      about.seoDescription ??
      "We build the image world around architecture that doesn't exist yet. A boutique team of visual artists, architects, and storytellers.",
  };
}

export default async function AboutPage() {
  const [team, about] = await Promise.all([getTeamMembers(), getAboutPage()]);

  const workWith =
    about.workWithItems && about.workWithItems.length > 0
      ? about.workWithItems
      : [
          "Luxury Residential Architects",
          "Interior Designers",
          "Hospitality Architects",
          "Developers",
        ];

  return (
    <>
      {/* Hero — Studio voice: mono eyebrow, display statement, ocre rule */}
      <section className="page-x pt-28 pb-20 lg:pt-36 lg:pb-28 border-b border-line">
        <p className="coord mb-6">
          {about.heroLabel ?? "About the Studio"}
        </p>
        <h1 className="text-statement text-volume mb-8 max-w-4xl">
          {about.heroTitle ?? "We build the image world around architecture that doesn't exist yet."}
        </h1>
        <span className="ocre-rule mb-9" />
        <p className="text-lede text-muted max-text">
          {about.heroText ??
            "Oaki Studio works with architects, designers, and developers to make projects feel real before they are."}
        </p>
      </section>

      {/* Studio statement */}
      <section className="page-x section-y border-b border-line">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-mode-title text-volume mb-10">
              {about.statementHeading ?? "A building can be correct and still fail to move anyone."}
            </p>
            <p className="text-lede text-muted mb-6" style={{ maxWidth: "60ch" }}>
              {about.statementParagraph1 ??
                about.studioStatement ??
                "We close that gap. Our work makes people want to live in a project before the first brick is laid."}
            </p>
            <p className="text-lede text-muted" style={{ maxWidth: "60ch" }}>
              {about.statementParagraph2 ??
                about.studioText ??
                "Most studios run like render factories. We run like an editorial house. Every project gets a story, a tone, and an image world built around it."}
            </p>
          </div>
          <div className="hidden lg:block aspect-[4/3] bg-soft" />
        </div>
      </section>

      {/* Team */}
      <section className="page-x section-y border-b border-line">
        <p className="coord mb-4">{about.teamLabel ?? "The team"}</p>
        <div className="stripe-rule mb-14" aria-hidden="true" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {team.map((member) => (
            <div key={member._id}>
              <div className="aspect-[3/4] mb-5 bg-soft" />
              <p className="text-label text-ink mb-1">{member.name}</p>
              <p className="text-meta text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* We work with */}
      <section className="page-x section-y border-b border-line bg-soft">
        <p className="coord mb-12">{about.workWithLabel ?? "We work with"}</p>
        <div className="flex flex-wrap gap-x-12 gap-y-5">
          {workWith.map((label) => (
            <span key={label} className="text-display-md text-muted">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-x section-y text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-mode-title text-volume mb-8">
            {about.ctaHeading ?? "Tell us what you are building."}
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            {about.ctaButtonLabel ?? "Begin the conversation"}
          </Button>
        </div>
      </section>
    </>
  );
}
