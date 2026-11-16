import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export function QuantitySelect({ value, max, disabled, onChange }) {
  const root = useRef(null);
  const trigger = useRef(null);
  const typed = useRef({ text: "", at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(1, value));
  const id = useId();
  const expanded = open && !disabled;

  useEffect(() => {
    if (!expanded) return;
    function dismiss(e) {
      if (!root.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss, true);
    document.addEventListener("focusin", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss, true);
      document.removeEventListener("focusin", dismiss);
    };
  }, [expanded]);
  useEffect(() => {
    if (expanded)
      root.current
        ?.querySelector(`[data-quantity="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [expanded, active]);

  function choose(n) {
    onChange(n);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function show() {
    setActive(Math.max(1, Math.min(max, value)));
    setOpen(true);
  }
  return (
    <div className="quantity-select" ref={root}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label="Quantité"
        aria-describedby={`${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        aria-activedescendant={expanded ? `${id}-${active}` : undefined}
        disabled={disabled}
        className="quantity-select-trigger"
        onClick={() => {
          trigger.current?.focus({ preventScroll: true });
          if (expanded) setOpen(false);
          else show();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && expanded) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            return;
          }
          if (e.key === "Tab") {
            setOpen(false);
            return;
          }
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            if (!expanded) show();
            setActive((n) =>
              e.key === "Home"
                ? 1
                : e.key === "End"
                  ? max
                  : !expanded
                    ? Math.max(1, value)
                    : Math.max(
                        1,
                        Math.min(max, n + (e.key === "ArrowDown" ? 1 : -1)),
                      ),
            );
          } else if ((e.key === "Enter" || e.key === " ") && expanded) {
            e.preventDefault();
            choose(active);
          } else if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const now = Date.now();
            const text =
              now - typed.current.at < 700 ? typed.current.text + e.key : e.key;
            typed.current = { text, at: now };
            const n = Number(text);
            if (n >= 1 && n <= max) {
              setActive(n);
              setOpen(true);
            }
          }
        }}
      >
        <span id={`${id}-value`}>{value}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {expanded && (
        <div className="quantity-select-menu">
          <div className="quantity-select-heading" aria-hidden="true">
            Quantité
          </div>
          <div
            id={id}
            role="listbox"
            aria-label="Quantité"
            className="quantity-select-options"
          >
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                role="option"
                id={`${id}-${n}`}
                key={n}
                data-quantity={n}
                aria-selected={n === value}
                tabIndex={-1}
                className={n === active ? "is-active" : ""}
                onPointerMove={(e) => {
                  if (e.pointerType === "mouse") setActive(n);
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(n)}
              >
                <span>{n}</span>
                {n === value && <Check size={15} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
