import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a second dev server run alongside the main one (Next locks per
  // distDir). Unset in normal use and in production builds.
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
