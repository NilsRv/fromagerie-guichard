import { ProductPurchaseForm } from "../components/ProductPurchaseForm";
import { ProductInformation } from "../components/ProductInformation";
import { ProductGallery } from "../components/ProductGallery";
import { Link } from "../components/ui";
import { products } from "../catalog";

const plateau = products.find((p) => p.id === "plateau");
export function PlateauPage({ cart, onAdd, onCart }) {
  return (
    <div className="plateau-page">
      <section
        className="plateau-order page-pad"
        aria-labelledby="plateau-title"
      >
        <div className="plateau-layout">
          <ProductGallery />
          <div className="plateau-details">
            <h1 id="plateau-title">
              les <em>plateaux</em>
            </h1>
            <p className="plateau-description">
              Un plateau de fromages composé à la boutique, selon les fromages
              du moment et vos envies. Pour un apéro, un repas ou une grande
              tablée.
            </p>
            <ProductPurchaseForm
              product={plateau}
              cart={cart}
              onAdd={onAdd}
              onCart={onCart}
            />
            <ProductInformation product={plateau} />
          </div>
        </div>
      </section>
      <nav
        className="plateau-more page-pad"
        aria-label="Compléter votre sélection"
      >
        <span>Et pour accompagner ?</span>
        <Link to="/autres-produits">L’épicerie</Link>
        <Link to="/fromages">Les fromages à la coupe</Link>
      </nav>
    </div>
  );
}
