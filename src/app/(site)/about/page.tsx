import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAboutPage, getTeamMembers } from "@/lib/data";

// Page hidden for now — flip to false to bring it back (and restore the
// nav/footer links and the homepage button that point here).
const ABOUT_HIDDEN = true;
import Button from "@/components/global/Button";
import StripeRule from "@/components/global/StripeRule";
import PageHero from "@/components/global/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  if (ABOUT_HIDDEN) return { title: "Not found" };
  const about = await getAboutPage();
  return {
    title: about.seoTitle ?? "About",
    description:
      about.seoDescription ??
      "We build the image world around architecture that doesn't exist yet. A boutique team of visual artists, architects, and storytellers.",
  };
}

export default async function AboutPage() {
  if (ABOUT_HIDDEN) notFound();
  const [team, about] = await Promise.all([getTeamMembers(), getAboutPage()]);

  const workWith =
    about.workWithItems && about.workWithItems.length > 0
      ? about.workWithItems
      : [
          "Residential Architects",
          "Interior Designers",
          "Hospitality Architects",
          "Developers",
        ];

  return (
    <>
      {/* Hero — shared secondary-page design (PageHero). */}
      <PageHero
        title="About Us"
        lede={
          "We work with architects, designers, and developers.\nWe make projects feel real before they are built."
        }
      />

      {/* Studio statement */}
      <section className="page-x section-y border-b border-line">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-mode-title text-volume reveal mb-10">
              {(about.statementHeading ?? "A building can be correct and still fail to move anyone").replace(/\.$/, "")}
              <span className="dot">.</span>
            </h2>
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
          {/* Studio photo at natural ratio — never cropped. */}
          <img
            src="/images/about-us/web/studio-1920.webp"
            alt="The Oaki Studio team at work"
            width={1920}
            height={1280}
            className="hidden lg:block w-full h-auto"
          />
        </div>
      </section>

      {/* Team */}
      <section className="page-x section-y border-b border-line">
        <p className="coord mb-4">{about.teamLabel ?? "The team"}</p>
        <StripeRule className="mb-14" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {team.map((member, i) => (
            <div key={member._id}>
              {/* Team-shoot photos by grid position (about-us library),
                  natural ratio — never cropped. Reorder here if a photo
                  should sit under a different name. */}
              <img
                src={`/images/about-us/web/team-0${(i % 4) + 1}-1200.webp`}
                alt={member.name}
                width={1200}
                height={800}
                className="w-full h-auto mb-5"
              />
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
            <span key={label} className="text-title text-muted">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-x section-y text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-mode-title text-volume reveal mb-8">
            {(about.ctaHeading ?? "Tell us what you’re building").replace(/\.$/, "")}
            <span className="dot">.</span>
          </h2>
          <Button href="/contact" variant="primary" size="lg">
            {about.ctaButtonLabel ?? "Start a project"}
          </Button>
        </div>
      </section>
    </>
  );
}
