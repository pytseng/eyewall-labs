import {
  bandTheta0,
  clamp,
  coverageDensity,
  invLerp,
  lerp,
  mulberry32,
  opacityAt,
  polarToXy,
  randRange,
  sampleDiskRadius,
  sampleRadiusFromDensity,
  sizeFactor,
  spiralB,
  spiralFrame,
  facingEyeDeg,
  spiralTheta,
  zoneAt,
  type ZoneBreaks,
} from "./geometry";
import type { StormParams } from "./params";

export type Zone = "eyewall" | "overcast" | "bands" | "fringe";
export type Kind =
  | "video"
  | "dashboard"
  | "chart"
  | "code"
  | "screenshot"
  | "debris";

export type Tile = {
  id: string;
  r: number;
  theta: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  rotJitter: number;
  opacity: number;
  zone: Zone;
  kind: Kind;
  bandIndex: number | null;
};

function breaks(params: StormParams): ZoneBreaks {
  return {
    eyeRadius: params.eyeRadius,
    eyewallOuter: params.eyewallOuter,
    overcastOuter: params.overcastOuter,
    bandsOuter: params.bandsOuter,
  };
}

function pickKind(zone: Zone, rng: () => number): Kind {
  const u = rng();
  if (zone === "eyewall") return u < 0.5 ? "video" : "dashboard";
  if (zone === "overcast") {
    if (u < 1 / 3) return "dashboard";
    if (u < 2 / 3) return "chart";
    return "screenshot";
  }
  if (zone === "fringe") {
    if (u < 0.88) return "debris";
    if (u < 0.94) return "screenshot";
    return "code";
  }
  const spread: Kind[] = [
    "video",
    "dashboard",
    "chart",
    "code",
    "screenshot",
    "debris",
  ];
  return spread[Math.min(spread.length - 1, Math.floor(u * spread.length))];
}

function asPaintZone(zone: ReturnType<typeof zoneAt>): Zone | null {
  if (zone === "eye") return null;
  return zone;
}

function makeTile(
  id: string,
  r: number,
  theta: number,
  bandIndex: number | null,
  b: number,
  params: StormParams,
  rng: () => number,
): Tile | null {
  const z = breaks(params);
  const paintZone = asPaintZone(zoneAt(r, z));
  if (!paintZone) return null;

  const stormRadiusPx = params.stormDiameterPx / 2;
  const jitterAmp = lerp(
    params.jitterInner,
    params.jitterOuter,
    invLerp(params.eyeRadius, 1, r),
  );
  const { nx, ny } = spiralFrame(b, theta);
  const jitter = (rng() * 2 - 1) * jitterAmp * stormRadiusPx;
  const { x: px, y: py } = polarToXy(r, theta, stormRadiusPx);
  const x = px + nx * jitter;
  const y = py + ny * jitter;

  const rotDev = lerp(
    params.rotDeviationInner,
    params.rotDeviationOuter,
    invLerp(params.eyeRadius, 1, r),
  );
  const rotJitter = (rng() * 2 - 1) * rotDev;
  const rot = facingEyeDeg(x, y) + rotJitter;

  const size = lerp(params.sizeMin, params.sizeMax, sizeFactor(r, z));
  const aspect = randRange(rng, params.aspectMin, params.aspectMax);
  const w = size * aspect;
  const h = size;

  return {
    id,
    r,
    theta,
    x,
    y,
    w,
    h,
    rot,
    rotJitter,
    opacity: opacityAt(r, z, params.opacityEyewall, params.opacityFringe),
    zone: paintZone,
    kind: pickKind(paintZone, rng),
    bandIndex,
  };
}

export function generateTiles(params: StormParams): Tile[] {
  const rng = mulberry32(params.seed >>> 0);
  const z = breaks(params);
  const r0 = Math.max(params.eyeRadius, 1e-4);
  const b = spiralB(params.pitchAngle, params.bandWraps, r0);
  const count = Math.max(0, Math.round(params.tileCount));
  const scatterN = Math.round(count * clamp(params.scatterRatio, 0, 1));
  const bandN = count - scatterN;
  const bandCount = Math.max(1, Math.round(params.bandCount));

  const tiles: Tile[] = [];
  let seq = 0;

  const perBand = Array.from({ length: bandCount }, (_, i) => {
    const base = Math.floor(bandN / bandCount);
    const extra = i < bandN % bandCount ? 1 : 0;
    return base + extra;
  });

  perBand.forEach((n, bandIndex) => {
    const theta0 = bandTheta0(bandIndex, bandCount);
    for (let j = 0; j < n; j += 1) {
      const r = sampleRadiusFromDensity(rng, z);
      const theta = spiralTheta(r0, b, r, theta0);
      const tile = makeTile(
        `b${bandIndex}-${seq}`,
        r,
        theta,
        bandIndex,
        b,
        params,
        rng,
      );
      seq += 1;
      if (tile) tiles.push(tile);
    }
  });

  let scatterPlaced = 0;
  let attempts = 0;
  const maxAttempts = scatterN * 12 + 8;
  while (scatterPlaced < scatterN && attempts < maxAttempts) {
    attempts += 1;
    const r = sampleDiskRadius(rng, r0, 1);
    if (coverageDensity(r, z) < rng()) continue;
    const theta = rng() * Math.PI * 2;
    const tile = makeTile(`s-${seq}`, r, theta, null, b, params, rng);
    seq += 1;
    if (!tile) continue;
    // Scatter uses the same tangent field so off-band debris still shears.
    tiles.push(tile);
    scatterPlaced += 1;
  }

  return tiles;
}
