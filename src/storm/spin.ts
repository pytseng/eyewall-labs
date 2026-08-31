import { facingEyeDeg, omegaAt, tileBillboardTransform } from "./geometry";

export type SpinBody = {
  el: HTMLDivElement;
  rho: number;
  theta: number;
  r: number;
  rotJitter: number;
};

export function collectBodies(root: HTMLElement): SpinBody[] {
  const nodes = root.querySelectorAll<HTMLDivElement>("[data-storm-tile]");
  const bodies: SpinBody[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i];
    const x = Number(el.dataset.x);
    const y = Number(el.dataset.y);
    const r = Number(el.dataset.r);
    const rotJitter = Number(el.dataset.rotJitter);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r)) {
      continue;
    }
    bodies.push({
      el,
      rho: Math.hypot(x, y),
      theta: Math.atan2(y, x),
      r,
      rotJitter: Number.isFinite(rotJitter) ? rotJitter : 0,
    });
  }
  return bodies;
}

export function stepBodies(
  bodies: SpinBody[],
  dt: number,
  omegaPeak: number,
  eyeRadius: number,
  eyewallOuter: number,
  falloff: number,
): void {
  const sign = -1;
  for (let i = 0; i < bodies.length; i += 1) {
    const body = bodies[i];
    const w = omegaAt(body.r, eyeRadius, eyewallOuter, omegaPeak, falloff);
    body.theta += sign * w * dt;
    const x = body.rho * Math.cos(body.theta);
    const y = body.rho * Math.sin(body.theta);
    const yaw = facingEyeDeg(x, y) + body.rotJitter;
    body.el.style.transform = tileBillboardTransform(x, y, yaw);
  }
}

export function omegaPeakFromRpm(spinRpm: number): number {
  return spinRpm * ((Math.PI * 2) / 60);
}
