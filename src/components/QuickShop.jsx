import { addCartItem } from "../domain/cart";
import { MAX_QUANTITY } from "../domain/constants";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { Link, Photo } from "./ui";
import { QuantitySelect } from "./QuantitySelect";
import { formatPrice } from "../catalog";

export function QuickShop({
  product: p,
  trigger,
  cart,
  onAdd,
  onCart,
  onClose,
}) {
  const dialog = useRef(null);
  const timer = useRef(null);
  const closing = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [option, setOption] = useState(p.options[0]);
  const [quantity, setQuantity] = useState(1);
  const titleId = useId();
  const existing =
    cart.find((line) => line.id === p.id && line.option === option)?.quantity ||
    0;
  const remaining = Math.max(0, MAX_QUANTITY - existing);
  const amount = Math.min(quantity, remaining);
  const unitPrice = p.prices[option];
  const canAdd = amount > 0 && addCartItem(cart, p, option, amount) !== cart;

  useEffect(() => {
    const element = dialog.current;
    const previous = trigger || document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    element.querySelector(".quick-shop-close")?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer.current);
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) {
        // The card action is normally hidden until hover or focus. Make it
        // focusable before restoring focus; :focus-within then keeps it visible.
        const action = previous.closest(".catalog-quick-action");
        if (action) {
          action.style.transition = "none";
          action.style.visibility = "visible";
          action.getBoundingClientRect();
        }
        previous.focus({ preventScroll: true });
        if (action) {
          action.style.visibility = "";
          action.style.transition = "";
        }
      }
    };
  }, []);

  function close(afterClose) {
    if (closing.current) return;
    closing.current = true;
    setLeaving(true);
    const finish = () => {
      onClose();
      afterClose?.();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else timer.current = setTimeout(finish, 250);
  }
  function submit(e) {
    e.preventDefault();
    if (closing.current || !canAdd) return;
    close(() => {
      onAdd(p, option, amount);
      onCart();
    });
  }
  return createPortal(
    <dialog
      ref={dialog}
      className={`quick-shop ${leaving ? "is-closing" : ""}`}
      aria-labelledby={titleId}
      data-lenis-prevent
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const elements = [
          ...dialog.current.querySelectorAll(
            "button:not(:disabled), a[href], select:not(:disabled), input:checked",
          ),
        ];
        const first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="quick-shop-panel">
        <button
          type="button"
          className="quick-shop-close"
          aria-label="Fermer l’achat rapide"
          onClick={() => close()}
        >
          <X size={20} />
        </button>
        <div className="quick-shop-photo">
          <Photo name={p.image} alt={p.name} priority />
        </div>
        <div className="quick-shop-content">
          <h2 id={titleId}>{p.name}</h2>
          <div
            className="quick-shop-price"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatPrice(unitPrice * (amount || 1))}
            {amount > 1 && (
              <span>
                {amount} × {formatPrice(unitPrice)}
              </span>
            )}
          </div>
          <form onSubmit={submit}>
            {p.pricePerKg && (
              <fieldset className="plateau-formats" disabled={leaving}>
                <legend>poids</legend>
                <div className="quick-shop-formats">
                  {p.options.map((o) => (
                    <label className="plateau-format" key={o}>
                      <input
                        type="radio"
                        name={`quick-format-${p.id}`}
                        value={o}
                        aria-label={o}
                        checked={option === o}
                        onChange={() => setOption(o)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="quick-shop-actions">
              <QuantitySelect
                value={amount}
                max={remaining}
                disabled={remaining === 0 || leaving}
                onChange={setQuantity}
              />
              <button
                type="submit"
                className="plateau-add"
                disabled={!canAdd || leaving}
              >
                {!canAdd ? "Limite atteinte" : "Ajouter au panier"}
                <Plus size={18} />
              </button>
            </div>
            {!canAdd && (
              <p className="quick-shop-limit" role="status">
                Votre panier a atteint sa limite pour cette sélection.
              </p>
            )}
          </form>
          <Link to={`/produit/${p.id}`} className="quick-shop-product-link">
            Voir la fiche produit
          </Link>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
