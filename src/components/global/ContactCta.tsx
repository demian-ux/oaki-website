import Button from "@/components/global/Button";

// The closing CTA every case study ends on, so whoever reads to the bottom
// has the next step at hand. Same voice as the homepage's final section.
export default function ContactCta() {
  return (
    <section className="section-y page-x border-t border-line text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-statement text-volume reveal mb-10">
          Tell us what you’re building<span className="dot">.</span>
        </h2>
        <Button href="/contact" variant="primary" size="lg">
          Start a project
        </Button>
      </div>
    </section>
  );
}
