"use client";

import { useEffect, useRef, type RefObject } from "react";

interface HeroBackdropProps {
  parentRef: RefObject<HTMLElement | null>;
}

export default function HeroBackdrop({ parentRef }: HeroBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t0 = performance.now();

    function resize() {
      const r = parent!.getBoundingClientRect();
      w = Math.max(320, Math.floor(r.width));
      h = Math.max(240, Math.floor(r.height));
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    function draw(now: number) {
      const t = (now - t0) / 1000;
      ctx!.clearRect(0, 0, w, h);

      // Warm radial breathing from bottom-right.
      const breathe = 0.55 + 0.45 * Math.sin(t * 0.18);
      const grad = ctx!.createRadialGradient(
        w * 0.82, h * 0.85, 0,
        w * 0.82, h * 0.85, Math.max(w, h) * 0.85
      );
      grad.addColorStop(0, `rgba(198, 177, 147, ${0.10 * breathe})`);
      grad.addColorStop(0.55, "rgba(198, 177, 147, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      // Drifting vertical-bar field.
      const bandTop = h * 0.18;
      const bandBottom = h * 0.92;
      const bandHeight = bandBottom - bandTop;
      const bandMidY = (bandTop + bandBottom) / 2;
      const drift = (t * 18) % 60;
      const cols = Math.ceil(w / 24) + 4;
      ctx!.lineCap = "butt";

      for (let i = -2; i < cols; i++) {
        const seed = i * 13.37;
        const x = i * 24 - drift + (Math.sin(seed) + 1) * 6;
        if (x < -6 || x > w + 6) continue;
        const widthPulse = 0.5 + 0.5 * Math.sin(t * 0.4 + seed * 0.7);
        const lineW = 1 + 1.4 * widthPulse;
        const heightPulse = 0.55 + 0.45 * Math.sin(t * 0.32 + seed * 1.3);
        const lineH = bandHeight * (0.45 + 0.5 * heightPulse);
        const opacityPulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.25 + seed * 0.9));
        const baseAlpha = 0.05 + 0.04 * opacityPulse;
        const xn = (x / w) * 2 - 1;
        const envelope = 1 - Math.min(1, Math.abs(xn) * 1.05);
        const finalH = lineH * (0.55 + 0.45 * envelope);
        const finalAlpha = baseAlpha * (0.55 + 0.55 * envelope);
        ctx!.strokeStyle = `rgba(34, 34, 34, ${finalAlpha})`;
        ctx!.lineWidth = lineW;
        ctx!.beginPath();
        ctx!.moveTo(x, bandMidY - finalH / 2);
        ctx!.lineTo(x, bandMidY + finalH / 2);
        ctx!.stroke();
      }

      // Slow scan highlight.
      const scanX = ((Math.sin(t * 0.10) + 1) / 2) * w;
      const scanGrad = ctx!.createLinearGradient(scanX - 180, 0, scanX + 180, 0);
      scanGrad.addColorStop(0, "rgba(198, 177, 147, 0)");
      scanGrad.addColorStop(0.5, "rgba(198, 177, 147, 0.07)");
      scanGrad.addColorStop(1, "rgba(198, 177, 147, 0)");
      ctx!.fillStyle = scanGrad;
      ctx!.fillRect(scanX - 180, bandTop - 20, 360, bandHeight + 40);

      if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    }

    const onVis = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduce) {
        t0 = performance.now() - t0;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduce) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [parentRef]);

  return <canvas ref={canvasRef} className="hero-backdrop" aria-hidden="true" />;
}
