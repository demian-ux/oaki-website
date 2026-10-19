import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import ContactPaths from "@/components/contact/ContactPaths";
import PageHero from "@/components/global/PageHero";
import { getContactPage } from "@/lib/data";
import { bookingMode } from "@/lib/booking";

// The way in, inside selected work: the same two paths as /contact (a call
// on the calendar, or the written brief), the same form and picker, the
// same API. Only the chrome around it differs, so nobody leaves the set.

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a call or send a brief. We reply within two hours.",
};

export default async function SelectedContactPage() {
  const contact = await getContactPage();
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
            <ContactForm config={contact} />
          ) : (
            <ContactPaths config={contact} />
          )}
        </div>
      </section>
    </>
  );
}
