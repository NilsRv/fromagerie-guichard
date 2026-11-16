import { MAX_QUANTITY } from "../domain/constants";
import { changeCartQuantity } from "../domain/cart";
import { useEffect, useState } from "react";
import { X, Plus, Minus, MapPin, ShoppingBasket } from "lucide-react";
import { products, formatPrice } from "../catalog";
import { Checkout, Receipt } from "../Checkout";
import { Dialog } from "./Dialog";
import { Photo, useNavigate } from "./ui";
export function Cart({ cart, setCart, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [receipt, setReceipt] = useState(null);
  useEffect(() => {
    document.querySelector(".cart-dialog")?.scrollTo(0, 0);
  }, [step, receipt]);
  const total = cart.reduce((a, c) => a + c.quantity, 0);
  const lines = cart.map((x) => ({
    ...x,
    product: products.find((p) => p.id === x.id),
  }));
  const pricedTotal = lines.reduce(
    (sum, x) => sum + (x.product.prices?.[x.option] || 0) * x.quantity,
    0,
  );
  const hasUnpriced = lines.some(
    (x) => x.product.prices?.[x.option] === undefined,
  );
  function change(i, d) {
    setCart((current) => changeCartQuantity(current, i, d));
  }
  return (
    <Dialog label="Votre panier" onClose={onClose} className="cart-dialog">
      <div className="cart-head">
        <span className="eyebrow">À RETIRER EN BOUTIQUE</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Fermer le panier"
        >
          <X />
        </button>
      </div>
      {!receipt && (
        <h2>
          Votre <em>{step ? "retrait" : "panier"}</em> <sup>{total}</sup>
        </h2>
      )}
      {receipt ? (
        <Receipt receipt={receipt} products={products} onClose={onClose} />
      ) : !cart.length ? (
        <div className="empty-cart">
          <ShoppingBasket size={50} strokeWidth={1} />
          <h3>
            Il manque un peu
            <br />
            de fromage par ici.
          </h3>
          <p>Un plateau pour les amis ou une envie pour ce soir ?</p>
          <button
            className="button"
            onClick={() => {
              onClose();
              navigate("/plateaux");
            }}
          >
            Découvrir les plateaux{" "}
          </button>
        </div>
      ) : step === 0 ? (
        <>
          <div className="cart-lines">
            {lines.map((x, i) => (
              <div className="cart-line" key={x.id + x.option}>
                <Photo name={x.product.image} alt={x.product.name} />
                <div>
                  <h3>{x.product.name}</h3>
                  <p>
                    {x.option}
                    {x.product.prices?.[x.option] !== undefined &&
                      ` · ${formatPrice(x.product.prices[x.option] * x.quantity)}`}
                  </p>
                  <div className="quantity">
                    <button
                      onClick={() => change(i, -1)}
                      aria-label={`Réduire ${x.product.name}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{x.quantity}</span>
                    <button
                      disabled={x.quantity >= MAX_QUANTITY}
                      onClick={() => change(i, 1)}
                      aria-label={`Augmenter ${x.product.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="remove-item icon-button"
                  onClick={() => setCart(cart.filter((_, n) => n !== i))}
                  aria-label={`Retirer ${x.product.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className="clear-cart" onClick={() => setCart([])}>
            Vider le panier
          </button>
          <div className="cart-bottom">
            <div className="cart-total">
              <span>
                {hasUnpriced && pricedTotal ? "Total plateaux" : "Total"}
              </span>
              <span>
                {pricedTotal ? formatPrice(pricedTotal) : "À confirmer"}
              </span>
            </div>
            {hasUnpriced && pricedTotal > 0 && (
              <p>Prix des autres produits à confirmer avec la boutique.</p>
            )}
            <p>
              Votre demande est confirmée par la boutique avant préparation.
              Aucun paiement en ligne.
            </p>
            <button className="button" onClick={() => setStep(1)}>
              Préparer mon retrait{" "}
            </button>
            <span className="pickup-line">
              <MapPin size={15} /> 18 rue Guichard, Cachan
            </span>
          </div>
        </>
      ) : (
        <Checkout
          cart={cart}
          onBack={() => setStep(0)}
          onSubmitted={(r) => {
            setReceipt(r);
            setCart([]);
          }}
        />
      )}
    </Dialog>
  );
}
