import type { Tile } from "./generate";
import {
  tileBillboardTransform,
  tileCurvePhi,
  tileCurveRho,
  tileStripCount,
  tileStripPose,
} from "./geometry";
import { atlasFaceStyle, atlasSlot } from "./media";

function Face({
  side,
  slot,
  stripIndex,
  stripCount,
  roundLeft,
  roundRight,
  opacity,
}: {
  side: "front" | "back";
  slot: number;
  stripIndex: number;
  stripCount: number;
  roundLeft: boolean;
  roundRight: boolean;
  opacity: number;
}) {
  const radius = 3;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        ...atlasFaceStyle(slot, side, stripIndex, stripCount),
        backgroundColor: "#141414",
        border: "1px solid #1a1a1a",
        boxSizing: "border-box",
        overflow: "hidden",
        backfaceVisibility: "hidden",
        opacity,
        transform: side === "back" ? "rotateY(180deg)" : undefined,
        borderTopLeftRadius: roundLeft ? radius : 0,
        borderBottomLeftRadius: roundLeft ? radius : 0,
        borderTopRightRadius: roundRight ? radius : 0,
        borderBottomRightRadius: roundRight ? radius : 0,
      }}
    />
  );
}

function Strip({
  slot,
  index,
  count,
  rho,
  phi,
  flatWidth,
  height,
  opacity,
}: {
  slot: number;
  index: number;
  count: number;
  rho: number;
  phi: number;
  flatWidth: number;
  height: number;
  opacity: number;
}) {
  const pose = tileStripPose(index, count, rho, phi, flatWidth);
  const roundLeft = index === 0;
  const roundRight = index === count - 1;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 0,
        width: pose.width,
        height,
        marginLeft: -pose.width / 2,
        transformOrigin: "50% 100%",
        transform: `translateZ(${pose.rho}px) rotateY(${pose.rotYDeg}deg) translateZ(${-pose.rho}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <Face
        side="front"
        slot={slot}
        stripIndex={index}
        stripCount={count}
        roundLeft={roundLeft}
        roundRight={roundRight}
        opacity={opacity}
      />
      <Face
        side="back"
        slot={slot}
        stripIndex={index}
        stripCount={count}
        roundLeft={roundRight}
        roundRight={roundLeft}
        opacity={opacity}
      />
    </div>
  );
}

export function TileView({ tile }: { tile: Tile }) {
  const slot = atlasSlot(tile.id, tile.kind);
  const orbital = Math.hypot(tile.x, tile.y);
  const rho = tileCurveRho(orbital, tile.r);
  const phi = tileCurvePhi(tile.w, rho, tile.r);
  const strips = tileStripCount(phi);

  return (
    <div
      data-storm-tile=""
      data-x={tile.x}
      data-y={tile.y}
      data-r={tile.r}
      data-rot-jitter={tile.rotJitter}
      data-zone={tile.zone}
      data-kind={tile.kind}
      data-slot={slot}
      data-strips={strips}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: tile.w,
        height: tile.h,
        transformOrigin: "50% 100%",
        transform: tileBillboardTransform(tile.x, tile.y, tile.rot),
        transformStyle: "preserve-3d",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: strips }, (_, i) => (
        <Strip
          key={i}
          slot={slot}
          index={i}
          count={strips}
          rho={rho}
          phi={phi}
          flatWidth={tile.w}
          height={tile.h}
          opacity={tile.opacity}
        />
      ))}
    </div>
  );
}
