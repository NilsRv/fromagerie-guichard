import { useEffect, useRef } from "react";
import { products } from "../catalog";
import { navigationLinks as links } from "../routes";
export function usePageMetadata(path) {
  const previousPath = useRef(path);
  useEffect(() => {
    if (previousPath.current !== path) {
      const heading = document.querySelector("#main h1");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      previousPath.current = path;
    }
    const routeProduct = products.find((p) => path === `/produit/${p.id}`);
    const name =
      routeProduct?.name ||
      links.find(([to]) => to === path)?.[1] ||
      {
        "/informations": "Informations & confidentialité",
        "/gestion": "Espace boutique",
      }[path];
    document.title = name
      ? `${name} — Fromagerie Guichard, Cachan`
      : path === "/"
        ? "Fromagerie Guichard — Fromages & plateaux à Cachan"
        : "Page introuvable — Fromagerie Guichard";
    const descriptions = {
      "/": "Fromagerie Guichard à Cachan. Fromages à la coupe, plateaux à partager et épicerie. Retrouvez-nous au 18 rue Guichard.",
      "/plateaux":
        "Choisissez un plateau de fromages à partager, de 4 à 12 personnes, à partir de 35 €. Retrait à la Fromagerie Guichard à Cachan.",
      "/fromages":
        "Comté, chèvres et tommettes : découvrez une sélection du comptoir de la Fromagerie Guichard, 18 rue Guichard à Cachan.",
      "/autres-produits":
        "Pâte de coing, pâtes de fruits et crèmerie : les accompagnements de la Fromagerie Guichard à Cachan.",
      "/a-propos":
        "Découvrez la Fromagerie Guichard, une fromagerie de quartier au 18 rue Guichard à Cachan.",
      "/contact":
        "Retrouvez la Fromagerie Guichard au 18 rue Guichard, 94230 Cachan. Itinéraire, horaires sur Google et téléphone : 01 46 64 26 10.",
      "/informations":
        "Informations sur les demandes de retrait, les données personnelles et le contact de la Fromagerie Guichard.",
    };
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        routeProduct
          ? `${routeProduct.name} à la Fromagerie Guichard à Cachan. ${routeProduct.detail}`
          : descriptions[path] || "Fromagerie Guichard, Cachan.",
      );
  }, [path]);
}
