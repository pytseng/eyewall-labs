"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;

function noise(angle: number, radius: number, time: number) {
  return (
    0.58 +
    0.26 * Math.sin(angle * 6.2 + time * 0.55) +
    0.18 * Math.sin(angle * 13.4 - time * 0.31 + radius * 9) +
    0.12 * Math.sin(angle * 3.1 + time * 0.17)
  );
}

function wallIntensity(radiusNorm: number, angle: number, time: number) {
  const inner = 0.24;
  const outer = 0.54;
  const band = (radiusNorm - inner) / (outer - inner);
  if (band < 0 || band > 1) return 0;
  const envelope = Math.pow(Math.sin(band * Math.PI), 1.2);
  return Math.max(0, envelope * noise(angle, radiusNorm, time));
}

function ScopeGrid() {
  const rings = [18, 32, 46, 62, 78, 92];
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {rings.map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r / 2}
          fill="none"
          stroke="rgba(125,255,106,0.38)"
          strokeWidth="0.35"
        />
      ))}
      <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(125,255,106,0.32)" strokeWidth="0.3" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(125,255,106,0.32)" strokeWidth="0.3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * TAU;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * 42}
            y1={50 + Math.sin(a) * 42}
            x2={50 + Math.cos(a) * 46}
            y2={50 + Math.sin(a) * 46}
            stroke="rgba(125,255,106,0.4)"
            strokeWidth="0.4"
          />
        );
      })}
      <circle
        cx="50"
        cy="50"
        r="8.4"
        fill="rgba(4,12,7,0.35)"
        stroke="rgba(240,193,75,0.85)"
        strokeWidth="0.55"
      />
    </svg>
  );
}

function WeatherReturns() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let running = true;
    const persist = document.createElement("canvas");
    const persistCtx = persist.getContext("2d");
    if (!persistCtx) return;

    const sizeTo = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(rect.width * dpr));
      const nextH = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        persist.width = nextW;
        persist.height = nextH;
      }
    };

    const paint = (time: number) => {
      sizeTo();
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.46;
      const sweep = reduceMotion ? -Math.PI / 2 : (time * 0.85) % TAU;

      persistCtx.fillStyle = "rgba(3, 17, 8, 0.08)";
      persistCtx.fillRect(0, 0, persist.width, persist.height);

      const span = 0.4;
      const steps = 50;
      for (let i = 0; i < steps; i += 1) {
        const angle = sweep - (i / steps) * span;
        const fade = 1 - i / steps;
        for (let u = 0; u < 30; u += 1) {
          const rn = 0.2 + (u / 29) * 0.42;
          const intensity = wallIntensity(rn, angle, time);
          if (intensity < 0.18) continue;
          persistCtx.fillStyle = `rgba(125, 255, 106, ${intensity * fade * 0.7})`;
          persistCtx.beginPath();
          persistCtx.arc(
            cx + Math.cos(angle) * rn * radius,
            cy + Math.sin(angle) * rn * radius,
            1.5 + intensity * 2,
            0,
            TAU,
          );
          persistCtx.fill();
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(persist, 0, 0);

      const blips = [
        { r: 0.34, a: 0.7 },
        { r: 0.43, a: 2.15 },
        { r: 0.3, a: 3.9 },
        { r: 0.48, a: 5.2 },
      ];
      blips.forEach((blip, index) => {
        const pulse = reduceMotion
          ? 0.8
          : 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(time * 2.2 + index));
        ctx.fillStyle = `rgba(232, 255, 220, ${0.4 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(blip.a) * blip.r * radius,
          cy + Math.sin(blip.a) * blip.r * radius,
          2.4 * pulse,
          0,
          TAU,
        );
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (!running) return;
      paint(now / 1000);
      frame = requestAnimationFrame(loop);
    };

    sizeTo();
    for (let i = 0; i < 16; i += 1) paint(i * 0.09);
    if (!reduceMotion) frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => paint(performance.now() / 1000));
    observer.observe(parent);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export function EyewallRadar() {
  return (
    <div
      className="relative aspect-square w-full"
      role="img"
      aria-label="Retro radar scope showing a forming eyewall"
    >
      <div className="radar-face absolute inset-[4%] overflow-hidden rounded-full">
        <div className="radar-sweep" />
        <WeatherReturns />
        <ScopeGrid />
        <p className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-[10px] tracking-[0.42em] text-amber">
          EYE
        </p>
      </div>
    </div>
  );
}
