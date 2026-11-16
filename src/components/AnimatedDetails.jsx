import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function AnimatedDetails({ title, children }) {
  const details = useRef(null);
  const content = useRef(null);
  const animation = useRef(null);
  const textAnimation = useRef(null);
  const target = useRef(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(
    () => () => {
      animation.current?.cancel();
      textAnimation.current?.cancel();
    },
    [],
  );
  function toggle(e) {
    e.preventDefault();
    const element = details.current;
    const height = element.getBoundingClientRect().height;
    animation.current?.cancel();
    textAnimation.current?.cancel();
    const opening = !target.current;
    target.current = opening;
    setExpanded(opening);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.open = opening;
      element.style.overflow = "";
      return;
    }
    element.open = true;
    const summaryHeight = element
      .querySelector("summary")
      .getBoundingClientRect().height;
    const end =
      summaryHeight +
      (opening ? content.current.getBoundingClientRect().height : 0) +
      1;
    element.style.overflow = "hidden";
    animation.current = element.animate(
      [{ height: `${height}px` }, { height: `${end}px` }],
      { duration: 500, easing: "ease-in-out" },
    );
    textAnimation.current = content.current.animate(
      opening
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 1 }, { opacity: 0 }],
      {
        duration: opening ? 300 : 200,
        delay: opening ? 100 : 0,
        fill: "backwards",
        easing: "ease-in-out",
      },
    );
    animation.current.onfinish = () => {
      element.open = opening;
      element.style.overflow = "";
      animation.current = null;
    };
  }
  return (
    <details ref={details} className="plateau-composition">
      <summary aria-expanded={expanded} onClick={toggle}>
        {title}
        <ChevronDown size={18} />
      </summary>
      <div ref={content}>{children}</div>
    </details>
  );
}
