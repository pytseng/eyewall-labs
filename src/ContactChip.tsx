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

export function ContactChip() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const onCopy = () => {
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
    copyEmailSync();
    void navigator.clipboard?.writeText(EMAIL).catch(() => {});
  };

  return (
    <button
      type="button"
      className={`site-contact${copied ? " is-copied" : ""}`}
      onClick={onCopy}
      aria-label={copied ? `Copied ${EMAIL}` : `Copy ${EMAIL}`}
    >
      {copied ? "Copied" : EMAIL}
    </button>
  );
}
