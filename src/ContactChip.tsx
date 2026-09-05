import { useEffect, useRef, useState } from "react";

const EMAIL = "info@eyewalllabs.com";

function copyEmailSync() {
  const field = document.createElement("textarea");
  field.value = EMAIL;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "0";
  field.style.left = "0";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.focus();
  field.select();
  field.setSelectionRange(0, EMAIL.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(field);
  return ok;
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.25"
        y="5.25"
        width="7.5"
        height="7.5"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10.6 5.2V3.9A1.65 1.65 0 0 0 8.95 2.25H3.9A1.65 1.65 0 0 0 2.25 3.9v5.05A1.65 1.65 0 0 0 3.9 10.6h1.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.4 8.3 6.4 11.2 12.6 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContactChip({ hideKicker = false }: { hideKicker?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const markCopied = () => {
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const onCopy = () => {
    markCopied();
    copyEmailSync();
    void navigator.clipboard?.writeText(EMAIL).catch(() => {});
  };

  return (
    <button
      type="button"
      className={`site-contact${copied ? " is-copied" : ""}${hideKicker ? " is-plain" : ""}`}
      onClick={onCopy}
      aria-label={
        copied
          ? `Copied ${EMAIL}`
          : `Copy business email ${EMAIL}`
      }
    >
      {hideKicker && !copied ? null : (
        <span className="site-contact__kicker">
          {copied ? "Copied" : "Business"}
        </span>
      )}
      <span className="site-contact__row">
        <span className="site-contact__email">{EMAIL}</span>
        <span className="site-contact__icon" aria-hidden>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </span>
      </span>
    </button>
  );
}
