import type { Metadata } from "next";
import SectionLabel from "@/components/global/SectionLabel";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="page-x section-y">
      <SectionLabel className="mb-6">Legal</SectionLabel>
      <h1 className="text-display-lg mb-10">Terms of Service</h1>
      <div className="text-editorial text-muted max-text space-y-6">
        <p>This page will contain the Oaki Studio terms of service. Content coming soon.</p>
      </div>
    </section>
  );
}
