"use client";

import { useRef, useState } from "react";
import s from "./CaseEditorial.module.css";

// The film, as the film: full viewport on the ink ground, poster first, and
// nothing moves until the viewer asks for it. One tap starts it with sound
// and hands over to the native controls; on phones it also goes full screen.
// Films are never autoplayed with sound, so this is the one row type that
// waits for the person. The muted loop rows stay as they are.

interface CaseFilmScreenProps {
  src: string;
  poster?: string;
  ratio: number;
  label?: string;
}

export default function CaseFilmScreen({ src, poster, ratio, label }: CaseFilmScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.controls = true;
    setPlaying(true);
    video.play().catch(() => {});
    const el = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    // Phones: the film takes the whole screen, as a film should.
    if (window.matchMedia("(max-width: 820px)").matches) {
      try {
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
      } catch {
        /* no full screen available: the film plays in place */
      }
    }
  };

  const ended = () => {
    const video = videoRef.current;
    if (video) video.controls = false;
    setPlaying(false);
  };

  return (
    <div className={`${s.screen} ${playing ? s.screenPlaying : ""}`}>
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label ?? "The film, with sound"}
        style={{ aspectRatio: String(ratio) }}
        onEnded={ended}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        className={s.screenStart}
        onClick={start}
        aria-label="Play the film with sound"
      >
        <span>{label ?? "Play the film"} · sound on</span>
      </button>
    </div>
  );
}
