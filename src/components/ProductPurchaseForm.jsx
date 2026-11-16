import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { formatPrice } from "../catalog";

export function ProductPurchaseForm({ product, cart, onAdd, onCart }) {
  const people = product.id === "plateau";
  const [option, setOption] = useState(product.options[0]);
  const [addedOption, setAddedOption] = useState(null);
  const added =
    addedOption === option &&
    cart.some((line) => line.id === product.id && line.option === option);
  function submit(e) {
    e.preventDefault();
    if (added) {
      onCart();
      return;
    }
    onAdd(product, option);
    setAddedOption(option);
  }
  return (
    <form className="plateau-form" onSubmit={submit}>
      <fieldset className="plateau-formats">
        <legend>
          {people ? "nombre de personnes : " : "votre format : "}
          <span>{people ? option.replace(" personnes", "") : option}</span>
        </legend>
        <div
          className={`plateau-format-choices${people ? " plateau-people-choices" : ""}`}
          style={
            people
              ? undefined
              : {
                  gridTemplateColumns: `repeat(${product.options.length}, minmax(0, 1fr))`,
                }
          }
        >
          {product.options.map((value) => (
            <label className="plateau-format" key={value}>
              <input
                type="radio"
                name={people ? "plateau-people" : "product-format"}
                aria-label={value}
                value={value}
                checked={option === value}
                onChange={() => {
                  setOption(value);
                  setAddedOption(null);
                }}
              />
              <span>
                <span className="plateau-format-copy">
                  <span>{value.split(" ")[0]}</span>
                  <span>{value.split(" ").slice(1).join(" ")}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {people ? (
        <div className="plateau-price" aria-live="polite" aria-atomic="true">
          {formatPrice(product.prices[option])}
        </div>
      ) : (
        <div className="selection-price" aria-live="polite" aria-atomic="true">
          <span>{formatPrice(product.prices[option])}</span>
          <p>Confirmé par téléphone avant préparation.</p>
        </div>
      )}
      <button
        className={`plateau-add ${added ? "is-added" : ""}`}
        type="submit"
      >
        {added ? "Voir mon panier" : "Ajouter au panier"}
        {added ? <Check size={20} /> : <Plus size={20} />}
      </button>
      <div className="plateau-status" role="status" aria-live="polite">
        {added && (
          <>
            <span>
              <Check size={15} />
              {people
                ? `Plateau pour ${option} ajouté.`
                : `${option} ajouté au panier.`}
            </span>
            <button type="button" onClick={() => setAddedOption(null)}>
              {people ? "Ajouter un autre plateau" : "Ajouter un autre format"}
              <Plus size={15} />
            </button>
          </>
        )}
      </div>
    </form>
  );
}
