import { memo, useEffect, useRef } from "react";
import { Link } from "./ui";
import { Wordmark } from "./Wordmark";
import { googleUrl } from "../catalog";
function Footer() {
  const footer = useRef(null);
  useEffect(() => {
    const element = footer.current;
    const brand = element.querySelector(".footer-brand");
    const content = element.querySelector(".footer-content");
    const label = brand.querySelector(".wordmark > span");
    let active = true;
    let lastWidth = 0;
    const fit = (force = false) => {
      if (!active) return;
      const contentStyle = getComputedStyle(content);
      const width =
        content.clientWidth -
        parseFloat(contentStyle.paddingLeft) -
        parseFloat(contentStyle.paddingRight);
      if (!width || (!force && width === lastWidth)) return;
      lastWidth = width;
      const currentSize = parseFloat(getComputedStyle(label).fontSize);
      const measuredWidth = label.getBoundingClientRect().width;
      if (measuredWidth) {
        element.style.setProperty(
          "--footer-brand-size",
          `${(currentSize * width * (2 / 3)) / measuredWidth}px`,
        );
      }
    };
    const observer = new ResizeObserver(() => fit());
    observer.observe(content);
    fit();
    document.fonts.ready.then(() => fit(true));
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  return (
    <footer className="footer" ref={footer}>
      <div className="footer-content">
        <Link
          className="footer-brand"
          to="/"
          aria-label="Fromagerie Guichard, accueil"
        >
          <Wordmark />
        </Link>
        <div className="footer-columns">
          <nav className="footer-column" aria-label="Les produits">
            <Link to="/plateaux">Plateaux</Link>
            <Link to="/fromages">Fromages</Link>
            <Link to="/autres-produits">Épicerie</Link>
          </nav>
          <nav className="footer-column" aria-label="La fromagerie">
            <Link to="/a-propos">La maison</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <address className="footer-column footer-address">
            <a href={googleUrl} target="_blank" rel="noreferrer">
              18 rue Guichard
              <br />
              94230 Cachan
            </a>
            <a href="tel:+33146642610">01 46 64 26 10</a>
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Fromagerie Guichard</span>
        <Link to="/informations">Informations & confidentialité</Link>
      </div>
    </footer>
  );
}

export default memo(Footer);
