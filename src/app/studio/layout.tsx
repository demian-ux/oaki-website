import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Studio mounts directly into the root layout's <body>. We deliberately do
// NOT render an inner <html>/<body> here — Next.js root layout already
// provides them. Nesting them caused the hydration warning we kept seeing.
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
