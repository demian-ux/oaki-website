import JournalPicture from "@/components/journal/JournalPicture";
import type { CaseDraft, CaseImageSlot } from "@/lib/case-drafts";

// Draft-review renderer for the repo case studies (content/cases/*.md).
// Follows the Article design language: coord meta line, calm Plain headline
// with the ocre period, single centered measure, negro figure tags, framed
// plates, baseline credits. The ten-slot arc interleaves with the sections:
// hero → Setup → 2 → Tension → 3-5 → Approach → 6-8 → 9 → Outcome → 10.
// GAP slots hold their place as labeled frames so the review reads complete.

const MEASURE = 820;

function Slot({ slot, priority = false }: { slot: CaseImageSlot; priority?: boolean }) {
  if (slot.image) {
    return (
      <div className="relative frame-plate">
        <JournalPicture
          image={slot.image}
          alt={slot.label}
          sizes="(min-width: 1280px) 1100px, 100vw"
          priority={priority}
        />
        <span className="tag-negro absolute left-0 bottom-0">
          {String(slot.n).padStart(2, "0")} · {slot.label}
        </span>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-center border border-line relative"
      style={{ aspectRatio: "3 / 2", background: "var(--color-gris)" }}
    >
      <p className="text-meta text-muted max-w-md text-center px-6">
        Image to come: {slot.label}
      </p>
      <span className="tag-negro absolute left-0 bottom-0">
        {String(slot.n).padStart(2, "0")}
      </span>
    </div>
  );
}

function Slots({ slots, pair = false }: { slots: CaseImageSlot[]; pair?: boolean }) {
  if (slots.length === 0) return null;
  return (
    <section className="page-x py-8 lg:py-12">
      <div
        className={
          pair && slots.length === 2
            ? "mx-auto grid grid-cols-1 sm:grid-cols-2 items-start gap-6"
            : "mx-auto flex flex-col gap-12"
        }
        style={{ maxWidth: 1100 }}
      >
        {slots.map((s) => (
          <Slot key={s.n} slot={s} />
        ))}
      </div>
    </section>
  );
}

function Prose({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <section className="page-x py-10 lg:py-14">
      <div className="mx-auto" style={{ maxWidth: MEASURE }}>
      <p className="coord mb-6">{heading}</p>
        {paragraphs.map((p, i) =>
          p.startsWith("[GAP") ? (
            <p
              key={i}
              className="text-meta mb-5 px-4 py-3"
              style={{
                borderLeft: "2px solid var(--color-warm)",
                background: "var(--color-warm-pale)",
                color: "var(--color-warm-deep)",
              }}
            >
              {p}
            </p>
          ) : (
            <p key={i} className="text-body mb-5" style={{ maxWidth: "62ch" }}>
              {p}
            </p>
          )
        )}
      </div>
    </section>
  );
}

export default function CaseDraftView({ draft }: { draft: CaseDraft }) {
  const metaLine = [draft.collection, draft.location, draft.year]
    .filter((v) => v && v !== "GAP" && v !== "Undisclosed")
    .join(" · ");
  const bySection = (name: string) =>
    draft.sections.find((s) => s.heading.toLowerCase() === name);
  const setup = bySection("setup");
  const tension = bySection("tension");
  const approach = bySection("approach");
  const outcome = bySection("outcome");
  const s = (n: number) => draft.slots.filter((x) => x.n === n);

  return (
    <article>
      {/* Masthead */}
      <section className="page-x pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="mx-auto" style={{ maxWidth: MEASURE }}>
          <p className="coord reveal mb-8">{metaLine}</p>
          <h1
            className="reveal"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.125rem, 5.5vw, 4.5rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.01em",
              textTransform: "none",
              textWrap: "balance",
            }}
          >
            {draft.title}
            <span aria-hidden style={{ color: "var(--color-warm-500)", marginLeft: "-0.05em" }}>
              .
            </span>
          </h1>
          {draft.subtitle && (
            <p className="text-lede text-muted mt-8" style={{ maxWidth: "52ch" }}>
              {draft.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* 01 · hero */}
      <section className="pt-4 lg:pt-8">
        {draft.slots[0]?.image ? (
          <div className="relative">
            <JournalPicture
              image={draft.slots[0].image}
              alt={draft.slots[0].label}
              sizes="100vw"
              priority
            />
            <span className="tag-negro absolute bottom-0 left-8 lg:left-12">
              01 · {draft.slots[0].label}
            </span>
          </div>
        ) : (
          draft.slots[0] && (
            <div className="page-x">
              <Slot slot={draft.slots[0]} priority />
            </div>
          )
        )}
      </section>

      {setup && <Prose heading="Setup" paragraphs={setup.paragraphs} />}
      <Slots slots={s(2)} />
      {tension && <Prose heading="Tension" paragraphs={tension.paragraphs} />}
      <Slots slots={[...s(3), ...s(4), ...s(5)]} />
      {approach && <Prose heading="Approach" paragraphs={approach.paragraphs} />}
      <Slots slots={[...s(6), ...s(7)]} pair />
      <Slots slots={[...s(8), ...s(9)]} pair />
      {outcome && <Prose heading="Outcome" paragraphs={outcome.paragraphs} />}
      <Slots slots={s(10)} />

      {/* Credits — the 2px negro baseline */}
      {draft.credits.length > 0 && (
        <section className="page-x py-12 lg:py-16">
          <div className="mx-auto baseline-rule pt-4" style={{ maxWidth: MEASURE }}>
            <p className="coord mb-6">Credits</p>
            <dl>
              {draft.credits.map((c) => (
                <div
                  key={c.label}
                  className="flex flex-col sm:flex-row sm:gap-6 py-2 border-b border-line last:border-b-0"
                >
                  <dt className="text-meta sm:w-48 shrink-0">{c.label}</dt>
                  <dd className="text-body">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </article>
  );
}
