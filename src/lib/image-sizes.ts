/**
 * iPad tier for full-viewport images (IPAD_AUDIT_2026-10.md, finding 7).
 *
 * With `sizes="100vw"` an iPad Pro (1366 CSS px, DPR 2) asks for 2732px and
 * gets the 3840 variant of every render. Changing the width lists would also
 * change Mac Retina, so instead the `sizes` string gets a leading clause that
 * only a coarse pointer from 768px up matches: 1024px, which at DPR 2 lands
 * on the 2560 export (1.9x at 1366px, 2.5x in portrait). Phones have their
 * own widths; a mouse never matches the clause, so desktop requests are
 * byte-for-byte what they were.
 */
export const TABLET_FULL_WIDTH = "(pointer: coarse) and (min-width: 768px) 1024px";

export function tabletSizes(sizes: string | undefined): string | undefined {
  if (sizes === "100vw") return `${TABLET_FULL_WIDTH}, 100vw`;
  return sizes;
}
