import type { Kind, Tile } from "./generate";

const FILL: Record<Kind, string> = {
  video: "#e8e8e8",
  dashboard: "#d2d2d2",
  chart: "#bcbcbc",
  code: "#a8a8a8",
  screenshot: "#949494",
  debris: "#7a7a7a",
};

const BACK_FILL: Record<Kind, string> = {
  video: "#6e6e6e",
  dashboard: "#5c5c5c",
  chart: "#525252",
  code: "#484848",
  screenshot: "#404040",
  debris: "#363636",
};

function Face({
  tile,
  side,
}: {
  tile: Tile;
  side: "front" | "back";
}) {
  const fill = side === "front" ? FILL[tile.kind] : BACK_FILL[tile.kind];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: fill,
        border: "1px solid #2a2a2a",
        boxSizing: "border-box",
        padding: 2,
        backfaceVisibility: "hidden",
        transform: side === "back" ? "rotateY(180deg)" : undefined,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 7,
          lineHeight: 1.1,
          color: side === "front" ? "#111" : "#ddd",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {tile.kind} {tile.bandIndex === null ? "s" : tile.bandIndex}
      </span>
    </div>
  );
}

export function TileView({ tile }: { tile: Tile }) {
  return (
    <div
      data-zone={tile.zone}
      data-kind={tile.kind}
      style={{
        position: "absolute",
        left: `calc(50% + ${tile.x}px)`,
        top: `calc(50% + ${tile.y}px)`,
        width: tile.w,
        height: tile.h,
        opacity: tile.opacity,
        transformOrigin: "50% 100%",
        transform: `translate(-50%, -100%) rotateZ(${tile.rot}deg) rotateX(-90deg)`,
        transformStyle: "preserve-3d",
        pointerEvents: "none",
      }}
    >
      <Face tile={tile} side="front" />
      <Face tile={tile} side="back" />
    </div>
  );
}
