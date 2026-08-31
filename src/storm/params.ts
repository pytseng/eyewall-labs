export type StormParams = {
  seed: number;
  eyeRadius: number;
  eyewallOuter: number;
  overcastOuter: number;
  bandsOuter: number;
  bandCount: number;
  pitchAngle: number;
  bandWraps: number;
  tileCount: number;
  scatterRatio: number;
  jitterInner: number;
  jitterOuter: number;
  rotDeviationInner: number;
  rotDeviationOuter: number;
  sizeMin: number;
  sizeMax: number;
  aspectMin: number;
  aspectMax: number;
  opacityEyewall: number;
  opacityFringe: number;
  stormDiameterPx: number;
  viewTiltDeg: number;
  spinRpm: number;
  spinFalloff: number;
  showDebugRings: boolean;
  showBandCurves: boolean;
};

export const defaultParams: StormParams = {
  seed: 1,
  eyeRadius: 0.055,
  eyewallOuter: 0.085,
  overcastOuter: 0.35,
  bandsOuter: 0.75,
  bandCount: 4,
  pitchAngle: 15,
  bandWraps: 1.8,
  tileCount: 800,
  scatterRatio: 0.28,
  jitterInner: 0.004,
  jitterOuter: 0.055,
  rotDeviationInner: 2,
  rotDeviationOuter: 6,
  sizeMin: 10,
  sizeMax: 36,
  aspectMin: 1.15,
  aspectMax: 2.4,
  opacityEyewall: 1,
  opacityFringe: 0.35,
  stormDiameterPx: 920,
  viewTiltDeg: 45,
  spinRpm: 0.35,
  spinFalloff: 1,
  showDebugRings: true,
  showBandCurves: true,
};
