import Link from "next/link";
import JournalPicture from "@/components/journal/JournalPicture";
import { getProjectImages } from "@/lib/journal-images";
import { SELECTED_BASE, selectedWorks } from "@/lib/selected-works";
import s from "./SelectedIndex.module.css";

// The index: each case as one cover at its natural ratio with its coord,
// title and one sentence beside it, the covers taking turns on the left
// and the right. The library's cards are books; here the images are the
// argument, so they get the width.

export default function SelectedIndex() {
  return (
    <section className="page-x section-y" aria-label="Selected work index">
      <div className={s.list}>
        {selectedWorks.map((w, i) => {
          const image = getProjectImages(w.cover.project).find(
            (img) => img.name === w.cover.name && img.set === null
          );
          if (!image) return null;
          const n = String(i + 1).padStart(2, "0");
          return (
            <Link
              key={w.slug}
              href={`${SELECTED_BASE}/${w.slug}`}
              className={`${s.card} ${i % 2 === 1 ? s.flip : ""} reveal`}
              aria-label={`Open ${w.title}`}
            >
              <div className={s.cover}>
                <JournalPicture
                  image={image}
                  alt={w.title}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  priority={i === 0}
                />
              </div>
              <div className={s.side}>
                <p className="coord">
                  {n} · {w.coord}
                </p>
                <h2 className={`text-case-title ${s.title}`}>
                  {w.title}
                  <span aria-hidden className="dot" style={{ marginLeft: "-0.05em" }}>
                    .
                  </span>
                </h2>
                <p className="text-body text-muted">{w.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
