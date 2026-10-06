import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, onClose, label, className = "" }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = ref.current;
    const focusable = () =>
      [
        ...dialog.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex="0"]',
        ),
      ].filter((el) => !el.disabled && el.getClientRects().length > 0);
    (focusable()[0] || dialog).focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key === "Tab") {
        const elements = focusable();
        if (!elements.length) {
          event.preventDefault();
          return;
        }
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    dialog.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener("keydown", onKey);
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`modal-panel ${className}`}
      >
        {children}
      </section>
    </div>,
    document.body,
  );
}
