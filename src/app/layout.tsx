import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueMontreal = localFont({
  src: [
    { path: "../../public/fonts/NeueMontreal-Light.otf",        weight: "300", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-LightItalic.otf",  weight: "300", style: "italic" },
    { path: "../../public/fonts/NeueMontreal-Regular.otf",      weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-RegularItalic.otf",weight: "400", style: "italic" },
    { path: "../../public/fonts/NeueMontreal-Medium.otf",       weight: "500", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../../public/fonts/NeueMontreal-Bold.otf",         weight: "700", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-BoldItalic.otf",   weight: "700", style: "italic" },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

const ppNeueMachina = localFont({
  src: [
    { path: "../../public/fonts/PPNeueMachina-PlainLight.otf",     weight: "300", style: "normal" },
    { path: "../../public/fonts/PPNeueMachina-PlainRegular.otf",   weight: "400", style: "normal" },
    { path: "../../public/fonts/PPNeueMachina-PlainUltrabold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-pp-neue-machina",
  display: "swap",
});

// STRIA 4.1: PP NeueMachina Inktrap — the "loud" display voice. Inktrap
// Ultrabold leads brand surfaces (uppercase, tight, full volume); Plain
// stays the calm second. See brand/Oaki Brand Guidelines 4.1.html §04.
const ppNeueMachinaInktrap = localFont({
  src: [
    { path: "../../public/fonts/PPNeueMachina-InktrapLight.otf",     weight: "300", style: "normal" },
    { path: "../../public/fonts/PPNeueMachina-InktrapRegular.otf",   weight: "400", style: "normal" },
    { path: "../../public/fonts/PPNeueMachina-InktrapUltrabold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-pp-neue-machina-inktrap",
  display: "swap",
});

const sangBleu = localFont({
  src: [
    { path: "../../public/fonts/SangBleuBP-Hairline.otf",       weight: "100", style: "normal" },
    { path: "../../public/fonts/SangBleuBP-HairlineItalic.otf", weight: "100", style: "italic" },
    { path: "../../public/fonts/SangBleuBP-Light.otf",          weight: "300", style: "normal" },
  ],
  variable: "--font-sangbleu",
  display: "swap",
});

// STRIA 4.1: Geist Mono — the coordinate / system voice (eyebrows, indices,
// counts, doc numbers, tags). Self-hosted (OFL); replaces the system-mono
// placeholder so the coordinate grammar is consistent cross-platform.
const geistMono = localFont({
  src: [
    { path: "../../public/fonts/geist/GeistMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/geist/GeistMono-Medium.woff2",  weight: "500", style: "normal" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "oaki.studio | A studio building architectural narratives",
    template: "%s | oaki.studio",
  },
  description:
    "Architectural narrative studio. 100+ projects across 12 cities and 4 continents. Animation, stills, and film for the pitch, the board, and the jury.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
  ),
  openGraph: {
    siteName: "oaki.studio",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${neueMontreal.variable} ${ppNeueMachina.variable} ${ppNeueMachinaInktrap.variable} ${sangBleu.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
