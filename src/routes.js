import { plateauProductPaths } from "./catalog.js";
export const navigationLinks = [
  ["/plateaux", "Plateaux"],
  ["/raclettes", "Raclettes"],
  ["/fondues", "Fondues"],
  ["/autres-produits", "Épicerie"],
  ["/a-propos", "La maison"],
  ["/contact", "Contact"],
];
export const routeRedirects = {
  "/fromages": "/raclettes",
  ...Object.fromEntries(plateauProductPaths.map((path) => [path, "/plateaux"])),
  "/produit/raclette": "/raclettes",
  "/produit/fondue": "/fondues",
};
export const seasonalProducts = {
  "/raclettes": "raclette",
  "/fondues": "fondue",
};
export function routeName() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const destination = routeRedirects[path];
  if (destination)
    history.replaceState(
      history.state,
      "",
      `${destination}${window.location.search}${window.location.hash}`,
    );
  return destination || path;
}

export const collectionPaths = new Set(["/autres-produits"]);
export const publicRoutes = new Set([
  "/",
  ...navigationLinks.map(([path]) => path),
  "/informations",
  "/gestion",
]);
