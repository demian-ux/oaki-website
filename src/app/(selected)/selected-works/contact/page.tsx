import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import ContactPaths from "@/components/contact/ContactPaths";
import PageHero from "@/components/global/PageHero";
import { getContactPage } from "@/lib/data";
import { bookingMode } from "@/lib/booking";
import { LEAD_SOURCE_SELECTED, leadFromParam, type Lead } from "@/lib/lead-source";

// The way in, inside selected work: the same two paths as /contact (a call
// on the calendar, or the written brief), the same form and picker, the
// same API. Only the chrome around it differs, so nobody leaves the set.
// Every lead sent from here carries source = "selected-works", and the
// case it came from when the CTA passed ?from=<slug> (or "booth").

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a call or send a brief. We reply within two hours.",
};

interface Props {
  searchParams: Promise<{ from?: string | string[] }>;
}

export default async function SelectedContactPage({ searchParams }: Props) {
  const [contact, { from }] = await Promise.all([getContactPage(), searchParams]);
  const lead: Lead = { source: LEAD_SOURCE_SELECTED, from: leadFromParam(from) };
  return (
    <>
      <PageHero
        title="Contact Us"
        lede={
          contact.heroText ??
          "Share the project, the timeline, and what the images need to do. We reply within two hours."
        }
      />
      <section className="page-x section-y">
        <div className="max-w-3xl">
          <p className="text-meta text-muted mb-10">
            Prefer email? Write to{" "}
            <a
              href="mailto:info@oaki.studio"
              className="underline underline-offset-4 hover:text-ink transition-colors duration-300"
            >
              info@oaki.studio
            </a>
            {" "}and we will take it from there.
          </p>
          {bookingMode() === "off" ? (
            <ContactForm config={contact} lead={lead} />
          ) : (
            <ContactPaths config={contact} lead={lead} />
          )}
        </div>
      </section>
    </>
  );
}
