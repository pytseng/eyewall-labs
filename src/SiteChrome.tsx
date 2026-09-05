import { useEffect, useId, useRef, useState } from "react";
import { ContactChip } from "./ContactChip";

const LOGO_SRC = "/media/eyewall-logo.png";

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.2 3.2 12.8 12.8M12.8 3.2 3.2 12.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteChrome({ showBrand = false }: { showBrand?: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="site-chrome">
      {showBrand ? (
        <div className="site-brand">
          <img
            className="site-brand__mark"
            src={LOGO_SRC}
            alt=""
            width={40}
            height={40}
          />
          <h1 className="site-brand__wordmark">Eyewall Labs</h1>
        </div>
      ) : null}

      <button
        type="button"
        className="site-about-btn"
        aria-expanded={open}
        aria-controls="site-about"
        onClick={() => setOpen(true)}
      >
        About
      </button>

      {open ? (
        <div className="site-overlay">
          <button
            type="button"
            className="site-overlay__scrim"
            aria-label="Close about"
            onClick={() => setOpen(false)}
          />
          <aside
            ref={panelRef}
            className="site-panel"
            id="site-about"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <div className="site-panel__top">
              <p className="site-panel__kicker">Est. 2026</p>
              <button
                type="button"
                className="site-panel__close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <h2 className="site-panel__title" id={titleId}>
              Eyewall Labs
            </h2>
            <div className="site-panel__copy">
              <p>
                We implement experimental design prototypes and help companies
                find value in AI transition.
              </p>
              <p>
                Before Eyewall Labs was founded, we designed industrial-level
                multi-platform tools, professional 3D authoring tools, mobile
                AR, VR, and web dashboards used by Airbus, Mercedes-Benz,
                Cartier, HOKA, Volkswagen, Nike, and others.
              </p>
            </div>
            <div className="site-panel__contact">
              <p className="site-panel__kicker">Contact</p>
              <ContactChip hideKicker />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
