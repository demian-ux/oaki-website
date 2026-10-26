import Link from "next/link";
import JournalPicture from "@/components/journal/JournalPicture";
import CaseEditorialIndex from "./CaseEditorialIndex";
import CaseMagazineSummary from "./CaseMagazineSummary";
import ClientQuote from "./ClientQuote";
import ContactCta from "@/components/global/ContactCta";
import type { CaseDraft, CaseMagazineImage, CaseMagazinePage } from "@/lib/case-drafts";
import s from "./CaseMagazine.module.css";

// The magazine case template (01-plantilla-v4.md, maquetas in referencias/,
// approved by Diego, 2026-10). Hero, cover, three-column intro, then one
// SHEET per viewport with the case name down the spine on the left; a
// closing Next band. Every image is
// re-scaled into its sheet at natural ratio: never cropped, never deformed,
// never inside the spine. Site tokens throughout; only the proportions are
// the template's own.

function Dot() {
  return <span aria-hidden className={s.dot} />;
}

function Pic({
  img,
  sizes,
  priority = false,
  className,
}: {
  img: CaseMagazineImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <JournalPicture
      image={img.image}
      alt={img.alt}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

/** A diagram or plate with its credit under it, right-aligned. */
function Credited({ img, sizes, className }: { img: CaseMagazineImage; sizes: string; className?: string }) {
  if (!img.credit) return <Pic img={img} sizes={sizes} className={className} />;
  return (
    <figure className={s.fig}>
      <Pic img={img} sizes={sizes} className={className} />
      <figcaption className={s.credit}>{img.credit}</figcaption>
    </figure>
  );
}

/** Images at ONE height: each takes the width its ratio earns (flex-grow =
 *  ratio), and the row is never wider than the cap height allows, so no
 *  image is ever letterboxed or cropped. Used by the double bleed, the
 *  plates and the trio. */
function Justified({
  images,
  cap,
  className,
}: {
  images: CaseMagazineImage[];
  cap: string;
  className: string;
}) {
  const total = images.reduce((n, i) => n + i.ratio, 0);
  return (
    <div
      className={`${s.justified} ${className}`}
      style={{
        ["--r" as string]: total,
        ["--n" as string]: images.length - 1,
        ["--cap" as string]: cap,
      }}
    >
      {images.map((img) => (
        <div key={img.image.name} style={{ flex: `${img.ratio} 1 0%`, minWidth: 0 }}>
          <Credited img={img} sizes={`(min-width: 821px) ${Math.round((img.ratio / total) * 100)}vw, 100vw`} />
        </div>
      ))}
    </div>
  );
}

const KIND_CLASS: Record<CaseMagazinePage["kind"], string> = {
  bleed: s.bleed,
  "bleed-two": s.bleedTwo,
  plate: s.plate,
  plates: s.plates,
  pair: s.pair,
  color: s.color,
  band: s.band,
  dark: s.dark,
  quote: s.quote,
  text: s.text,
  "plate-bleed": s.plateBleed,
  film: s.film,
  afterward: s.afterward,
};

function SheetBody({ page }: { page: CaseMagazinePage }) {
  switch (page.kind) {
    case "bleed":
      return <Pic img={page.image} sizes="100vw" />;
    case "bleed-two":
      return <Justified images={page.images} cap="88svh" className={s.rowBleed} />;
    case "plate":
      return <Pic img={page.image} sizes="100vw" />;
    case "plates":
      return <Justified images={page.images} cap="80svh" className={s.rowPlates} />;
    case "pair": {
      const big = <Pic key="big" img={page.big} sizes="100vw" className={s.big} />;
      const small = <Pic key="small" img={page.small} sizes="100vw" className={s.small} />;
      return <>{page.smallFirst ? [small, big] : [big, small]}</>;
    }
    case "color":
      return (
        <>
          {page.images.map((img) => (
            <Pic key={img.image.name} img={img} sizes="100vw" />
          ))}
        </>
      );
    case "band":
      return (
        <div className={s.bandBox}>
          <Pic img={page.big} sizes="100vw" className={s.big} />
          <div className={s.rest}>
            <Pic img={page.small} sizes="100vw" className={s.small} />
          </div>
        </div>
      );
    case "dark":
      return (
        <>
          {page.quote ? (
            <figure className={s.qimg}>
              <Pic img={page.image} sizes="100vw" />
            </figure>
          ) : (
            <Pic img={page.image} sizes="100vw" />
          )}
          {page.quote && <ClientQuote text={page.quote} by={page.cite} inverted className={s.quoteBox} />}
        </>
      );
    case "quote":
      return (
        <>
          <figure className={s.qimg}>
            <Pic img={page.image} sizes="100vw" />
          </figure>
          <ClientQuote text={page.quote} by={page.cite} className={s.quoteBox} />
        </>
      );
    case "text":
      return (
        <>
          <div className={s.cap}>
            {page.figures.length > 0 && (
              <div className={s.nums}>
                {page.figures.map((f) => (
                  <div key={f.value + f.label}>
                    <b>{f.value}</b>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            )}
            {page.quote && <ClientQuote text={page.quote} by={page.quoteBy} className={s.quoteBox} />}
            {page.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {page.under && (
              <div className={s.under}>
                <Credited img={page.under} sizes="100vw" />
              </div>
            )}
          </div>
          <div className={s.page}>
            {page.right.length > 1 ? (
              <Justified images={page.right} cap="72svh" className={s.rowTrio} />
            ) : (
              page.right.map((img) => <Credited key={img.image.name} img={img} sizes="100vw" />)
            )}
          </div>
        </>
      );
    case "plate-bleed":
      return (
        <>
          <div className={s.wrapl}>
            <Pic img={page.left} sizes="100vw" />
          </div>
          <div className={s.bleedr}>
            <Pic img={page.right} sizes="100vw" />
          </div>
        </>
      );
    case "film":
      return (
        <video
          className={s.filmBox}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={page.poster}
          style={{ aspectRatio: String(page.ratio) }}
        >
          <source src={page.src} type="video/mp4" />
        </video>
      );
    case "afterward":
      return (
        <div className={s.afterIn}>
          <div className={s.afterK}>Afterward</div>
          {page.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {page.quote && <ClientQuote text={page.quote.text} by={page.quote.by} className={s.afterQ} />}
          {page.figures.length > 0 && (
            <div className={s.afterN}>
              {page.figures.map((f) => (
                <div key={f.value + f.label}>
                  <b>{f.value}</b>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  }
}

function sheetClass(page: CaseMagazinePage): string {
  const cls = [s.sheet, KIND_CLASS[page.kind]];
  if (page.kind === "color") {
    if (page.images.length > 1) cls.push(s.colorDuo);
    else if (page.align === "right") cls.push(s.colorRight);
    else if (page.align === "center") cls.push(s.colorCenter);
  }
  if (page.kind === "dark" && page.quote) cls.push(s.darkQuote);
  return cls.join(" ");
}

interface CaseMagazineViewProps {
  draft: CaseDraft;
  /** Where case pages live (the public library, or a selected-work set). */
  caseBase?: string;
  /** Where "Start a project" goes. */
  contactHref?: string;
  /** The Next band: the public chain, or a set's own. */
  next?: { slug: string; title: string; byline?: string } | null;
}

export default function CaseMagazineView({
  draft,
  caseBase = "/case-studies",
  contactHref = "/contact",
  next = null,
}: CaseMagazineViewProps) {
  const m = draft.magazine;
  if (!m) return null;

  return (
    <>
      <article className={s.root}>
        {/* 1. Hero: 16:9 at the site's side margins, height by ratio. */}
        <div className={`page-x ${s.hero}`}>
          {m.hero.type === "image" ? (
            <Pic img={m.hero.image} sizes="100vw" priority />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={m.hero.posterSrc}
              aria-label={m.hero.alt}
              style={{ aspectRatio: String(m.hero.ratio) }}
            >
              <source src={m.hero.src} type="video/mp4" />
            </video>
          )}
        </div>

        {/* 2. Cover: the title with the drawn period, then the summary. The
            maqueta's section line ("The X Collection · No. NN · City, Year")
            is not shown (Demi 2026-10-26); the file keeps `kicker:` as data. */}
        <header className={s.opener}>
          <h1 className={`${s.title} ${m.titleSize === "short" ? s.titleShort : ""}`}>
            {draft.title}
            <Dot />
          </h1>
          {m.summary && <CaseMagazineSummary text={m.summary} className={s.summary} />}
        </header>

        {/* 3. Intro: sheet / text / air / vertical image. */}
        <section className={s.intro}>
          <dl className={s.ficha}>
            {m.sheet.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className={s.introText}>
            {m.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {m.introImage && (
            <div className={s.introImage}>
              <Pic img={m.introImage} sizes="(min-width: 821px) 16vw, 100vw" />
            </div>
          )}
        </section>

        {/* 4. The sheets. */}
        <section className={s.sheets}>
          {m.pages.map((page, i) => (
            <div key={i} className={sheetClass(page)}>
              <span className={s.folio} aria-hidden>
                {draft.title}
              </span>
              <SheetBody page={page} />
            </div>
          ))}
        </section>

        {/* 5. Index (optional). */}
        {m.index.length > 0 && <CaseEditorialIndex images={m.index} />}

        {/* 6. Closing: the Next band (Demi 2026-10-26: no "Thank you for reading"). */}
        {next && (
          <section className={`page-x ${s.next}`}>
            <div>
              <p className={s.nextLabel}>Next project</p>
              <Link href={`${caseBase}/${next.slug}`} className={s.nextLink}>
                {next.title} <span aria-hidden>&rarr;</span>
              </Link>
            </div>
            {next.byline && <p className={s.nextMeta}>{next.byline}</p>}
          </section>
        )}
      </article>
      <ContactCta href={contactHref} />
    </>
  );
}
