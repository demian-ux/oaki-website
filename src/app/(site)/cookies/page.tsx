import type { Metadata } from "next";
import SectionLabel from "@/components/global/SectionLabel";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <section className="page-x section-y">
      <SectionLabel className="mb-6">Legal</SectionLabel>
      <h1 className="text-title mb-10">Cookie Policy</h1>
      <div className="text-editorial text-muted max-text space-y-6">
        <p>This page will contain the Oaki Studio cookie policy. Content coming soon.</p>
      </div>
    </section>
  );
}
