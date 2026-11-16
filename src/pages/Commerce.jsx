import { ProductPurchaseForm } from "../components/ProductPurchaseForm";
import { ProductInformation } from "../components/ProductInformation";
import { MAX_QUANTITY } from "../domain/constants";
import { useRef, useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { Link, Photo } from "../components/ui";
import { products, formatPrice } from "../catalog";
import { QuickShop } from "../components/QuickShop";
import { ProductGallery } from "../components/ProductGallery";

function CatalogCard({ product: p, cart, onAdd, onCart, onQuickShop }) {
  const cut = Boolean(p.pricePerKg);
  const atLimit =
    !cut &&
    (cart.find((line) => line.id === p.id && line.option === p.options[0])
      ?.quantity || 0) >= MAX_QUANTITY;
  return (
    <article className="selection-product">
      <div className="catalog-product-media">
        <Link
          to={`/produit/${p.id}`}
          className="catalog-product-photo product-card"
          aria-label={`Découvrir ${p.name}`}
        >
          <Photo name={p.image} alt={p.name} />
        </Link>
        <div className="catalog-quick-action">
          <button
            type="button"
            className="catalog-card-action"
            aria-haspopup="dialog"
            aria-label={
              cut
                ? `Achat rapide : ${p.name}`
                : atLimit
                  ? `Voir le panier pour ${p.name}`
                  : `Ajouter ${p.name} au panier`
            }
            onClick={(e) => {
              if (cut) onQuickShop(p, e.currentTarget);
              else {
                if (!atLimit) onAdd(p, p.options[0]);
                onCart();
              }
            }}
          >
            {cut
              ? "Choisir le poids"
              : atLimit
                ? "Voir le panier"
                : "Ajouter au panier"}
            <ShoppingBasket size={16} />
          </button>
        </div>
      </div>
      <div className="selection-product-heading">
        <h2>
          <Link to={`/produit/${p.id}`}>{p.name}</Link>
        </h2>
        <span className="catalog-product-price">
          {formatPrice(p.pricePerKg ?? p.prices[p.options[0]])}
          {p.pricePerKg ? <small>/kg</small> : null}
        </span>
      </div>
      <p>{p.usage}</p>
    </article>
  );
}
export function ProductList({ items, cart, onAdd, onCart }) {
  const [quickProduct, setQuickProduct] = useState(null);
  const trigger = useRef(null);
  return (
    <>
      <div className="selection-grid">
        {items.map((p) => (
          <CatalogCard
            key={p.id}
            product={p}
            cart={cart}
            onAdd={onAdd}
            onCart={onCart}
            onQuickShop={(product, source) => {
              trigger.current = source;
              setQuickProduct(product);
            }}
          />
        ))}
      </div>
      {quickProduct && (
        <QuickShop
          key={quickProduct.id}
          product={quickProduct}
          trigger={trigger.current}
          cart={cart}
          onAdd={onAdd}
          onCart={onCart}
          onClose={() => setQuickProduct(null)}
        />
      )}
    </>
  );
}
export function ProductPage({ product: p, cart, onAdd, onCart }) {
  const siblings = products.filter(
    (item) => item.category === p.category && item.id !== p.id,
  );
  return (
    <div className="product-page plateau-page">
      <section
        className="plateau-order page-pad"
        aria-labelledby="product-title"
      >
        <div className="plateau-layout">
          <ProductGallery
            photos={[{ name: p.image, label: p.name }]}
            caption="Photographie de notre sélection. Disponibilité à confirmer avec la boutique."
          />
          <div className="plateau-details">
            <h1 id="product-title">
              <em>{p.name}</em>
            </h1>
            <p className="plateau-description">{p.description}</p>
            <ProductPurchaseForm
              product={p}
              cart={cart}
              onAdd={onAdd}
              onCart={onCart}
            />
            <ProductInformation product={p} />
          </div>
        </div>
      </section>
      <nav
        className="plateau-more page-pad"
        aria-label="Poursuivre votre sélection"
      >
        <span>Au comptoir aussi</span>
        {siblings.map((item) => (
          <Link to={`/produit/${item.id}`} key={item.id}>
            {item.name}
          </Link>
        ))}
        <Link
          to={`/${p.category}`}
          className="product-back"
          onClick={(e) => {
            if (
              !e.metaKey &&
              !e.ctrlKey &&
              !e.shiftKey &&
              !e.altKey &&
              e.button === 0 &&
              history.state?.from === `/${p.category}`
            ) {
              e.preventDefault();
              history.back();
            }
          }}
        >
          Toute la sélection
        </Link>
      </nav>
    </div>
  );
}
