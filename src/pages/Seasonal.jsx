import { ProductPurchaseForm } from "../components/ProductPurchaseForm";
import { ProductInformation } from "../components/ProductInformation";
import { ProductGallery } from "../components/ProductGallery";
import { Link } from "../components/ui";

export function SeasonalPage({ product, cart, onAdd, onAddMany, onCart }) {
  const raclette = product.id === "raclette";
  return (
    <div className="plateau-page seasonal-page">
      <section
        className="plateau-order page-pad"
        aria-labelledby="seasonal-title"
      >
        <div className="plateau-layout">
          <ProductGallery
            photos={[
              { name: product.image, label: "Les fromages de la boutique" },
            ]}
          />
          <div className="plateau-details">
            <h1 id="seasonal-title">
              les <em>{raclette ? "raclettes" : "fondues"}</em>
            </h1>
            <p className="plateau-description">{product.description}</p>
            <ProductPurchaseForm
              onAddMany={onAddMany}
              product={product}
              cart={cart}
              onAdd={onAdd}
              onCart={onCart}
            />
            <ProductInformation product={product} />
          </div>
        </div>
      </section>
      <nav
        className="plateau-more page-pad"
        aria-label="Poursuivre votre sélection"
      >
        <span>À partager aussi</span>
        <Link to={raclette ? "/fondues" : "/raclettes"}>
          {raclette ? "Les fondues" : "Les raclettes"}
        </Link>
        <Link to="/plateaux">Les plateaux</Link>
        <Link to="/autres-produits">L’épicerie</Link>
      </nav>
    </div>
  );
}
