import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server run alongside the main one (Next locks per
  // distDir). Unset in normal use and in production builds.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Selected work (the private sample site, Vercel project oaki-selected-work)
  // is served under /selected-works on this domain. Static HTML with relative
  // links, so the bare path lands on index.html to keep those links resolving.
  async redirects() {
    return [
      { source: "/selected-works", destination: "/selected-works/index.html", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/selected-works/:path*", destination: "https://oaki-selected-work.vercel.app/:path*" },
    ];
  },
  async headers() {
    return [
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
