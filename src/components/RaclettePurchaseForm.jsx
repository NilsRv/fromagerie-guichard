import { MAX_PORTIONS } from "../domain/constants";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formatPrice } from "../catalog";
import { addCartItems } from "../domain/cart";
import { selectionTotal, sameCartLine } from "../domain/customization";
import { MealPreferences } from "./MealPreferences";
import { MealHelp } from "./MealHelp";
import { PurchaseActions } from "./PurchaseActions";

export function RaclettePurchaseForm({ product, cart, onAddMany, onCart }) {
  const [portions, setPortions] = useState(() =>
    Object.fromEntries(product.options.map((option) => [option, 0])),
  );
  const [preferences, setPreferences] = useState({ extras: [], comment: "" });
  const [addedSelection, setAddedSelection] = useState(null);
  const selected = product.options.filter((option) => portions[option] > 0);
  const entries = selected.map((option, index) => ({
    product,
    option,
    quantity: 1,
    customization: {
      portions: portions[option],
      extras: index === 0 ? preferences.extras : [],
      comment: "",
    },
  }));
  const totalPortions = selected.reduce(
    (sum, option) => sum + portions[option],
    0,
  );
  const total = selectionTotal(
    entries.map((entry) => ({
      id: product.id,
      option: entry.option,
      customization: entry.customization,
    })),
  );
  const canAdd = entries.length > 0 && addCartItems(cart, entries) !== cart;
  const signature = JSON.stringify([portions, preferences.extras]);
  const added =
    addedSelection === signature &&
    entries.length > 0 &&
    entries.every((entry) =>
      cart.some((line) =>
        sameCartLine(line, {
          id: product.id,
          option: entry.option,
          customization: entry.customization,
        }),
      ),
    );
  function resetSelection() {
    setPortions(
      Object.fromEntries(product.options.map((option) => [option, 0])),
    );
    setPreferences({ extras: [], comment: "" });
    setAddedSelection(null);
  }
  function setCount(option, count) {
    setPortions((current) => ({
      ...current,
      [option]: Math.max(0, Math.min(MAX_PORTIONS, count)),
    }));
  }
  function submit(event) {
    event.preventDefault();
    if (added) {
      onCart();
      return;
    }
    if (!canAdd) return;
    onAddMany(entries);
    setAddedSelection(signature);
    onCart();
  }
  return (
    <form className="plateau-form raclette-composer" onSubmit={submit}>
      <fieldset
        className="plateau-formats raclette-varieties"
        aria-label="Variétés et portions de raclette"
      >
        <legend className="meal-help-legend">
          votre sélection
          <MealHelp label="Comprendre les portions de raclette">
            <span className="occasion-help-item">
              <span>Une portion est d’environ {product.portionGrams} g.</span>
            </span>
          </MealHelp>
        </legend>
        <div className="raclette-varieties-list">
          {product.options.map((option) => (
            <div
              className="raclette-variety"
              key={option}
              data-selected={portions[option] > 0 || undefined}
            >
              <div className="raclette-variety-copy">
                <h2>{option.toLocaleLowerCase("fr-FR")}</h2>
                <p>
                  {formatPrice(product.prices[option])} <span>/ portion</span>
                </p>
              </div>
              <div className="raclette-counter">
                <button
                  type="button"
                  aria-label={`Retirer une portion de ${option}`}
                  disabled={portions[option] === 0}
                  onClick={() => setCount(option, portions[option] - 1)}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_PORTIONS}
                  step={1}
                  aria-label={`Portions de ${option}`}
                  value={portions[option]}
                  onChange={(e) =>
                    setCount(option, Math.floor(Number(e.target.value)) || 0)
                  }
                />
                <button
                  type="button"
                  aria-label={`Ajouter une portion de ${option}`}
                  disabled={portions[option] === MAX_PORTIONS}
                  onClick={() => setCount(option, portions[option] + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <MealPreferences
        product={product}
        value={preferences}
        onChange={setPreferences}
      />
      <div className="raclette-purchase-summary">
        <div className="raclette-summary" aria-live="polite" aria-atomic="true">
          <div className="plateau-price">{formatPrice(total)}</div>
          <p className="raclette-summary-copy">
            {totalPortions
              ? `${totalPortions} portion${totalPortions > 1 ? "s" : ""} · ${totalPortions * product.portionGrams} g`
              : "0 portion · 0 g"}
          </p>
        </div>
        {preferences.extras.includes("charcuterie") && (
          <p className="meal-price-note">
            Supplément charcuterie en plus, à confirmer par la boutique.
          </p>
        )}
        {entries.length > 0 && !canAdd && !added && (
          <p className="meal-price-note" role="status">
            Le panier est plein. Ajustez votre sélection avant d’ajouter ces
            portions.
          </p>
        )}
        <PurchaseActions
          added={added}
          disabled={!canAdd}
          message="Sélection ajoutée au panier."
          resetLabel="Composer une autre sélection"
          onReset={resetSelection}
        />
      </div>
    </form>
  );
}
