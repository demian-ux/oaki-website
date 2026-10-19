import type { Metadata } from "next";
import Booth, { type BoothCase } from "@/components/selected/Booth";
import { SELECTED_BASE, selectedWorks } from "@/lib/selected-works";
import { coverSrc } from "@/lib/selected-works-shelf";

// /selected-works/booth: the iPad on the BDNY stand. Its own route group
// so it gets none of the selected-work chrome (header, footer, smooth
// scroll, reveal): one fixed screen, the three cases in a loop, films
// muted on autoplay, and a big "Book a call". Never indexed (metadata
// here, X-Robots-Tag in next.config.ts), never linked from anywhere.

export const metadata: Metadata = {
  title: "Stand | Selected work",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

// What each case shows, in the set's own order (src/lib/selected-works.ts).
// Pavilion Grove: the film, one full pass. Goldman: five stills, six
// seconds each. The Point: the five-second colonnade clip, looped for a
// while.
const media: Record<string, (work: (typeof selectedWorks)[number]) => BoothCase["media"] | null> = {
  "pavilion-grove": () => ({
    kind: "video",
    src: "/video/pavilion-grove/film.mp4",
    poster: "/video/pavilion-grove/film-poster.webp",
    dwellMs: 80_000,
  }),
  goldman: () => {
    const names: [string, string][] = [
      ["view-01-gateway", "The Gateway, street approach"],
      ["view-05-mixer", "The Mixer atrium"],
      ["view-14-the-mixer-night", "The Mixer at night"],
      ["view-09-dininghall", "Dining Hall"],
      ["view-13-the-mansion", "The Mansion"],
    ];
    const stills = names.flatMap(([name, alt]) => {
      const src = coverSrc("goldman", name);
      return src ? [{ src, alt }] : [];
    });
    return stills.length ? { kind: "stills", stills, eachMs: 6_000 } : null;
  },
  "the-point": () => ({
    kind: "video",
    src: "/video/the-point/hero-tall.mp4",
    poster: "/video/the-point/hero-tall-poster.webp",
    dwellMs: 20_000,
  }),
};

export default function BoothPage() {
  const cases: BoothCase[] = selectedWorks.flatMap((w, i) => {
    const m = media[w.slug]?.(w) ?? null;
    if (!m) return [];
    return [
      {
        slug: w.slug,
        n: String(i + 1).padStart(2, "0"),
        coord: w.coord,
        title: w.title,
        blurb: w.blurb,
        href: `${SELECTED_BASE}/${w.slug}`,
        media: m,
      },
    ];
  });
  return <Booth cases={cases} />;
}
