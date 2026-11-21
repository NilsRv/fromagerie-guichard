import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function MealHelp({ label, children }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const root = useRef(null);
  const bubble = useRef(null);
  const timer = useRef(null);
  const id = useId();
  const cancelDelay = useCallback(() => clearTimeout(timer.current), []);
  function show() {
    cancelDelay();
    setOpen(true);
  }
  const hide = useCallback(() => {
    cancelDelay();
    setOpen(false);
  }, [cancelDelay]);
  function leave() {
    cancelDelay();
    timer.current = setTimeout(() => setOpen(false), 140);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    let frame;
    function place() {
      if (!root.current || !bubble.current) return;
      const anchor = root.current.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 32);
      const height = bubble.current.getBoundingClientRect().height;
      const left = Math.max(
        16,
        Math.min(anchor.left - 22, window.innerWidth - width - 16),
      );
      const headerBottom =
        document.querySelector(".header")?.getBoundingClientRect().bottom ?? 0;
      const above = anchor.top - height - 10 >= Math.max(16, headerBottom + 12);
      if (anchor.bottom < headerBottom || anchor.top > window.innerHeight) {
        hide();
        return;
      }
      const top = Math.max(
        16,
        Math.min(
          above ? anchor.top - height - 10 : anchor.bottom + 10,
          window.innerHeight - height - 16,
        ),
      );
      setPosition((previous) =>
        previous &&
        previous.left === left &&
        previous.top === top &&
        previous.width === width &&
        previous.above === above
          ? previous
          : { left, top, width, above },
      );
    }
    function schedule() {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = null;
          place();
        });
    }
    place();
    const observer = new ResizeObserver(schedule);
    observer.observe(root.current);
    observer.observe(bubble.current);
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [open, hide]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (
        !root.current?.contains(event.target) &&
        !bubble.current?.contains(event.target)
      )
        hide();
    };
    const escape = (event) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, hide]);
  return (
    <span
      className="occasion-help"
      ref={root}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        cancelDelay();
        timer.current = setTimeout(() => setOpen(true), 100);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") leave();
      }}
    >
      <button
        type="button"
        className="occasion-help-button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) show();
        }}
        onBlur={hide}
        onClick={() => {
          cancelDelay();
          setOpen((current) => !current);
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      {open &&
        createPortal(
          <span
            ref={bubble}
            id={id}
            role="tooltip"
            className="occasion-help-bubble"
            data-above={position?.above || undefined}
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              width: position?.width ?? Math.min(320, window.innerWidth - 32),
              visibility: position ? "visible" : "hidden",
            }}
            onPointerEnter={cancelDelay}
            onPointerLeave={leave}
          >
            {children}
          </span>,
          document.body,
        )}
    </span>
  );
}
