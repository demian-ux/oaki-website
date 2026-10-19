import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server run alongside the main one (Next locks per
  // distDir). Unset in normal use and in production builds.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Selected work (the private sample set) lives in this app under
  // /selected-works (src/app/(selected)), replacing the static site that
  // used to be proxied from the oaki-selected-work Vercel project. Its old
  // page URLs keep resolving. Never indexed, never linked from the public nav.
  async redirects() {
    return [
      { source: "/selected-works/index.html", destination: "/selected-works", permanent: true },
      { source: "/selected-works/:slug.html", destination: "/selected-works/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/selected-works", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/selected-works/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
