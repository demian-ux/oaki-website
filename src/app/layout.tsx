import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSiteSettings } from "@/lib/data";

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

const sangBleu = localFont({
  src: [
    { path: "../../public/fonts/SangBleuBP-Hairline.otf",       weight: "100", style: "normal" },
    { path: "../../public/fonts/SangBleuBP-HairlineItalic.otf", weight: "100", style: "italic" },
    { path: "../../public/fonts/SangBleuBP-Light.otf",          weight: "300", style: "normal" },
  ],
  variable: "--font-sangbleu",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const preloaderText =
    settings.preloaderText ??
    "Everything you see in this website is computer generated.";
  // Escape for embedding inside a single-quoted JS string literal
  const safePreloaderText = preloaderText
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
  return (
    <html
      lang="en"
      className={`h-full antialiased ${neueMontreal.variable} ${ppNeueMachina.variable} ${sangBleu.variable}`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {/* Preloader — shown immediately, before React hydrates */}
        <div id="oaki-loader" className="active" aria-hidden="false" aria-label="Loading">
          <div className="loader-inner">
            <svg className="loader-spin" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e8e5df" strokeWidth="1" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#c6b193"
                strokeWidth="1.5"
                strokeDasharray="30 130"
                strokeLinecap="butt"
                transform="rotate(-90 24 24)"
                className="loader-arc"
              />
            </svg>
            <div className="loader-mark">OAKI STUDIO</div>
            <div className="loader-typewriter" aria-hidden="true">
              <span className="loader-tw-text" id="oaki-loader-tw"></span>
              <span className="loader-tw-caret" id="oaki-loader-caret"></span>
            </div>
          </div>
        </div>
        <script
          // Fonts ready + window.load + min 3s; 6s safety fallback.
          // Also drives the in-loader typewriter line.
          dangerouslySetInnerHTML={{
            __html: `(function(){window.__oakiReady=false;var start=Date.now();var done=false;var msg='${safePreloaderText}';var tw=document.getElementById('oaki-loader-tw');var caret=document.getElementById('oaki-loader-caret');var i=0;function type(){if(!tw)return;if(i<=msg.length){tw.textContent=msg.slice(0,i);i++;setTimeout(type,38);}else if(caret){caret.classList.add('done');}}setTimeout(type,300);function dismiss(){if(done)return;done=true;var l=document.getElementById('oaki-loader');if(l){l.classList.add('loaded');setTimeout(function(){if(l&&l.parentNode){l.style.cssText='display:none !important;';}},650);}window.__oakiReady=true;window.dispatchEvent(new CustomEvent('oaki:loaded'));}function ready(){var elapsed=Date.now()-start;var wait=Math.max(0,5000-elapsed);setTimeout(dismiss,wait);}var fonts=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();var loaded=new Promise(function(r){if(document.readyState==='complete')r();else window.addEventListener('load',r);});Promise.all([fonts,loaded]).then(ready).catch(ready);setTimeout(dismiss,8000);})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
