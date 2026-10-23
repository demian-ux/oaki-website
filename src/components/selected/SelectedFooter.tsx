"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/global/Footer";
import { SELECTED_BASE, SELECTED_CONTACT, setFromPathname, worksInSet } from "@/lib/selected-works";

// The selected-work footer: the site footer with a closed set of links,
// the current set's landing and cases plus contact, read from the path so
// a client's set never points at another set's cases.

export default function SelectedFooter() {
  const set = setFromPathname(usePathname() ?? SELECTED_BASE);
  const links = [
    { label: "Selected work", href: set.path },
    ...worksInSet(set).map((w) => ({ label: w.short, href: `${SELECTED_BASE}/${w.slug}` })),
    { label: "Contact", href: SELECTED_CONTACT },
  ];
  return <Footer links={links} showSocial={false} />;
}
