import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Lenis from "lenis";
import { routeName } from "../routes";
export function useShopNavigation() {
  const [path, setPath] = useState(routeName);
  const lenis = useRef();
  const activeRoute = useRef(path);
  const scrollPositions = useRef(new Map());
  activeRoute.current = path;
  const clearPageTransition = useRef(() => {});
  const navigate = useCallback(
    (to) => {
      scrollPositions.current.set(path, window.scrollY);
      clearPageTransition.current();
      if (to === "/") {
        const scrollPosition = window.scrollY;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (routeName() !== to) {
          const main = document.getElementById("main");
          const bounds = main.getBoundingClientRect();
          const footer = document.querySelector(".footer");
          const footerTop = footer.getBoundingClientRect().top;
          const outgoing = !reduce.matches ? main.cloneNode(true) : null;
          if (outgoing) {
            outgoing.removeAttribute("id");
            outgoing
              .querySelectorAll("[id]")
              .forEach((node) => node.removeAttribute("id"));
            outgoing.inert = true;
            outgoing.setAttribute("aria-hidden", "true");
            outgoing.classList.add("page-return-snapshot");
            Object.assign(outgoing.style, {
              top: `${bounds.top}px`,
              left: `${bounds.left}px`,
              width: `${bounds.width}px`,
            });
            document.body.append(outgoing);
          }
          history.pushState({ from: path }, "", to);
          // Mount the landing before scrolling so there is no page swap at the end.
          flushSync(() => setPath(to));
          lenis.current?.resize();
          const start = Math.min(
            footerTop < window.innerHeight
              ? footer.getBoundingClientRect().top + window.scrollY - footerTop
              : scrollPosition,
            document.documentElement.scrollHeight - window.innerHeight,
          );
          if (lenis.current) lenis.current.scrollTo(start, { immediate: true });
          else window.scrollTo({ top: start, behavior: "instant" });
          if (outgoing) {
            // Both views move together while the outgoing content dissolves.
            const followScroll = () => {
              outgoing.style.transform = `translateY(${start - window.scrollY}px)`;
            };
            window.addEventListener("scroll", followScroll, { passive: true });
            const fade = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 220,
              easing: "ease-out",
              fill: "forwards",
            });
            const cleanup = () => {
              window.removeEventListener("scroll", followScroll);
              outgoing.remove();
              fade.cancel();
              clearPageTransition.current = () => {};
            };
            clearPageTransition.current = cleanup;
            fade.onfinish = cleanup;
          }
        }
        if (lenis.current && !reduce.matches) {
          lenis.current.scrollTo(0, {
            duration: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            lerp: 0,
          });
        } else {
          lenis.current?.scrollTo(0, { immediate: true });
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        return;
      }
      if (routeName() !== to) {
        history.pushState({ from: path }, "", to);
        setPath(to);
        lenis.current?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      }
    },
    [path],
  );
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const pop = () => {
      clearPageTransition.current();
      scrollPositions.current.set(activeRoute.current, window.scrollY);
      const destination = routeName();
      flushSync(() => setPath(destination));
      lenis.current?.resize();
      const position = scrollPositions.current.get(destination) || 0;
      lenis.current?.scrollTo(position, { immediate: true });
      window.scrollTo({ top: position, behavior: "instant" });
    };
    window.addEventListener("popstate", pop);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduce.matches) {
      lenis.current = new Lenis({
        autoRaf: true,
        duration: 1.05,
        smoothWheel: true,
        anchors: true,
      });
    }
    return () => {
      clearPageTransition.current();
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("popstate", pop);
      lenis.current?.destroy();
    };
  }, []);

  return { path, navigate };
}
