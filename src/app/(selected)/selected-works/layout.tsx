import type { Metadata } from "next";
import RevealOnScroll from "@/components/global/RevealOnScroll";
import SmoothScroll from "@/components/global/SmoothScroll";
import { HeroThemeProvider } from "@/components/global/HeroTheme";
import SelectedFooter from "@/components/selected/SelectedFooter";
import SelectedHeader from "@/components/selected/SelectedHeader";

// Selected work: the private sample sets, inside the site but apart from
// it. Same fonts, tokens, scroll and reveal engines as the public pages;
// its own header and footer with a closed set of links (the current
// set's), and never indexed (metadata here, X-Robots-Tag in
// next.config.ts).

export const metadata: Metadata = {
  title: {
    default: "Selected work | oaki.studio",
    template: "%s | Selected work | oaki.studio",
  },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function SelectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeroThemeProvider>
      <SelectedHeader />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <SmoothScroll />
      <RevealOnScroll />
      <SelectedFooter />
    </HeroThemeProvider>
  );
}
