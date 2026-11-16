import { useEffect, useRef } from "react";
export function Dialog({ children, onClose, label, className = "" }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement;
    el.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      data-lenis-prevent
    >
      <div className="dialog-inner">{children}</div>
    </dialog>
  );
}
