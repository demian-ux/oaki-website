import { type CSSProperties, type ReactNode } from "react";

type SectionLabelTone = "muted" | "ink" | "warm";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
  tone?: SectionLabelTone;
  style?: CSSProperties;
}

const toneClass: Record<SectionLabelTone, string> = {
  muted: "text-muted",
  ink: "text-ink",
  warm: "text-warm-deep",
};

/**
 * Small uppercase sans-serif label used for section headers, metadata
 * keys, and category tags throughout the site.
 *
 * Typography comes from the `.text-label` utility (font, size, weight,
 * letter-spacing, uppercase). Only the color and element type vary.
 */
export default function SectionLabel({
  children,
  className = "",
  as: Tag = "p",
  tone = "muted",
  style,
}: SectionLabelProps) {
  return (
    <Tag className={`text-label ${toneClass[tone]} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
