import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import RevealOnScroll from "@/components/global/RevealOnScroll";
import SmoothScroll from "@/components/global/SmoothScroll";
import WarmupAssets from "@/components/global/WarmupAssets";
import ScrollProfiler from "@/components/global/ScrollProfiler";
import { HeroThemeProvider } from "@/components/global/HeroTheme";
import { getAllProjects, getSiteSettings } from "@/lib/data";
import { getCaseDraftCards } from "@/lib/case-drafts";
import { ponceCases } from "@/lib/ponce-cases";
import { HIDDEN_PROJECT_SLUGS } from "@/lib/hidden-projects";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ isEnabled: isDraftMode }, sanityProjects, settings] = await Promise.all([
    draftMode(),
    getAllProjects(),
    getSiteSettings(),
  ]);

  // Same composition as the Case Studies library, so the header's mega menu
  // (and its "N case studies" counter) always agrees with /case-studies.
  const taken = new Set(sanityProjects.map((p) => p.slug));
  const projects = [
    ...sanityProjects,
    ...getCaseDraftCards().filter((p) => !taken.has(p.slug)),
    ...ponceCases,
  ].filter((p) => !HIDDEN_PROJECT_SLUGS.has(p.slug));

  return (
    <HeroThemeProvider>
      <Header
        projects={projects}
        ctaLabel={settings.headerCtaLabel}
        navLabels={settings.navLabels}
        showJournal={settings.showJournal}
      />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <SmoothScroll />
      <WarmupAssets />
      <ScrollProfiler />
      <RevealOnScroll />
      <Footer />
      {isDraftMode && (
        <>
          <VisualEditing />
          <div
            className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-ink text-paper px-4 py-2.5 text-label"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <span>Preview Mode</span>
            <a
              href="/api/draft/disable"
              className="text-warm pl-3 border-l"
              style={{ borderColor: "var(--color-divider-dark)" }}
            >
              Exit
            </a>
          </div>
        </>
      )}
    </HeroThemeProvider>
  );
}
