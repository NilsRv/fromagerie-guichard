import { RaclettePurchaseForm } from "./RaclettePurchaseForm";
import { OccasionChoices, MealPreferences } from "./MealPreferences";
import {
  lineUnitPrice,
  hasUnpricedExtra,
  sameCartLine,
} from "../domain/customization";
import { useState } from "react";
import { FormatOption } from "./FormatOption";
import { PurchaseActions } from "./PurchaseActions";
import { MealHelp } from "./MealHelp";
import { addCartItem } from "../domain/cart";
import { formatPrice } from "../catalog";

export function ProductPurchaseForm(props) {
  return props.product.id === "raclette" ? (
    <RaclettePurchaseForm {...props} />
  ) : (
    <StandardProductPurchaseForm {...props} />
  );
}
function StandardProductPurchaseForm({ product, cart, onAdd, onCart }) {
  const people = product.id === "plateau";
  const seasonal = product.id === "fondue";
  const configurable = people || seasonal;
  const [customization, setCustomization] = useState({
    ...(people
      ? { occasion: "fin-de-repas" }
      : { people: product.peopleOptions?.[0] ?? 2 }),
    extras: [],
    comment: "",
  });
  function changeCustomization(value) {
    setCustomization(value);
    setAddedOption(null);
  }
  const [option, setOption] = useState(product.options[0]);
  const [addedOption, setAddedOption] = useState(null);
  const added =
    addedOption === option &&
    cart.some((line) =>
      sameCartLine(line, {
        id: product.id,
        option,
        ...(configurable ? { customization } : {}),
      }),
    );
  const price = lineUnitPrice({
    id: product.id,
    option,
    ...(configurable ? { customization } : {}),
  });
  const canAdd =
    addCartItem(
      cart,
      product,
      option,
      1,
      configurable ? customization : undefined,
    ) !== cart;
  function submit(e) {
    e.preventDefault();
    if (added) {
      onCart();
      return;
    }
    if (!canAdd) return;
    onAdd(product, option, 1, configurable ? customization : undefined);
    setAddedOption(option);
  }
  return (
    <form className="plateau-form" onSubmit={submit}>
      {people && (
        <OccasionChoices
          value={customization.occasion}
          onChange={(occasion) =>
            changeCustomization({
              ...customization,
              occasion,
              extras: occasion === "dinatoire" ? customization.extras : [],
            })
          }
        />
      )}
      <fieldset
        className="plateau-formats"
        aria-label={
          people ? "nombre de personnes" : seasonal ? "votre fondue" : undefined
        }
      >
        <legend className={configurable ? "meal-help-legend" : undefined}>
          {people
            ? "nombre de personnes"
            : seasonal
              ? "votre fondue"
              : "votre format : "}
          {people && (
            <MealHelp label="Voir les poids des plateaux">
              {product.options.map((value) => (
                <span className="occasion-help-item" key={value}>
                  <strong>{value}</strong>
                  <span>{product.weightLabels[value]}</span>
                </span>
              ))}
            </MealHelp>
          )}
          {seasonal && (
            <MealHelp label="Découvrir la composition des fondues">
              {product.options.map((value) => (
                <span className="occasion-help-item" key={value}>
                  <strong>{value.toLocaleLowerCase("fr-FR")}</strong>
                  <span>{product.compositions[value]}</span>
                </span>
              ))}
            </MealHelp>
          )}
          {!configurable && <span>{option}</span>}
        </legend>
        <div
          className={`plateau-format-choices${people ? " plateau-people-choices" : seasonal ? " meal-occasion-choices" : ""}`}
          style={
            configurable
              ? undefined
              : {
                  gridTemplateColumns: `repeat(${Math.min(3, product.options.length)}, minmax(0, 1fr))`,
                }
          }
        >
          {product.options.map((value) => (
            <FormatOption
              key={value}
              name={people ? "plateau-people" : "product-format"}
              value={value}
              checked={option === value}
              onChange={() => {
                setOption(value);
                setAddedOption(null);
              }}
              occasion={seasonal}
            />
          ))}
        </div>
      </fieldset>
      {seasonal && (
        <fieldset
          className="plateau-formats fondue-people"
          aria-label="nombre de personnes"
        >
          <legend className="meal-help-legend">
            nombre de personnes
            <MealHelp label="Voir les poids des fondues">
              {product.peopleOptions.map((count) => (
                <span className="occasion-help-item" key={count}>
                  <strong>{count} personnes</strong>
                  <span>{product.weightLabels[count]}</span>
                </span>
              ))}
            </MealHelp>
          </legend>
          <div className="plateau-format-choices plateau-people-choices">
            {product.peopleOptions.map((count) => (
              <FormatOption
                key={count}
                name="fondue-people"
                value={count}
                label={`${count} personnes`}
                checked={customization.people === count}
                onChange={() =>
                  changeCustomization({ ...customization, people: count })
                }
              />
            ))}
          </div>
        </fieldset>
      )}
      {configurable && (
        <MealPreferences
          product={product}
          value={customization}
          onChange={changeCustomization}
        />
      )}
      {configurable ? (
        <div className="plateau-price" aria-live="polite" aria-atomic="true">
          {formatPrice(price)}
        </div>
      ) : (
        <div className="selection-price" aria-live="polite" aria-atomic="true">
          <span>
            {price === undefined ? "Prix à confirmer" : formatPrice(price)}
          </span>
          <p>Confirmé par téléphone avant préparation.</p>
        </div>
      )}
      {hasUnpricedExtra({ customization }) && (
        <p className="meal-price-note">
          Supplément charcuterie en plus, à confirmer par la boutique.
        </p>
      )}
      {!canAdd && !added && (
        <p className="meal-price-note" role="status">
          Votre panier a atteint sa limite pour cette sélection.
        </p>
      )}
      <PurchaseActions
        added={added}
        disabled={!canAdd}
        onReset={() => setAddedOption(null)}
        message={
          people
            ? `Plateau pour ${option} ajouté.`
            : seasonal
              ? `Fondue ${option.toLocaleLowerCase("fr-FR")} pour ${customization.people} personnes ajoutée.`
              : `${option} ajouté au panier.`
        }
        resetLabel={
          people
            ? "Ajouter un autre plateau"
            : seasonal
              ? "Ajouter une autre fondue"
              : "Ajouter un autre format"
        }
      />
    </form>
  );
}
