import React, { useEffect, useRef } from "react";
import "../styles/components/Modal.css";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  ariaLabel,
}) {
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;

    const focusable = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] || containerRef.current;
    first.focus();

    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        const nodes = Array.from(focusable);
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const idx = nodes.indexOf(document.activeElement);
        if (e.shiftKey && idx === 0) {
          e.preventDefault();
          nodes[nodes.length - 1].focus();
        } else if (!e.shiftKey && idx === nodes.length - 1) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title || "Dialog"}
        className={`modal-container modal-${size}`}
        ref={containerRef}
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showClose && (
            <button className="modal-close-btn" aria-label="Close dialog" onClick={onClose}>
              X
            </button>
          )}
        </header>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
