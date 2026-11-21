import { Check } from "lucide-react";
import { PlateauNotes } from "./PlateauNotes";
import { accompaniments, occasions } from "../domain/customization";
import { formatPrice } from "../catalog";
import { MealHelp } from "./MealHelp";
import { FormatOption } from "./FormatOption";

export function OccasionChoices({ value, onChange }) {
  return (
    <fieldset className="plateau-formats meal-occasion">
      <legend className="meal-help-legend">
        votre plateau
        <MealHelp label="Comprendre les préparations du plateau">
          {Object.entries(occasions).map(([key, item]) => (
            <span className="occasion-help-item" key={key}>
              <strong>{item.label.toLocaleLowerCase("fr-FR")}</strong>
              <span>{item.preparation}</span>
            </span>
          ))}
        </MealHelp>
      </legend>
      <div className="meal-occasion-choices">
        {Object.entries(occasions).map(([id, item]) => (
          <FormatOption
            key={id}
            name="occasion"
            value={id}
            label={item.label.toLocaleLowerCase("fr-FR")}
            checked={value === id}
            onChange={() => onChange(id)}
            occasion
          />
        ))}
      </div>
    </fieldset>
  );
}
export function MealPreferences({ product, value, onChange }) {
  const seasonal = product.id !== "plateau";
  const extras = seasonal
    ? accompaniments.slice(0, 1)
    : value.occasion === "dinatoire"
      ? accompaniments
      : [];
  return (
    <div className="meal-preferences">
      {extras.length > 0 && (
        <fieldset className="meal-extras">
          <legend>
            pour accompagner <span>facultatif</span>
          </legend>
          <div className="meal-extras-list">
            {extras.map((extra) => (
              <label
                className="meal-extra"
                key={extra.id}
                data-selected={value.extras.includes(extra.id) || undefined}
              >
                <span className="meal-extra-control">
                  <input
                    type="checkbox"
                    checked={value.extras.includes(extra.id)}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        extras: e.target.checked
                          ? [...value.extras, extra.id]
                          : value.extras.filter((x) => x !== extra.id),
                      })
                    }
                  />
                  <Check size={13} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="meal-extra-copy">
                  <strong>{extra.label}</strong>
                  <small>{extra.detail}</small>
                </span>
                {extra.price !== undefined && (
                  <span className="meal-extra-price">
                    + {formatPrice(extra.price)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!seasonal && (
        <PlateauNotes
          value={value.comment}
          onChange={(comment) => onChange({ ...value, comment })}
        />
      )}
    </div>
  );
}
