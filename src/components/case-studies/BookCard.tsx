import Image from "next/image";
import Link from "next/link";
import { type Project } from "@/lib/types";
import SanityImg from "@/components/global/SanityImg";
import BookCover from "./BookCover";

interface BookCardProps {
  project: Project;
}

/**
 * Warm "paint" placeholder — uses the same gradient language as the rest
 * of the brand instead of grey-on-soft initials. Renders only when a
 * project has no coverImage in Sanity. Initials are kept but rendered
 * with very low contrast so the card still feels editorial rather than
 * empty.
 */
function PlaceholderCover({ title }: { title: string }) {
  const initials = title
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 80% 10%, rgba(198, 177, 147, 0.35), transparent 60%), radial-gradient(80% 100% at 10% 90%, rgba(34, 34, 34, 0.10), transparent 55%), var(--color-soft)",
      }}
    >
      {/* Fine vertical line texture echoing the isotipo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(34,34,34,0.025) 0, rgba(34,34,34,0.025) 1px, transparent 1px, transparent 28px)",
          mixBlendMode: "multiply",
        }}
      />
      <span
        className="absolute font-display"
        style={{
          left: "1.5rem",
          bottom: "1.5rem",
          color: "rgba(34, 34, 34, 0.18)",
          lineHeight: 1,
          fontSize: "clamp(2rem, 4vw, 3.5rem)",
        }}
      >
        {initials}
      </span>
    </div>
  );
}

export default function BookCard({ project }: BookCardProps) {
  const external = Boolean(project.externalUrl);
  const href = project.externalUrl ?? `/case-studies/${project.slug}`;
  const displayClient =
    project.clientVisibility === "Public"
      ? project.clientName
      : project.clientVisibility === "Undisclosed"
      ? "Undisclosed"
      : null;

  // Build the client/year line — only show separator if both pieces are present
  const clientYear = [displayClient, project.year].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      className="group block"
      aria-label={`Open case study: ${project.title}`}
    >
      {/* Book cover — template 1b: full-bleed render + typographic band */}
      <div className="anim-tick relative">
        <BookCover
          collection={project.collectionLabel}
          title={project.title}
          clientYear={clientYear}
        >
          {project.coverSrc ? (
            <Image
              src={project.coverSrc}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <SanityImg
              image={project.coverImage}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              fallback={<PlaceholderCover title={project.title} />}
            />
          )}

          {/* Hover label */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-label text-ink bg-paper px-4 py-2">
              Open Case Study
            </span>
          </div>
        </BookCover>
      </div>
    </Link>
  );
}
