import type { Tile } from "./generate";
import { tileBillboardTransform } from "./geometry";
import { atlasFaceStyle, atlasSlot } from "./media";

function Face({
  side,
  slot,
}: {
  side: "front" | "back";
  slot: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        ...atlasFaceStyle(slot, side),
        backgroundColor: "#141414",
        border: "1px solid #1a1a1a",
        boxSizing: "border-box",
        overflow: "hidden",
        backfaceVisibility: "hidden",
        transform: side === "back" ? "rotateY(180deg)" : undefined,
      }}
    />
  );
}

export function TileView({ tile }: { tile: Tile }) {
  const slot = atlasSlot(tile.id, tile.kind);
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
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: tile.w,
        height: tile.h,
        opacity: tile.opacity,
        transformOrigin: "50% 100%",
        transform: tileBillboardTransform(tile.x, tile.y, tile.rot),
        transformStyle: "preserve-3d",
        pointerEvents: "none",
      }}
    >
      <Face side="front" slot={slot} />
      <Face side="back" slot={slot} />
    </div>
  );
}

