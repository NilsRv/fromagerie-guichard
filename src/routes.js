import { plateauProductPaths } from "./catalog.js";
export const navigationLinks = [
  ["/plateaux", "Plateaux"],
  ["/fromages", "Fromages"],
  ["/autres-produits", "Épicerie"],
  ["/a-propos", "La maison"],
  ["/contact", "Contact"],
];
export const routeName = () => {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (plateauProductPaths.includes(path)) {
    history.replaceState(
      history.state,
      "",
      `/plateaux${window.location.search}${window.location.hash}`,
    );
    return "/plateaux";
  }
  return path;
};

export const collectionPaths = new Set(["/fromages", "/autres-produits"]);
export const publicRoutes = new Set([
  "/",
  ...navigationLinks.map(([path]) => path),
  "/informations",
  "/gestion",
]);
