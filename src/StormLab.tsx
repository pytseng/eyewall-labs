// Parked. App no longer imports this file, so leva and the generated storm stay cold.
import { useEffect, useMemo, useRef } from "react";
import { useControls } from "leva";
import { generateTiles } from "./storm/generate";
import { defaultParams, type StormParams } from "./storm/params";
import { collectBodies, omegaPeakFromRpm, stepBodies } from "./storm/spin";
import { StormField } from "./storm/StormField";

export function StormLab() {
  const controls = useControls("storm", {
    seed: { value: defaultParams.seed, step: 1 },
    stormDiameterPx: {
      value: defaultParams.stormDiameterPx,
      min: 320,
      max: 2800,
      step: 10,
    },
    viewTiltDeg: {
      value: defaultParams.viewTiltDeg,
      min: 0,
      max: 70,
      step: 1,
    },
    spinRpm: {
      value: defaultParams.spinRpm,
      min: 0,
      max: 4,
      step: 0.05,
    },
    spinFalloff: {
      value: defaultParams.spinFalloff,
      min: 0.5,
      max: 1.5,
      step: 0.05,
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

  const fieldRef = useRef<HTMLDivElement>(null);
  const tilt = params.viewTiltDeg;
  const perspectivePx = Math.max(900, params.stormDiameterPx * 1.35);
  const spinRpmRef = useRef(params.spinRpm);
  const spinFalloffRef = useRef(params.spinFalloff);
  const eyeRadiusRef = useRef(params.eyeRadius);
  const eyewallOuterRef = useRef(params.eyewallOuter);
  spinRpmRef.current = params.spinRpm;
  spinFalloffRef.current = params.spinFalloff;
  eyeRadiusRef.current = params.eyeRadius;
  eyewallOuterRef.current = params.eyewallOuter;

  useEffect(() => {
    const root = fieldRef.current;
    if (!root) return;
    const bodies = collectBodies(root);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const rpm = spinRpmRef.current;
      if (rpm !== 0 && bodies.length > 0) {
        stepBodies(
          bodies,
          dt,
          omegaPeakFromRpm(rpm),
          eyeRadiusRef.current,
          eyewallOuterRef.current,
          spinFalloffRef.current,
        );
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [tiles]);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-neutral-950"
      style={{
        perspective: `${perspectivePx}px`,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate(-50%, -50%) rotateX(${tilt}deg)`,
          transformOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
      >
        <StormField ref={fieldRef} tiles={tiles} params={params} />
      </div>
    </div>
  );
}
