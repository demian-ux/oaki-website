import type { Metadata } from "next";
import { getHomePage } from "@/lib/data";

const DEFAULT_DESCRIPTION =
  "Architectural narrative studio. 100+ projects across 12 cities and 4 continents. Animation, stills, and film for the pitch, the board, and the jury.";

const OG_HEADLINE = "100+ projects across 12 cities and 4 continents.";
const OG_IMAGE = "/og/oaki-og.png"; // 1200x630 — drop a flagship-project frame here

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();

  const title =
    home.seoTitle ?? "oaki.studio | A studio building architectural narratives";
  const description = home.seoDescription ?? DEFAULT_DESCRIPTION;

  return {
    // Use `absolute` so the root layout's "%s | oaki.studio" template doesn't
    // double-stamp the brand name onto a title that already includes it.
    title: { absolute: title },
    description,
    openGraph: {
      title: OG_HEADLINE,
      description,
      siteName: "oaki.studio",
      type: "website",
      locale: "en_US",
      url: "/",
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: OG_HEADLINE,
      description,
      images: [OG_IMAGE],
    },
  };
}
