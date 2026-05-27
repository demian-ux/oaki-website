import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import SectionLabel from "@/components/global/SectionLabel";
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
      {/* Hero */}
      <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
        <SectionLabel className="mb-6">{contact.heroLabel ?? "Start a project"}</SectionLabel>
        <h1 className="text-display-xl mb-8 max-w-2xl">
          {contact.heroTitle ?? "Tell us what you are building."}
        </h1>
        <p className="text-editorial text-muted max-text">
          {contact.heroText ??
            "Share the project, the timeline, and what the images need to do. We reply within two hours."}
        </p>
      </section>

      {/* Form */}
      <section className="page-x section-y">
        <div className="max-w-2xl">
          <ContactForm config={contact} />
        </div>
      </section>
    </>
  );
}
