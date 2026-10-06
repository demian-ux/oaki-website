import Link from "next/link";
import {
  CaseEditorialGallery,
  CaseEditorialFigure,
} from "./CaseEditorialLightbox";
import CaseIndexGallery from "./CaseIndexGallery";
import type {
  CaseDraft,
  CaseEditorialImage,
  CaseEditorialRow,
} from "@/lib/case-drafts";
import s from "./CaseEditorial.module.css";

// The editorial case template (01-plantilla-caso-de-estudio.md, approved
// maqueta referencia.html): clean 16:9 hero, small tracked title with the
// drawn ocre period, three-column intro (sheet / text / vertical image),
// justified image rows with no titles, numbers or captions, optional
// interlude, and the "Next project" band on the warm grey. Every image at
// its natural ratio: re-scaled, never cropped.

function Picture({
  img,
  sizes,
  priority = false,
  gallery,
}: {
  img: CaseEditorialImage;
  sizes: string;
  priority?: boolean;
  gallery: CaseEditorialImage[];
}) {
  return (
    <CaseEditorialFigure
      img={img}
      index={gallery.indexOf(img)}
      sizes={sizes}
      priority={priority}
    />
  );
}

function Row({
  row,
  gallery,
}: {
  row: CaseEditorialRow;
  gallery: CaseEditorialImage[];
}) {
  if (row.kind === "film") {
    return (
      <div className={s.row}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={row.poster}
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          <source src={row.src} type="video/mp4" />
        </video>
      </div>
    );
  }
  if (row.kind === "pair") {
    return (
      <div className={`${s.row} ${s.pair}`}>
        {row.images.map((img, i) => (
          <div
            key={img.image.name}
            className={s.pairItem}
            style={{ ["--w" as string]: `${row.widths[i]}%` }}
          >
            <Picture
              img={img}
              gallery={gallery}
              sizes={`(min-width: 821px) ${row.widths[i]}vw, 100vw`}
            />
          </div>
        ))}
      </div>
    );
  }
  if (row.kind === "loose") {
    const align =
      row.align === "center"
        ? s.alignCenter
        : row.align === "right"
          ? s.alignRight
          : s.alignLeft;
    // Inline width: the percentage is content, not a style decision.
    return (
      <div className={s.row}>
        <div
          className={`${s.loose} ${align}`}
          style={{ ["--w" as string]: `${row.width}%` }}
        >
          <Picture
            img={row.image}
            gallery={gallery}
            sizes={`(min-width: 821px) ${row.width}vw, 100vw`}
          />
        </div>
      </div>
    );
  }
  const total = row.images.reduce((n, i) => n + i.ratio, 0);
  return (
    <div className={s.row}>
      {row.images.map((img) => (
        // flex-grow = ratio: images in a row share one height, each taking
        // the width its proportion earns.
        <div key={img.image.name} style={{ flex: `${img.ratio} 1 0%` }}>
          <Picture
            img={img}
            gallery={gallery}
            sizes={`(min-width: 821px) ${Math.round((img.ratio / total) * 100)}vw, 100vw`}
          />
        </div>
      ))}
    </div>
  );
}

export default function CaseEditorialView({ draft }: { draft: CaseDraft }) {
  const e = draft.editorial;
  if (!e) return null;

  // Every image on the page, in reading order, for the lightbox.
  const gallery: CaseEditorialImage[] = [];
  if (e.hero.type === "image") gallery.push(e.hero.image);
  if (e.introImage) gallery.push(e.introImage);
  for (const r of e.rows) {
    if (r.kind === "justified" || r.kind === "pair") gallery.push(...r.images);
    else if (r.kind === "loose") gallery.push(r.image);
  }
  if (e.interlude) gallery.push(e.interlude.image);
  if (e.closingBw) gallery.push(e.closingBw);

  return (
    <CaseEditorialGallery images={gallery}>
      <article className={s.root}>
        {/* 1. Hero: image today, a short muted loop when the case brings one. */}
        <div className={`page-x ${s.hero}`}>
          {e.hero.type === "image" ? (
            <Picture
              img={e.hero.image}
              gallery={gallery}
              sizes="100vw"
              priority
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={e.hero.poster?.image.webp[0].src}
              aria-label={e.hero.alt}
              width={e.hero.poster?.image.naturalWidth}
              height={e.hero.poster?.image.naturalHeight}
            >
              <source src={e.hero.src} type="video/mp4" />
            </video>
          )}
        </div>

        {/* 2. Title */}
        <div className={`page-x ${s.head}`}>
          <h1
            className={`text-case-title reveal ${s.title}`}
            style={{ color: "var(--color-ink)" }}
          >
            {draft.title}
            <span aria-hidden className="dot" style={{ marginLeft: "-0.05em" }}>
              .
            </span>
          </h1>
        </div>

        {/* 3. Intro: sheet / text / air / vertical image */}
        <section className={`page-x ${s.intro}`}>
          <dl className={s.sheet}>
            {e.sheet.map((row) => (
              <div key={row.label}>
                <dt className="coord">{row.label}</dt>
                <dd
                  className="font-serif mt-1"
                  style={{ color: "var(--color-ink)" }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className={s.text}>
            {e.intro.map((p, i) => (
              <p key={i} className="text-body text-muted">
                {p}
              </p>
            ))}
          </div>
          {e.introImage && (
            <div className={s.introImage}>
              <Picture
                img={e.introImage}
                gallery={gallery}
                sizes="(min-width: 821px) 16vw, 100vw"
              />
            </div>
          )}
        </section>

        {/* 4. Image rows */}
        {e.rows.length > 0 && (
          <section className={`page-x ${s.rows}`}>
            {e.rows.map((row, i) => (
              <Row key={i} row={row} gallery={gallery} />
            ))}
          </section>
        )}

        {/* 5. Interlude (optional) */}
        {e.interlude && (
          <section className={`page-x ${s.interlude}`}>
            <div>
              <Picture
                img={e.interlude.image}
                gallery={gallery}
                sizes="(min-width: 821px) 16vw, 100vw"
              />
            </div>
            <div className={s.text}>
              {e.interlude.text.map((p, i) => (
                <p key={i} className="text-body text-muted">
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 6. Closing extras, only when the case asks */}
        {e.closingIndex && draft.library.length > 0 && (
          <section className={`page-x ${s.index}`}>
            <CaseIndexGallery images={draft.library} />
          </section>
        )}
        {e.closingBw && (
          <section className={`page-x ${s.bw}`}>
            <Picture img={e.closingBw} gallery={gallery} sizes="100vw" />
          </section>
        )}

        {/* Next project: always */}
        {e.next && (
          <section className={`page-x ${s.next}`}>
            <div>
              <p className={`coord mb-3 ${s.nextLabel}`}>Next project</p>
              <Link
                href={`/case-studies/${e.next.slug}`}
                className={`text-case-title ${s.nextLink}`}
              >
                {e.next.title}
                <span
                  aria-hidden
                  className="dot"
                  style={{ marginLeft: "-0.05em" }}
                >
                  .
                </span>
              </Link>
            </div>
          </section>
        )}
      </article>
    </CaseEditorialGallery>
  );
}
