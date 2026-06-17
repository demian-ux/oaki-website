import { type CSSProperties } from "react";

interface LogotipoProps {
  /** Render the white-on-dark variant (for inverted headers / dark grounds). */
  inverted?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The logotipo — the dominant WORD mark (Brand Guidelines 4.1 §01).
 *
 * As of 4.1 the mark is the word alone: lowercase "oaki" in PP NeueMachina
 * Inktrap Ultrabold with the ocre dot. The demoted "studio" sub-label is
 * dropped from the canonical lockup. Typography lives in the `.logotipo`
 * utility (globals.css); size via `font-size` on the wrapper.
 *
 * Decorative — wrap it in a link that carries the accessible label.
 */
export default function Logotipo({
  inverted = false,
  className = "",
  style,
}: LogotipoProps) {
  return (
    <span
      className={`logotipo ${inverted ? "inv" : ""} ${className}`}
      style={style}
      aria-hidden="true"
    >
      oaki<span className="dot">.</span>
    </span>
  );
}
