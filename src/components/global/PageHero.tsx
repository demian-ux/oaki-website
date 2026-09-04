// Index hero shared by the secondary pages (Case Studies, Journal, About,
// Contact): the page name as one huge statement on the left, the lede
// right-aligned opposite it, with an optional coord counter underneath.
interface PageHeroProps {
  title: string;
  lede: string;
  /** Optional coord line under the lede (e.g. "20 case studies"). */
  counter?: string;
}

export default function PageHero({ title, lede, counter }: PageHeroProps) {
  return (
    <section className="page-x pt-24 pb-20 lg:pt-32 lg:pb-28 border-b border-line">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16">
        {/* Bigger than .text-statement: the page name is the hero, sized to
            read at the reference's scale (~7vw on desktop). */}
        <h1
          className="text-statement text-volume reveal shrink-0"
          style={{ fontSize: "clamp(2.75rem, 7vw, 7.5rem)" }}
        >
          {title.replace(/\.$/, "")}
          <span className="dot">.</span>
        </h1>
        {/* No width cap: each sentence must hold its own single line. */}
        <div className="lg:text-right">
          {/* One sentence per line: split on sentence-ending periods. */}
          <p className="text-lede text-muted">
            {/* Manual "\n" breaks win; otherwise one sentence per line. */}
            {(lede.includes("\n")
              ? lede.split("\n")
              : lede.match(/[^.]+\.?/g) ?? [lede]
            ).map((s, i) => (
              <span key={i} className="block">
                {s.trim()}
              </span>
            ))}
          </p>
          {counter && <p className="coord text-muted mt-4">{counter}</p>}
        </div>
      </div>
    </section>
  );
}
