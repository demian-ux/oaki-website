import s from "./ClientQuote.module.css";

// The one voice for a client's words anywhere on the site, taken from the
// home page's Peer Band (PeerBand.module.css): SangBleu Light, large,
// centered, with the attribution under it as "Name – role, company" in the
// sans, the name in ink and the rest muted. Case studies (both templates)
// render every quote through this so they all read the same.

interface ClientQuoteProps {
  text: string;
  /** "Name, role, company": the first comma splits the name from the rest. */
  by?: string;
  /** On the dark sheet: pale type, the role in the spine's grey. */
  inverted?: boolean;
  className?: string;
}

export function splitAttribution(by: string): { name: string; role?: string } {
  const i = by.indexOf(",");
  if (i < 0) return { name: by.trim() };
  return { name: by.slice(0, i).trim(), role: by.slice(i + 1).trim() };
}

export default function ClientQuote({ text, by, inverted = false, className }: ClientQuoteProps) {
  const who = by ? splitAttribution(by) : null;
  return (
    <figure className={`${s.block} ${inverted ? s.inverted : ""} ${className ?? ""}`}>
      <blockquote className={s.quote}>&ldquo;{text}&rdquo;</blockquote>
      {who && (
        <figcaption className={s.attribution}>
          <span className={s.author}>{who.name}</span>
          {who.role && <span className={s.role}> &ndash; {who.role}</span>}
        </figcaption>
      )}
    </figure>
  );
}
