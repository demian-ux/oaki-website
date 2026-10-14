// Shared presentation for the contact block (handoff "contact paths":
// 2b tabs, 1b letter form, 1e grid calendar, 2d received). Values the
// global tokens do not carry are named here once, not scattered.

/** Hairline for the contact plates (a touch darker than --color-line). */
export const HAIRLINE = "#dcd9d3";
/** Unavailable dates, disabled arrows: never text-critical. */
export const DISABLED = "#c4c1bb";
/** Secondary text on negro. */
export const INVERSE_MUTED = "#c9c6bf";
/** Ocre-300: the arrow on negro. */
export const OCRE_ON_NEGRO = "#cfb791";

/** 1px ocre outline, 2px offset, on every button, input and day cell. */
export const FOCUS =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-warm";

/** Colour and background only, 200ms, ease-out. */
export const MOTION = "transition-colors duration-200 ease-out";
