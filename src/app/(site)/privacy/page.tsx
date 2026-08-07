import type { Metadata } from "next";
import SectionLabel from "@/components/global/SectionLabel";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="page-x section-y">
      <SectionLabel className="mb-6">Legal</SectionLabel>
      <h1 className="text-statement text-volume reveal mb-10">Privacy Policy</h1>
      <div className="text-editorial text-muted max-text space-y-6">
        <p>This page will contain the Oaki Studio privacy policy. Content coming soon.</p>
      </div>
    </section>
  );
}
