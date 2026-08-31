import { useMemo } from "react";
import { useControls } from "leva";
import { generateTiles } from "./storm/generate";
import { defaultParams, type StormParams } from "./storm/params";
import { StormField } from "./storm/StormField";

export default function App() {
  const controls = useControls("storm", {
    seed: { value: defaultParams.seed, step: 1 },
    stormDiameterPx: {
      value: defaultParams.stormDiameterPx,
      min: 320,
      max: 1600,
      step: 10,
    },
    eyeRadius: {
      value: defaultParams.eyeRadius,
      min: 0.02,
      max: 0.2,
      step: 0.001,
    },
    eyewallOuter: {
      value: defaultParams.eyewallOuter,
      min: 0.04,
      max: 0.25,
      step: 0.001,
    },
    overcastOuter: {
      value: defaultParams.overcastOuter,
      min: 0.1,
      max: 0.6,
      step: 0.005,
    },
    bandsOuter: {
      value: defaultParams.bandsOuter,
      min: 0.4,
      max: 0.95,
      step: 0.005,
    },
    bandCount: { value: defaultParams.bandCount, min: 1, max: 8, step: 1 },
    pitchAngle: {
      value: defaultParams.pitchAngle,
      min: 5,
      max: 35,
      step: 0.5,
    },
    bandWraps: {
      value: defaultParams.bandWraps,
      min: 0.5,
      max: 3,
      step: 0.05,
    },
    tileCount: {
      value: defaultParams.tileCount,
      min: 100,
      max: 2000,
      step: 10,
    },
    scatterRatio: {
      value: defaultParams.scatterRatio,
      min: 0,
      max: 1,
      step: 0.01,
    },
    jitterInner: {
      value: defaultParams.jitterInner,
      min: 0,
      max: 0.08,
      step: 0.001,
    },
    jitterOuter: {
      value: defaultParams.jitterOuter,
      min: 0,
      max: 0.16,
      step: 0.001,
    },
    rotDeviationInner: {
      value: defaultParams.rotDeviationInner,
      min: 0,
      max: 45,
      step: 0.5,
    },
    rotDeviationOuter: {
      value: defaultParams.rotDeviationOuter,
      min: 0,
      max: 60,
      step: 0.5,
    },
    sizeMin: { value: defaultParams.sizeMin, min: 4, max: 80, step: 1 },
    sizeMax: { value: defaultParams.sizeMax, min: 8, max: 120, step: 1 },
    aspectMin: {
      value: defaultParams.aspectMin,
      min: 0.5,
      max: 3,
      step: 0.05,
    },
    aspectMax: {
      value: defaultParams.aspectMax,
      min: 0.5,
      max: 4,
      step: 0.05,
    },
    opacityEyewall: {
      value: defaultParams.opacityEyewall,
      min: 0,
      max: 1,
      step: 0.01,
    },
    opacityFringe: {
      value: defaultParams.opacityFringe,
      min: 0,
      max: 1,
      step: 0.01,
    },
    showDebugRings: { value: defaultParams.showDebugRings },
    showBandCurves: { value: defaultParams.showBandCurves },
  });

  const params = controls as StormParams;
  const tiles = useMemo(
    () => generateTiles(params),
    // params is a new object each render from leva; list fields explicitly
    [
      params.seed,
      params.eyeRadius,
      params.eyewallOuter,
      params.overcastOuter,
      params.bandsOuter,
      params.bandCount,
      params.pitchAngle,
      params.bandWraps,
      params.tileCount,
      params.scatterRatio,
      params.jitterInner,
      params.jitterOuter,
      params.rotDeviationInner,
      params.rotDeviationOuter,
      params.sizeMin,
      params.sizeMax,
      params.aspectMin,
      params.aspectMax,
      params.opacityEyewall,
      params.opacityFringe,
      params.stormDiameterPx,
    ],
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950">
      <StormField tiles={tiles} params={params} />
    </div>
  );
}
