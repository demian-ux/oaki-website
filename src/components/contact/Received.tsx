import type { ReactNode } from "react";

// 2d "The headline": the one received screen for both paths. Inktrap claim
// with the ocre dot, the long ocre rule, one muted sentence. No eyebrow.
export default function Received({
  heading,
  detail,
  children,
}: {
  heading: string;
  /** Optional plain line under the headline (the call's time). */
  detail?: string;
  children: ReactNode;
}) {
  return (
    <div className="py-16" role="status">
      <h2
        className="text-volume"
        style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", lineHeight: 0.9 }}
      >
        {heading.replace(/\.$/, "")}
        <span className="dot">.</span>
      </h2>
      {detail && <p className="mt-6 text-[18px] text-ink">{detail}</p>}
      <span className="ocre-rule my-8" style={{ width: 92 }} aria-hidden />
      <div className="text-[22px] leading-[1.5] text-muted max-w-[30ch]">{children}</div>
    </div>
  );
}
