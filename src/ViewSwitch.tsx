import type { ReactNode } from "react";

export type LandingView = "default" | "generate";

function VideoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 10.2v3.6l3.4-1.8-3.4-1.8Z" fill="currentColor" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16M4 16h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="8" r="2.1" fill="currentColor" />
      <circle cx="15" cy="16" r="2.1" fill="currentColor" />
    </svg>
  );
}

function SwitchButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`view-switch__btn${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function ViewSwitch({
  view,
  onChange,
}: {
  view: LandingView;
  onChange: (view: LandingView) => void;
}) {
  return (
    <div className="view-switch">
      <SwitchButton
        active={view === "default"}
        label="Video landing"
        onClick={() => onChange("default")}
      >
        <VideoIcon />
      </SwitchButton>
      <SwitchButton
        active={view === "generate"}
        label="Generated storm"
        onClick={() => onChange("generate")}
      >
        <SlidersIcon />
      </SwitchButton>
    </div>
  );
}
