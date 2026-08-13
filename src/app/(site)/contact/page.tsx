import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import StripeRule from "@/components/global/StripeRule";
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
        <p className="coord mb-6">{contact.heroLabel ?? "Start a project"}</p>
        <h1 className="text-statement text-volume reveal mb-8 max-w-2xl">
          {(contact.heroTitle ?? "Tell us what you’re building").replace(/\.$/, "")}
          <span className="dot">.</span>
        </h1>
        <StripeRule className="mb-8" />
        <p className="text-lede text-muted max-text">
          {contact.heroText ??
            "Share the project, the timeline, and what the images need to do. We reply within two hours."}
        </p>
        <p className="text-meta text-muted mt-6">
          Prefer email? Write to{" "}
          <a
            href="mailto:info@oaki.studio"
            className="underline underline-offset-4 hover:text-ink transition-colors duration-300"
          >
            info@oaki.studio
          </a>
          {" "}and we will take it from there.
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
