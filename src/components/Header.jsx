import { useEffect, useRef, useState } from "react";
import { Menu, X, ShoppingBasket } from "lucide-react";
import { Link } from "./ui";
import { Wordmark } from "./Wordmark";
import { navigationLinks as links } from "../routes";
export function Header({ path, count, onCart }) {
  const [menu, setMenu] = useState(false);
  const basket = useRef(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const footer = document.querySelector(".footer");
      if (!footer || !basket.current) return;
      const rect = basket.current.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      basket.current.classList.toggle(
        "on-footer",
        footerRect.top <= center && footerRect.bottom > center,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [path]);
  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    if (!menu) return;
    const fn = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    };
    const outside = (e) => {
      if (!e.target.closest(".header")) setMenu(false);
    };
    window.addEventListener("keydown", fn);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", fn);
      document.removeEventListener("pointerdown", outside);
    };
  }, [menu]);
  return (
    <>
      <header className="header">
        <Link
          to="/"
          className="brand"
          aria-label="Fromagerie Guichard, accueil"
        >
          <Wordmark />
        </Link>
        <div className="header-actions">
          <button
            className="menu-toggle icon-button"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menu}
            aria-controls="main-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          id="main-navigation"
          className={menu ? "nav open" : "nav"}
          aria-label="Navigation principale"
          onClick={(e) => {
            if (e.target.closest("a")) setMenu(false);
          }}
        >
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              aria-current={path === to ? "page" : undefined}
              aria-label={label}
            >
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
      </header>
      <div className="floating-cart" ref={basket}>
        <button
          className="cart-button"
          onClick={() => {
            setMenu(false);
            onCart();
          }}
          aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
        >
          <ShoppingBasket size={21} />
          <span className="cart-word">Panier</span>
          <span className="cart-count">({count})</span>
        </button>
      </div>
    </>
  );
}
