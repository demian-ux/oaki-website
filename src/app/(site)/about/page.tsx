import type { Metadata } from "next";
import { getAboutPage, getTeamMembers } from "@/lib/data";
import SectionLabel from "@/components/global/SectionLabel";
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
      {/* Hero */}
      <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
        <SectionLabel className="mb-6">{about.heroLabel ?? "About the Studio"}</SectionLabel>
        <h1 className="text-display-xl mb-8 max-w-5xl">
          {about.heroTitle ?? "We build the image world around architecture that doesn't exist yet."}
        </h1>
        <p className="text-editorial text-muted max-text">
          {about.heroText ??
            "Oaki Studio works with architects, designers, and developers to make projects feel real before they are."}
        </p>
      </section>

      {/* Studio statement */}
      <section className="page-x section-y border-b border-line">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-display-md mb-10 font-serif">
              {about.statementHeading ?? "A building can be correct and still fail to move anyone."}
            </p>
            <p className="text-editorial text-muted mb-6">
              {about.statementParagraph1 ??
                about.studioStatement ??
                "We close that gap. Our work makes people want to live in a project before the first brick is laid."}
            </p>
            <p className="text-editorial text-muted">
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
        <SectionLabel className="mb-14">{about.teamLabel ?? "The team"}</SectionLabel>
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
        <SectionLabel className="mb-12">{about.workWithLabel ?? "We work with"}</SectionLabel>
        <div className="flex flex-wrap gap-x-14 gap-y-6">
          {workWith.map((label) => (
            <span key={label} className="text-display-md text-muted font-serif">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-x section-y text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-display-md mb-8">
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
