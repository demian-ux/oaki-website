import { type Phase, type SanityImage } from "@/lib/types";
import SanityImg from "@/components/global/SanityImg";
import SectionLabel from "@/components/global/SectionLabel";

interface PhaseSectionProps {
  phase: Phase;
}

function PhasePlaceholderImage({ label }: { label: string }) {
  return (
    <div
      className="w-full h-full flex items-end p-8 bg-soft"
      style={{ minHeight: "360px" }}
    >
      <SectionLabel as="span">{label}</SectionLabel>
    </div>
  );
}

function PhaseImage({
  image,
  label,
  className,
  sizes,
}: {
  image: SanityImage | null | undefined;
  label: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <SanityImg
      image={image}
      fill
      sizes={sizes ?? "100vw"}
      className={className ?? "object-cover"}
      fallback={<PhasePlaceholderImage label={label} />}
    />
  );
}

function PhaseHeader({ phase }: { phase: Phase }) {
  return (
    <div className="mb-12">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="coord">
          PHASE {phase.phaseNumber}
        </span>
        <span className="coord" style={{ color: "var(--color-muted)" }}>{phase.layoutType}</span>
      </div>
      <h2 className="text-mode-title text-volume reveal">{phase.phaseTitle}</h2>
      {phase.description && (
        <p className="text-editorial text-muted mt-4 max-text">
          {phase.description}
        </p>
      )}
      {phase.introText && (
        <p
          className="text-editorial text-muted mt-4 max-text"
          style={{ whiteSpace: "pre-line" }}
        >
          {phase.introText}
        </p>
      )}
    </div>
  );
}

function FullscreenLayout({ phase }: { phase: Phase }) {
  return (
    <div>
      <PhaseHeader phase={phase} />
      {phase.quote && (
        <blockquote className="text-quote mb-12 border-l-2 border-warm pl-8">
          &ldquo;{phase.quote}&rdquo;
        </blockquote>
      )}
      {/* Render in an ocre frame — full-colour, never tinted (v3.0 Case) */}
      <div className="bg-warm p-1.5 lg:p-2">
        <div className="relative aspect-[16/9] overflow-hidden">
          <PhaseImage
            image={phase.mainImage}
            label={`${phase.phaseTitle} — Main Image`}
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}

function HorizontalGalleryLayout({ phase }: { phase: Phase }) {
  const images = phase.gallery?.length ? phase.gallery : [null, null, null];
  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className="grid grid-cols-3 gap-4">
        {images.slice(0, 3).map((img, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden">
            <PhaseImage
              image={img}
              label={`${phase.phaseTitle} ${i + 1}`}
              sizes="33vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitTextImageLayout({ phase }: { phase: Phase }) {
  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-editorial text-muted">{phase.whatItIs}</p>
          {phase.whatItContains && (
            <p className="text-meta text-muted mt-6">{phase.whatItContains}</p>
          )}
        </div>
        {/* Render in an ocre frame — full-colour, never tinted (v3.0 Case) */}
        <div className="bg-warm p-1.5 lg:p-2">
          <div className="relative aspect-[4/5] overflow-hidden">
            <PhaseImage
              image={phase.mainImage}
              label={`${phase.phaseTitle} — Image`}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialStudyLayout({ phase }: { phase: Phase }) {
  const images = phase.gallery?.length ? phase.gallery : [null, null, null, null];
  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <PhaseImage
              image={img}
              label={`Material ${i + 1}`}
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageGridLayout({ phase }: { phase: Phase }) {
  const images = phase.gallery?.length ? phase.gallery : Array(6).fill(null);
  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, 6).map((img, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden">
            <PhaseImage
              image={img}
              label={`Image ${i + 1}`}
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactSheetLayout({ phase }: { phase: Phase }) {
  const images = phase.gallery?.length ? phase.gallery : Array(12).fill(null);
  return (
    <div>
      <PhaseHeader phase={phase} />
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
        {images.slice(0, 12).map((img, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden">
            <PhaseImage
              image={img}
              label={String(i + 1).padStart(2, "0")}
              sizes="(max-width: 640px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoLayout({ phase }: { phase: Phase }) {
  // Poster = the phase's main image when set, so reduced-motion and
  // slow-connection users see the graded still instead of a black frame.
  const poster = phase.mainImage?.asset?.url;
  return (
    <div>
      <PhaseHeader phase={phase} />
      {/* Render in an ocre frame — full-colour, never tinted (v3.0 Case) */}
      <div className="bg-warm p-1.5 lg:p-2">
        <div className="relative aspect-video overflow-hidden">
          {phase.video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
            >
              <source src={phase.video} type="video/mp4" />
            </video>
          ) : (
            <PhasePlaceholderImage label={`${phase.phaseTitle} — Video`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhaseSection({ phase }: PhaseSectionProps) {
  switch (phase.layoutType) {
    case "Fullscreen":
      return <FullscreenLayout phase={phase} />;
    case "Horizontal Gallery":
      return <HorizontalGalleryLayout phase={phase} />;
    case "Split Text Image":
      return <SplitTextImageLayout phase={phase} />;
    case "Material Study":
      return <MaterialStudyLayout phase={phase} />;
    case "Image Grid":
      return <ImageGridLayout phase={phase} />;
    case "Contact Sheet":
      return <ContactSheetLayout phase={phase} />;
    default:
      return <FullscreenLayout phase={phase} />;
  }
}
