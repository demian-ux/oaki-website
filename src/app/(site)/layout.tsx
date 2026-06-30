import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import RevealOnScroll from "@/components/global/RevealOnScroll";
import SmoothScroll from "@/components/global/SmoothScroll";
import { HeroThemeProvider } from "@/components/global/HeroTheme";
import { getAllProjects, getSiteSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ isEnabled: isDraftMode }, projects, settings] = await Promise.all([
    draftMode(),
    getAllProjects(),
    getSiteSettings(),
  ]);

  return (
    <HeroThemeProvider>
      <Header
        projects={projects}
        ctaLabel={settings.headerCtaLabel}
        navLabels={settings.navLabels}
      />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <SmoothScroll />
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
