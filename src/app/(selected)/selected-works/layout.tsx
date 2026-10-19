import type { Metadata } from "next";
import Footer from "@/components/global/Footer";
import RevealOnScroll from "@/components/global/RevealOnScroll";
import SmoothScroll from "@/components/global/SmoothScroll";
import { HeroThemeProvider } from "@/components/global/HeroTheme";
import SelectedHeader from "@/components/selected/SelectedHeader";
import { SELECTED_BASE, SELECTED_CONTACT, selectedWorks } from "@/lib/selected-works";

// Selected work: the private sample set, inside the site but apart from
// it. Same fonts, tokens, scroll and reveal engines as the public pages;
// its own header and footer with a closed set of links, and never
// indexed (metadata here, X-Robots-Tag in next.config.ts).

export const metadata: Metadata = {
  title: {
    default: "Selected work | oaki.studio",
    template: "%s | Selected work | oaki.studio",
  },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

const footerLinks = [
  { label: "Selected work", href: SELECTED_BASE },
  ...selectedWorks.map((w) => ({ label: w.short, href: `${SELECTED_BASE}/${w.slug}` })),
  { label: "Contact", href: SELECTED_CONTACT },
];

export default function SelectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeroThemeProvider>
      <SelectedHeader />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <SmoothScroll />
      <RevealOnScroll />
      <Footer links={footerLinks} showSocial={false} />
    </HeroThemeProvider>
  );
}
