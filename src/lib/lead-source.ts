import { SELECTED_BASE, SELECTED_CONTACT, getSelectedWork, selectedWorkSlugs } from "./selected-works";

// Where a lead came from. The public /contact sends nothing; inside
// selected work the form and the booking picker carry source =
// "selected-works" plus `from`: the case the visitor arrived from
// (ContactCta passes ?from=<slug>) or "booth" (the iPad on the stand).
// Pure data, so client components, API routes and the calendar event
// builder can all import it.

export const LEAD_SOURCE_SELECTED = "selected-works";
export const LEAD_FROM_BOOTH = "booth";

export interface Lead {
  source?: string;
  from?: string;
}

/** The `from` values the selected-work contact page accepts. */
export function leadFromParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return undefined;
  if (v === LEAD_FROM_BOOTH || selectedWorkSlugs.includes(v)) return v;
  return undefined;
}

/** The contact URL that carries the origin: /selected-works/contact?from=goldman. */
export function selectedContactHref(from?: string, hash?: "book" | "brief"): string {
  const query = from ? `?from=${encodeURIComponent(from)}` : "";
  return `${SELECTED_CONTACT}${query}${hash ? `#${hash}` : ""}`;
}

/** One line for the notification email and the calendar invite:
 *  "Selected work, from Goldman", "Selected work, the booth iPad", or
 *  null for the public site. */
export function leadLabel(lead: Lead): string | null {
  if (lead.source !== LEAD_SOURCE_SELECTED) return lead.source ? `${lead.source}${lead.from ? `, from ${lead.from}` : ""}` : null;
  if (lead.from === LEAD_FROM_BOOTH) return "Selected work, the booth iPad (BDNY)";
  const work = lead.from ? getSelectedWork(lead.from) : undefined;
  return work ? `Selected work, from ${work.title}` : "Selected work";
}

/** The path the lead was sent from, for "Booked from oaki.studio/...". */
export function leadPath(lead: Lead): string {
  if (lead.source !== LEAD_SOURCE_SELECTED) return "/contact";
  if (lead.from === LEAD_FROM_BOOTH) return `${SELECTED_BASE}/booth`;
  return lead.from && getSelectedWork(lead.from) ? `${SELECTED_BASE}/${lead.from}` : SELECTED_CONTACT;
}
