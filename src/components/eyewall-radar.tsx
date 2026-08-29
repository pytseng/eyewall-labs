"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;

function noise(angle: number, radius: number, time: number) {
  return (
    0.52 +
    0.28 * Math.sin(angle * 6.2 + time * 0.55) +
    0.16 * Math.sin(angle * 13.4 - time * 0.31 + radius * 9) +
    0.1 * Math.sin(angle * 3.1 + time * 0.17)
  );
}

function wallIntensity(radiusNorm: number, angle: number, time: number) {
  const inner = 0.26;
  const outer = 0.52;
  const band = (radiusNorm - inner) / (outer - inner);
  if (band < 0 || band > 1) return 0;
  const envelope = Math.pow(Math.sin(band * Math.PI), 1.35);
  return Math.max(0, envelope * noise(angle, radiusNorm, time));
}

export function EyewallRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      persist.width = canvas.width;
      persist.height = canvas.height;
      persistCtx.setTransform(1, 0, 0, 1, 0, 0);
      persistCtx.clearRect(0, 0, persist.width, persist.height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const blips = [
      { r: 0.34, a: 0.7, size: 2.4 },
      { r: 0.41, a: 2.15, size: 1.8 },
      { r: 0.3, a: 3.9, size: 2.1 },
      { r: 0.47, a: 5.2, size: 1.6 },
      { r: 0.37, a: 4.55, size: 1.9 },
    ];

    const paintSweepReturns = (time: number, sweep: number) => {
      const { width, height } = persist;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;
      const span = 0.22;
      const steps = 46;

      for (let i = 0; i < steps; i += 1) {
        const angle = sweep - (i / steps) * span;
        const fade = 1 - i / steps;
        for (let u = 0; u < 28; u += 1) {
          const rn = 0.2 + (u / 27) * 0.42;
          const intensity = wallIntensity(rn, angle, time);
          if (intensity < 0.18) continue;
          const x = cx + Math.cos(angle) * rn * radius;
          const y = cy + Math.sin(angle) * rn * radius;
          const alpha = intensity * fade * 0.38;
          persistCtx.fillStyle = `rgba(125, 255, 106, ${alpha})`;
          persistCtx.beginPath();
          persistCtx.arc(x, y, 1.15 + intensity * 1.4, 0, TAU);
          persistCtx.fill();
        }
      }
    };

    const drawOverlay = (time: number, sweep: number) => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;

      ctx.clearRect(0, 0, width, height);

      const field = ctx.createRadialGradient(cx, cy, radius * 0.08, cx, cy, radius);
      field.addColorStop(0, "rgba(10, 42, 18, 0.55)");
      field.addColorStop(1, "rgba(2, 10, 6, 0.05)");
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(persist, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(125, 255, 106, 0.18)";
      ctx.lineWidth = 1;
      [0.18, 0.34, 0.5, 0.66, 0.82, 1].forEach((ring) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ring, 0, TAU);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      ctx.strokeStyle = "rgba(125, 255, 106, 0.12)";
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * radius * 0.92, cy + Math.sin(a) * radius * 0.92);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.stroke();
      }
      ctx.restore();

      const beam = ctx.createLinearGradient(
        cx,
        cy,
        cx + Math.cos(sweep) * radius,
        cy + Math.sin(sweep) * radius,
      );
      beam.addColorStop(0, "rgba(232, 255, 220, 0.95)");
      beam.addColorStop(0.35, "rgba(125, 255, 106, 0.55)");
      beam.addColorStop(1, "rgba(125, 255, 106, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweep - 0.42, sweep);
      ctx.closePath();
      ctx.fillStyle = "rgba(125, 255, 106, 0.07)";
      ctx.fill();

      ctx.strokeStyle = beam;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
      ctx.stroke();
      ctx.restore();

      const eye = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.16);
      eye.addColorStop(0, "rgba(8, 18, 10, 0.2)");
      eye.addColorStop(0.7, "rgba(4, 12, 7, 0.55)");
      eye.addColorStop(1, "rgba(125, 255, 106, 0.18)");
      ctx.fillStyle = eye;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.16, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(240, 193, 75, 0.55)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.16, 0, TAU);
      ctx.stroke();

      blips.forEach((blip, index) => {
        const pulse = reduceMotion
          ? 0.75
          : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 2.1 + index * 1.7));
        const x = cx + Math.cos(blip.a) * blip.r * radius;
        const y = cy + Math.sin(blip.a) * blip.r * radius;
        ctx.fillStyle = `rgba(232, 255, 220, ${0.35 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, blip.size * (0.8 + pulse * 0.4), 0, TAU);
        ctx.fill();
      });

      ctx.strokeStyle = "rgba(125, 255, 106, 0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.stroke();
    };

    const render = (now: number) => {
      if (!running) return;
      const time = now / 1000;
      const sweep = reduceMotion ? -Math.PI / 2 : (time * 0.85) % TAU;

      persistCtx.fillStyle = "rgba(3, 17, 8, 0.085)";
      persistCtx.fillRect(0, 0, persist.width, persist.height);
      paintSweepReturns(time, sweep);
      drawOverlay(time, sweep);

      frame = requestAnimationFrame(render);
    };

    if (reduceMotion) {
      persistCtx.clearRect(0, 0, persist.width, persist.height);
      paintSweepReturns(0, -Math.PI / 2);
      drawOverlay(0, -Math.PI / 2);
    } else {
      frame = requestAnimationFrame(render);
    }

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden="true"
    />
  );
}
