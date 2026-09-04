import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import PageHero from "@/components/global/PageHero";
import { getContactPage } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContactPage();
  return {
    title: contact.seoTitle ?? "Contact",
    description:
      contact.seoDescription ??
      "Share the project, the timeline, and what the images need to do. We reply within two hours.",
  };
}

export default async function ContactPage() {
  const contact = await getContactPage();
  return (
    <>
      {/* Hero — shared secondary-page design (PageHero). */}
      <PageHero
        title="Contact Us"
        lede={
          contact.heroText ??
          "Share the project, the timeline, and what the images need to do. We reply within two hours."
        }
      />

      {/* Form */}
      <section className="page-x section-y">
        <div className="max-w-2xl">
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
          <ContactForm config={contact} />
        </div>
      </section>
    </>
  );
}
