import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityConfig } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any;

export const sanityClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_READ_TOKEN,
});

export const previewClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "previewDrafts",
  useCdn: false,
  stega: {
    enabled: true,
    studioUrl: "/studio",
  },
});

const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  preview = false,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  preview?: boolean;
}): Promise<T> {
  const activeClient = preview ? previewClient : sanityClient;
  return activeClient.fetch<T>(query, params, {
    // Preview mode: always fresh.
    // Production reads: 10s ISR window so Studio publishes propagate fast
    // without hammering Sanity on every request.
    next: preview
      ? undefined
      : { revalidate: 10, ...(tags ? { tags } : {}) },
    cache: preview ? "no-store" : undefined,
  });
}
