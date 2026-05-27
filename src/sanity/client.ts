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
    next: preview ? undefined : (tags ? { tags } : undefined),
    cache: preview ? "no-store" : undefined,
  });
}
