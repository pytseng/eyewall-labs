import { useEffect, useId, useRef, useState } from "react";
import { ContactChip } from "./ContactChip";

const LOGO_SRC = "/media/eyewall-logo.png";

const CLIENTS = [
  "Airbus",
  "Mercedes-Benz",
  "Cartier",
  "HOKA",
  "Volkswagen",
  "Nike",
];

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
          <h1 className="visually-hidden">Eyewall Labs</h1>
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
            <button
              type="button"
              className="site-panel__close"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <p className="site-panel__name" id={titleId}>
              Eyewall Labs
              <span>2026</span>
            </p>
            <p className="site-panel__copy">
              A studio for experimental design prototypes, and for finding
              value in an AI transition.
            </p>
            <p className="site-panel__note">
              Before Eyewall, products we designed were used by
            </p>
            <ul className="site-panel__clients">
              {CLIENTS.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <ContactChip />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
