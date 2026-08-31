import type { CSSProperties } from "react";
import type { Kind } from "./generate";

/** One texture, 64 cells. Ranges must match scripts/build-atlas.py. */
export const ATLAS_URL = "/media/atlas.webp";
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 8;

export const ATLAS_KINDS: Record<Kind, { start: number; count: number }> = {
  video: { start: 0, count: 16 },
  dashboard: { start: 16, count: 12 },
  chart: { start: 28, count: 10 },
  code: { start: 38, count: 10 },
  screenshot: { start: 48, count: 12 },
  debris: { start: 60, count: 4 },
};

export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function atlasSlot(id: string, kind: Kind): number {
  const { start, count } = ATLAS_KINDS[kind];
  return start + (hash32(id) % count);
}

export function atlasFaceStyle(
  slot: number,
  side: "front" | "back",
  stripIndex = 0,
  stripCount = 1,
): CSSProperties {
  const col = slot % ATLAS_COLS;
  const row = Math.floor(slot / ATLAS_COLS);
  const n = Math.max(1, stripCount);
  const i = Math.min(n - 1, Math.max(0, stripIndex));
  const sizeX = ATLAS_COLS * n * 100;
  const sizeY = ATLAS_ROWS * 100;
  const posX =
    ((col * n + i) / Math.max(1, ATLAS_COLS * n - 1)) * 100;
  const posY = (row / (ATLAS_ROWS - 1)) * 100;
  const pos = `${posX}% ${posY}%`;
  const size = `${sizeX}% ${sizeY}%`;
  const image = `url(${ATLAS_URL})`;
  if (side === "back") {
    return {
      backgroundImage: `linear-gradient(rgba(8,8,10,0.62), rgba(8,8,10,0.62)), ${image}`,
      backgroundSize: `${size}, ${size}`,
      backgroundPosition: `${pos}, ${pos}`,
      backgroundRepeat: "no-repeat",
    };
  }
  return {
    backgroundImage: image,
    backgroundSize: size,
    backgroundPosition: pos,
    backgroundRepeat: "no-repeat",
  };
}
