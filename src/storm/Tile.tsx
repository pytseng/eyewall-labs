import type { Kind, Tile } from "./generate";

const FILL: Record<Kind, string> = {
  video: "#e8e8e8",
  dashboard: "#d2d2d2",
  chart: "#bcbcbc",
  code: "#a8a8a8",
  screenshot: "#949494",
  debris: "#7a7a7a",
};

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
        backfaceVisibility: "hidden",
        background: FILL[tile.kind],
        border: "1px solid #2a2a2a",
        boxSizing: "border-box",
        overflow: "hidden",
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: 2,
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 7,
          lineHeight: 1.1,
          color: "#111",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {tile.kind} {tile.bandIndex === null ? "s" : tile.bandIndex}
      </span>
    </div>
  );
}
