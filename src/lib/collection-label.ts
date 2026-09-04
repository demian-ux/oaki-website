/** Canonical display form for collection labels: "The X Collection",
 *  Title Case, as the hero shelf writes it. Sanity data sometimes stores
 *  the label without the article ("Residential Collection"). */
export function collectionDisplay(label?: string | null): string | null {
  if (!label) return null;
  const t = label.trim();
  if (!t) return null;
  return /^the\s/i.test(t) ? t : `The ${t}`;
}
