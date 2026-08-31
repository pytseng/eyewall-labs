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
): CSSProperties {
  const col = slot % ATLAS_COLS;
  const row = Math.floor(slot / ATLAS_COLS);
  const x = (col / (ATLAS_COLS - 1)) * 100;
  const y = (row / (ATLAS_ROWS - 1)) * 100;
  const pos = `${x}% ${y}%`;
  const size = `${ATLAS_COLS * 100}% ${ATLAS_ROWS * 100}%`;
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
