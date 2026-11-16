import { AnimatedDetails } from "./AnimatedDetails";
import { Link } from "./ui";

export function ProductInformation({ product }) {
  const plateau = product.id === "plateau";
  return (
    <>
      <div className="plateau-accordions">
        <AnimatedDetails title="Composition & allergènes">
          <p>
            {product.allergens}{" "}
            {plateau
              ? "La composition varie selon les fromages disponibles. Précisez vos préférences lors de votre demande."
              : "Pour toute contrainte alimentaire, contactez la boutique avant votre demande."}
          </p>
          <a href="tel:+33146642610">Une question ? 01 46 64 26 10</a>
        </AnimatedDetails>
        <AnimatedDetails title="Votre retrait en boutique">
          <p>
            Au 18 rue Guichard, à Cachan. Prévoyez au moins deux jours. La
            boutique vous appelle pour confirmer{" "}
            {plateau ? "la composition et le" : "les produits, le prix et le"}{" "}
            créneau souhaité.
          </p>
          <p>Règlement sur place au retrait.</p>
          <Link to="/contact">Trouver la fromagerie</Link>
        </AnimatedDetails>
      </div>
      <p className="plateau-pickup-note">
        À retirer à Cachan · Règlement en boutique.
      </p>
    </>
  );
}
