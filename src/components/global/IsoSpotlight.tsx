"use client";

import { useEffect, useRef, type RefObject, type CSSProperties } from "react";

interface IsoSpotlightProps {
  parentRef: RefObject<HTMLElement | null>;
  position?: "top-right" | "bottom-right" | "top-left";
  size?: number;
  offset?: number;
  inverse?: boolean;
  radius?: number;
  zIndex?: number;
}

export default function IsoSpotlight({
  parentRef,
  position = "top-right",
  size = 220,
  offset = 64,
  inverse = false,
  radius = 110,
  zIndex = 1,
}: IsoSpotlightProps) {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;
    const spot = spotRef.current;
    if (!parent || !spot) return;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    const move = (e: MouseEvent) => {
      const r = spot.getBoundingClientRect();
      lastX = e.clientX - r.left;
      lastY = e.clientY - r.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spot.style.setProperty("--mx", lastX + "px");
        spot.style.setProperty("--my", lastY + "px");
        raf = 0;
      });
    };
    const leave = () => {
      spot.style.setProperty("--mx", "-400px");
      spot.style.setProperty("--my", "-400px");
    };
    parent.addEventListener("mousemove", move);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mousemove", move);
      parent.removeEventListener("mouseleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [parentRef]);

  const src = inverse ? "/brand/oaki-isotipo-white.png" : "/brand/oaki-isotipo.png";
  const posMap = {
    "top-right": { x: `calc(100% - ${offset}px - ${size}px)`, y: `${offset}px` },
    "bottom-right": {
      x: `calc(100% - ${offset}px - ${size}px)`,
      y: `calc(100% - ${offset}px - ${size}px)`,
    },
    "top-left": { x: `${offset}px`, y: `${offset}px` },
  };
  const p = posMap[position];

  const style: CSSProperties & Record<string, string | number> = {
    "--reveal-radius": `${radius}px`,
    backgroundImage: `url(${src})`,
    backgroundPosition: `${p.x} ${p.y}`,
    backgroundSize: `${size}px ${size}px`,
    zIndex,
  };
  return <div className="iso-spotlight" ref={spotRef} style={style} aria-hidden="true" />;
}
