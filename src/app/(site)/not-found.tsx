import StripeRule from "@/components/global/StripeRule";
import Button from "@/components/global/Button";

// Branded 404 for notFound() thrown inside the site segment (unknown journal
// entries, case studies, and any unmatched URL). Renders inside the site
// chrome — header and footer stay.
export default function NotFound() {
  return (
    <section className="page-x pt-20 pb-14 min-h-[60vh]">
      <p className="coord mb-6">404</p>
      <h1 className="text-statement text-volume reveal mb-6">
        This page isn&rsquo;t in the library
      </h1>
      <StripeRule className="mb-8" />
      <p className="text-lede text-muted max-text mb-10">
        The address may have changed, or the page never existed. The work is
        still where it always was.
      </p>
      <Button href="/" variant="primary">
        Back to the studio
      </Button>
    </section>
  );
}
