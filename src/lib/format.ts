// Shared display formatters. Server-side only concerns — raw values (ISO
// dates) stay in the types so sorting and metadata keep working.

const journalDateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  // Sanity `date` fields are date-only ISO strings; formatting in UTC keeps
  // the month from shifting a day across timezones.
  timeZone: "UTC",
});

/** "2026-07-29" → "Jul 2026". Returns the input untouched if it doesn't parse. */
export function formatJournalDate(iso?: string): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return journalDateFormat.format(parsed);
}
