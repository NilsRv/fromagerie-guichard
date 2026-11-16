import { createContext, useContext } from "react";

const images = import.meta.glob(
  [
    "../../assets/autres.webp",
    "../../assets/boutique-interieur.webp",
    "../../assets/comptoir.webp",
    "../../assets/comptoir2.webp",
    "../../assets/comptoir7.webp",
    "../../assets/devanture.webp",
    "../../assets/employe.webp",
    "../../assets/fromage-enavant.webp",
    "../../assets/fromages1.webp",
    "../../assets/fromages2.webp",
    "../../assets/fromages4.webp",
    "../../assets/hero-fromages-v3.webp",
    "../../assets/pate-de-coing.webp",
    "../../assets/pates-de-fruits.webp",
    "../../assets/plateau1.webp",
    "../../assets/plateau2.webp",
    "../../assets/vitrine-exterieur2.webp",
  ],
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);
const NavigationContext = createContext((to) => window.location.assign(to));
export function NavigationProvider({ navigate, children }) {
  return (
    <NavigationContext.Provider value={navigate}>
      {children}
    </NavigationContext.Provider>
  );
}
export function useNavigate() {
  return useContext(NavigationContext);
}
export function Link({ to, children, className = "", onClick, ...rest }) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          !e.defaultPrevented &&
          rest.target !== "_blank" &&
          rest.download === undefined &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          e.button === 0
        ) {
          e.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
  ...rest
}) {
  return (
    <img
      src={images[`../../assets/${name}`]}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      {...rest}
    />
  );
}
export function DottedLink({ to, children, ...rest }) {
  const contents = <span>{children}</span>;
  return to.startsWith("/") ? (
    <Link to={to} className="paper-link dotted-cta" {...rest}>
      {contents}
    </Link>
  ) : (
    <a href={to} className="paper-link dotted-cta" {...rest}>
      {contents}
    </a>
  );
}
