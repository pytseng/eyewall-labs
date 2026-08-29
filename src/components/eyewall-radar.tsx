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

    const sizeTo = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(rect.width * dpr));
      const nextH = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        persist.width = nextW;
        persist.height = nextH;
        persistCtx.setTransform(1, 0, 0, 1, 0, 0);
        persistCtx.clearRect(0, 0, persist.width, persist.height);
      }
      return { width: nextW, height: nextH };
    };

    const blips = [
      { r: 0.34, a: 0.7, size: 3.1 },
      { r: 0.43, a: 2.15, size: 2.4 },
      { r: 0.3, a: 3.9, size: 2.8 },
      { r: 0.48, a: 5.2, size: 2.2 },
      { r: 0.37, a: 4.55, size: 2.6 },
    ];

    const paintSweepReturns = (time: number, sweep: number) => {
      const { width, height } = persist;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;
      const span = 0.38;
      const steps = 56;

      for (let i = 0; i < steps; i += 1) {
        const angle = sweep - (i / steps) * span;
        const fade = 1 - i / steps;
        for (let u = 0; u < 34; u += 1) {
          const rn = 0.18 + (u / 33) * 0.46;
          const intensity = wallIntensity(rn, angle, time);
          if (intensity < 0.16) continue;
          const x = cx + Math.cos(angle) * rn * radius;
          const y = cy + Math.sin(angle) * rn * radius;
          const alpha = intensity * fade * 0.62;
          persistCtx.fillStyle = `rgba(125, 255, 106, ${alpha})`;
          persistCtx.beginPath();
          persistCtx.arc(x, y, 1.4 + intensity * 2.1, 0, TAU);
          persistCtx.fill();
        }
      }
    };

    const drawOverlay = (time: number, sweep: number) => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;

      ctx.clearRect(0, 0, width, height);

      const field = ctx.createRadialGradient(cx, cy, radius * 0.06, cx, cy, radius);
      field.addColorStop(0, "rgba(18, 64, 28, 0.45)");
      field.addColorStop(1, "rgba(2, 10, 6, 0)");
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(persist, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(125, 255, 106, 0.42)";
      ctx.lineWidth = Math.max(1.25, width * 0.0018);
      [0.18, 0.36, 0.54, 0.72, 0.9, 1].forEach((ring) => {
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

      ctx.strokeStyle = "rgba(125, 255, 106, 0.28)";
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * radius * 0.9, cy + Math.sin(a) * radius * 0.9);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, sweep - 0.55, sweep);
      ctx.closePath();
      const wedge = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      wedge.addColorStop(0, "rgba(190, 255, 170, 0.28)");
      wedge.addColorStop(1, "rgba(125, 255, 106, 0.02)");
      ctx.fillStyle = wedge;
      ctx.fill();

      ctx.strokeStyle = "rgba(232, 255, 220, 0.95)";
      ctx.shadowColor = "rgba(125, 255, 106, 0.9)";
      ctx.shadowBlur = 16;
      ctx.lineWidth = Math.max(2, width * 0.003);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
      ctx.stroke();
      ctx.restore();

      const eye = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.17);
      eye.addColorStop(0, "rgba(4, 10, 6, 0.15)");
      eye.addColorStop(0.72, "rgba(4, 12, 7, 0.45)");
      eye.addColorStop(1, "rgba(240, 193, 75, 0.35)");
      ctx.fillStyle = eye;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.17, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = "rgba(240, 193, 75, 0.85)";
      ctx.lineWidth = Math.max(1.5, width * 0.0022);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.17, 0, TAU);
      ctx.stroke();

      blips.forEach((blip, index) => {
        const pulse = reduceMotion
          ? 0.8
          : 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2.1 + index * 1.7));
        const x = cx + Math.cos(blip.a) * blip.r * radius;
        const y = cy + Math.sin(blip.a) * blip.r * radius;
        ctx.fillStyle = `rgba(232, 255, 220, ${0.45 + pulse * 0.5})`;
        ctx.shadowColor = "rgba(125, 255, 106, 0.8)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, blip.size * (0.85 + pulse * 0.35), 0, TAU);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "rgba(125, 255, 106, 0.7)";
      ctx.lineWidth = Math.max(1.75, width * 0.0024);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.stroke();
    };

    const renderFrame = (time: number) => {
      sizeTo();
      const sweep = reduceMotion ? -Math.PI / 2 : (time * 0.85) % TAU;
      persistCtx.fillStyle = "rgba(3, 17, 8, 0.07)";
      persistCtx.fillRect(0, 0, persist.width, persist.height);
      paintSweepReturns(time, sweep);
      drawOverlay(time, sweep);
    };

    const loop = (now: number) => {
      if (!running) return;
      renderFrame(now / 1000);
      frame = requestAnimationFrame(loop);
    };

    sizeTo();
    if (reduceMotion) {
      renderFrame(0);
    } else {
      // Seed a few sweep frames so the wall is visible on first paint.
      for (let i = 0; i < 18; i += 1) {
        renderFrame(i * 0.08);
      }
      frame = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      renderFrame(reduceMotion ? 0 : performance.now() / 1000);
    });
    observer.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="relative z-10 h-full w-full"
      aria-label="Retro radar scope showing a forming eyewall"
      role="img"
    />
  );
}
