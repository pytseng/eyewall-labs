import {
  bandTheta0,
  spiralB,
  spiralCurvePoints,
} from "./geometry";
import type { Tile } from "./generate";
import type { StormParams } from "./params";
import { TileView } from "./Tile";

function DebugRings({ params }: { params: StormParams }) {
  const R = params.stormDiameterPx / 2;
  const rings = [
    params.eyeRadius,
    params.eyewallOuter,
    params.overcastOuter,
    params.bandsOuter,
    1,
  ];
  return (
    <svg
      width={params.stormDiameterPx}
      height={params.stormDiameterPx}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {rings.map((r) => (
        <circle
          key={r}
          cx={R}
          cy={R}
          r={r * R}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.28}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

function DebugBands({ params }: { params: StormParams }) {
  const R = params.stormDiameterPx / 2;
  const r0 = Math.max(params.eyeRadius, 1e-4);
  const b = spiralB(params.pitchAngle, params.bandWraps, r0);
  const bandCount = Math.max(1, Math.round(params.bandCount));
  return (
    <svg
      width={params.stormDiameterPx}
      height={params.stormDiameterPx}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {Array.from({ length: bandCount }, (_, i) => {
        const pts = spiralCurvePoints(
          bandTheta0(i, bandCount),
          b,
          r0,
          1,
          R,
          240,
        );
        const d = pts
          .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x + R} ${p.y + R}`)
          .join(" ");
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

export function StormField({
  tiles,
  params,
}: {
  tiles: Tile[];
  params: StormParams;
}) {
  const painted = [...tiles].sort((a, b) => b.r - a.r);
  const size = params.stormDiameterPx;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "#0a0a0a",
      }}
    >
      {painted.map((tile) => (
        <TileView key={tile.id} tile={tile} />
      ))}
      {params.showBandCurves ? <DebugBands params={params} /> : null}
      {params.showDebugRings ? <DebugRings params={params} /> : null}
    </div>
  );
}
