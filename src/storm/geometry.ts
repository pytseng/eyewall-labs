/** Pure storm geometry. No React, no DOM. */

export type Zone = "eye" | "eyewall" | "overcast" | "bands" | "fringe";

export type ZoneBreaks = {
  eyeRadius: number;
  eyewallOuter: number;
  overcastOuter: number;
  bandsOuter: number;
};

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function invLerp(a: number, b: number, x: number): number {
  if (a === b) return 0;
  return clamp((x - a) / (b - a), 0, 1);
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Log-spiral coefficient for r = r0 * exp(b * (θ - θ0)).
 *
 * Spec form is b = 1/tan(pitch). With pitch as the crossing angle from a
 * circle (~15°), that coefficient is tan(pitch) — 1/tan is pitch-from-radial.
 * `bandWraps` retargets the same spiral so r0 → 1 spans that many turns.
 * At the defaults (15°, 1.8 wraps) both agree to within a few percent.
 */
export function spiralB(
  pitchAngleDeg: number,
  bandWraps: number,
  r0: number,
): number {
  const pitch = toRad(clamp(pitchAngleDeg, 0.5, 89.5));
  const fromPitch = 1 / Math.tan(pitch);
  const wraps = Math.max(bandWraps, 0.05);
  const fromWraps =
    Math.log(1 / Math.max(r0, 1e-4)) / (wraps * Math.PI * 2);
  const referencePitch = 1 / Math.tan(toRad(15));
  return fromWraps * (fromPitch / referencePitch);
}

export function zoneAt(r: number, z: ZoneBreaks): Zone {
  if (r < z.eyeRadius) return "eye";
  if (r < z.eyewallOuter) return "eyewall";
  if (r < z.overcastOuter) return "overcast";
  if (r < z.bandsOuter) return "bands";
  return "fringe";
}

/** r = r0 * exp(b * (theta - theta0)) */
export function spiralR(
  r0: number,
  b: number,
  theta: number,
  theta0: number,
): number {
  return r0 * Math.exp(b * (theta - theta0));
}

export function spiralTheta(
  r0: number,
  b: number,
  r: number,
  theta0: number,
): number {
  const safeB = Math.abs(b) < 1e-9 ? 1e-9 : b;
  return theta0 + Math.log(Math.max(r, 1e-12) / r0) / safeB;
}

/**
 * Analytic tangent of r = r0 exp(b (θ − θ0)) in CSS degrees.
 * Cartesian frame: x = r cos θ, y = r sin θ (y down).
 * dr/dθ = b r → (dx, dy) ∝ (b cos θ − sin θ, b sin θ + cos θ).
 */
export function spiralTangentDeg(b: number, theta: number): number {
  const dx = b * Math.cos(theta) - Math.sin(theta);
  const dy = b * Math.sin(theta) + Math.cos(theta);
  return toDeg(Math.atan2(dy, dx));
}

/**
 * Yaw so the tile's width sits tangent to the ring. Combined with a
 * rotateX stand-up, the face looks at the eye instead of lying on the ground.
 */
export function facingEyeDeg(x: number, y: number): number {
  return toDeg(Math.atan2(y, x)) + 90;
}

/**
 * Azimuthal angular speed (rad/s).
 *
 * Max wind sits on the inner eyewall (tiles against the eye). A solid-body
 * ramp from `eyeRadius` → `eyewallOuter` treated that ring as calm core
 * and left it near ω = 0.
 *
 * Eye: still. Inner wall: `omegaPeak`. Through the wall, 1/r so the
 * innermost ring leads. Outside `eyewallOuter`: (1/r) ** falloff.
 */
export function omegaAt(
  r: number,
  eyeRadius: number,
  eyewallOuter: number,
  omegaPeak: number,
  falloff: number,
): number {
  if (r <= eyeRadius) return 0;
  const inner = Math.max(eyeRadius, 1e-4);
  const wall = Math.max(eyewallOuter, inner + 1e-6);
  const p = clamp(falloff, 0.5, 1.5);
  if (r <= wall) {
    return omegaPeak * (inner / r);
  }
  return omegaPeak * (inner / wall) * (wall / r) ** p;
}

export function tileBillboardTransform(
  x: number,
  y: number,
  yawDeg: number,
): string {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%) rotateZ(${yawDeg}deg) rotateX(-90deg)`;
}

export function polarToXy(
  r: number,
  theta: number,
  stormRadiusPx: number,
): { x: number; y: number } {
  const rho = r * stormRadiusPx;
  return {
    x: rho * Math.cos(theta),
    y: rho * Math.sin(theta),
  };
}

/** Unit tangent and left-hand normal in the polarToXy frame. */
export function spiralFrame(
  b: number,
  theta: number,
): { tx: number; ty: number; nx: number; ny: number } {
  const dx = b * Math.cos(theta) - Math.sin(theta);
  const dy = b * Math.sin(theta) + Math.cos(theta);
  const len = Math.hypot(dx, dy) || 1;
  const tx = dx / len;
  const ty = dy / len;
  return { tx, ty, nx: -ty, ny: tx };
}

export function coverageDensity(r: number, z: ZoneBreaks): number {
  const zone = zoneAt(r, z);
  if (zone === "eye") return 0;
  if (zone === "eyewall") return 1;
  if (zone === "overcast") {
    return lerp(1, 0.82, invLerp(z.eyewallOuter, z.overcastOuter, r));
  }
  if (zone === "bands") {
    return lerp(0.55, 0.2, invLerp(z.overcastOuter, z.bandsOuter, r));
  }
  return lerp(0.2, 0.05, invLerp(z.bandsOuter, 1, r));
}

/** 0 = smallest (overcast), 1 = largest (eyewall and fringe). */
export function sizeFactor(r: number, z: ZoneBreaks): number {
  const zone = zoneAt(r, z);
  if (zone === "eye") return 0;
  if (zone === "eyewall") return 1;
  if (zone === "overcast") {
    return lerp(0.85, 0, invLerp(z.eyewallOuter, z.overcastOuter, r));
  }
  if (zone === "bands") {
    return lerp(0.05, 0.65, invLerp(z.overcastOuter, z.bandsOuter, r));
  }
  return lerp(0.65, 1, invLerp(z.bandsOuter, 1, r));
}

export function opacityAt(
  r: number,
  z: ZoneBreaks,
  opacityEyewall: number,
  opacityFringe: number,
): number {
  const zone = zoneAt(r, z);
  if (zone === "eye") return 0;
  if (zone === "eyewall") return opacityEyewall;
  const overcastEnd = lerp(opacityEyewall, opacityFringe, 0.18);
  if (zone === "overcast") {
    return lerp(opacityEyewall, overcastEnd, invLerp(z.eyewallOuter, z.overcastOuter, r));
  }
  const bandsEnd = lerp(overcastEnd, opacityFringe, 0.55);
  if (zone === "bands") {
    return lerp(overcastEnd, bandsEnd, invLerp(z.overcastOuter, z.bandsOuter, r));
  }
  return lerp(bandsEnd, opacityFringe, invLerp(z.bandsOuter, 1, r));
}

/** Area-uniform radius in an annulus. */
export function sampleDiskRadius(
  rng: () => number,
  rMin: number,
  rMax: number,
): number {
  const u = rng();
  return Math.sqrt(rMin * rMin + u * (rMax * rMax - rMin * rMin));
}

export function bandTheta0(bandIndex: number, bandCount: number): number {
  return (bandIndex / Math.max(bandCount, 1)) * Math.PI * 2;
}

export function sampleRadiusFromDensity(
  rng: () => number,
  z: ZoneBreaks,
  steps = 512,
): number {
  const weights: number[] = [];
  let total = 0;
  for (let i = 0; i < steps; i += 1) {
    const r = z.eyeRadius + (1 - z.eyeRadius) * ((i + 0.5) / steps);
    const w = coverageDensity(r, z);
    weights.push(w);
    total += w;
  }
  if (total <= 0) return (z.eyeRadius + 1) / 2;
  let pick = rng() * total;
  for (let i = 0; i < steps; i += 1) {
    pick -= weights[i];
    if (pick <= 0) {
      return z.eyeRadius + (1 - z.eyeRadius) * ((i + 0.5) / steps);
    }
  }
  return 1;
}

export function spiralCurvePoints(
  theta0: number,
  b: number,
  r0: number,
  rMax: number,
  stormRadiusPx: number,
  steps: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const r = lerp(r0, rMax, i / steps);
    const theta = spiralTheta(r0, b, r, theta0);
    pts.push(polarToXy(r, theta, stormRadiusPx));
  }
  return pts;
}
