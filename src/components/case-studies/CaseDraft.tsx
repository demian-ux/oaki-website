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
    // w-fit + contain: the plate hugs the image at its natural ratio, capped
    // to the viewport, centered in the column with air around it (Mir-style).
    return (
      <div className="relative frame-plate w-fit max-w-full mx-auto">
        <JournalPicture
          image={slot.image}
          alt={slot.label}
          sizes="(min-width: 1280px) 1100px, 100vw"
          priority={priority}
          contain
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
    <section className="page-x py-10 lg:py-16">
      <div
        className={
          pair && slots.length === 2
            ? "mx-auto grid grid-cols-1 sm:grid-cols-2 items-center gap-8 lg:gap-12"
            : "mx-auto flex flex-col gap-16 lg:gap-24"
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
  if (paragraphs.length === 0) return null;
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

export default function CaseDraftView({
  draft,
  showGaps = false,
}: {
  draft: CaseDraft;
  /** Token previews render [GAP …] markers so Demi reviews in place; the
   *  public route never does — an unfilled section is hidden entirely. */
  showGaps?: boolean;
}) {
  const metaLine = [draft.collection, draft.location, draft.year]
    .filter((v) => v && v !== "GAP" && v !== "Undisclosed")
    .join(" · ");
  const bySection = (name: string) => {
    const sec = draft.sections.find((s) => s.heading.toLowerCase() === name);
    if (!sec || showGaps) return sec;
    const paragraphs = sec.paragraphs.filter((p) => !p.trimStart().startsWith("[GAP"));
    return paragraphs.length > 0 ? { ...sec, paragraphs } : undefined;
  };
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
          <h1 className="text-article-title reveal">
            {draft.title}
            <span aria-hidden className="dot" style={{ marginLeft: "-0.05em" }}>
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

      {/* 01 · hero — contained like the body plates: natural ratio, capped to
          the viewport, air around it instead of full bleed. */}
      <section className="page-x pt-4 lg:pt-8">
        {draft.slots[0]?.image ? (
          <div className="relative w-fit max-w-full mx-auto">
            <JournalPicture
              image={draft.slots[0].image}
              alt={draft.slots[0].label}
              sizes="(min-width: 1536px) 1400px, 100vw"
              priority
              contain
            />
            <span className="tag-negro absolute bottom-0 left-0">
              01 · {draft.slots[0].label}
            </span>
          </div>
        ) : (
          draft.slots[0] && <Slot slot={draft.slots[0]} priority />
        )}
      </section>

      {setup && <Prose heading="Setup" paragraphs={setup.paragraphs} />}
      <Slots slots={s(2)} />
      {tension && <Prose heading="Tension" paragraphs={tension.paragraphs} />}
      <Slots slots={[...s(3), ...s(4), ...s(5)]} />
      {approach && <Prose heading="Approach" paragraphs={approach.paragraphs} />}
      <Slots slots={[...s(6), ...s(7)]} pair />
      <Slots slots={[...s(8), ...s(9)]} pair />

      {/* The film — the moving layer, closing the walk before the outcome.
          Muted loop; the poster stands in for reduced-motion and slow loads. */}
      {draft.video && (
        <section className="page-x py-10 lg:py-16">
          <div className="relative frame-plate w-fit max-w-full mx-auto">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={draft.video.poster}
              style={{ maxWidth: "100%", display: "block", maxHeight: "82svh" }}
            >
              <source src={draft.video.src} type="video/mp4" />
            </video>
            <span className="tag-negro absolute left-0 bottom-0">
              Film · {draft.video.label}
            </span>
          </div>
        </section>
      )}

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
