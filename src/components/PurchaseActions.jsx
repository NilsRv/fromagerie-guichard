import { Check, Plus } from "lucide-react";

export function PurchaseActions({
  added,
  disabled = false,
  message,
  resetLabel,
  onReset,
}) {
  return (
    <>
      <button
        className={`plateau-add${added ? " is-added" : ""}`}
        type="submit"
        disabled={disabled && !added}
      >
        {added ? "Voir mon panier" : "Ajouter au panier"}
        {added ? <Check size={20} /> : <Plus size={20} />}
      </button>
      <div className="plateau-status" role="status" aria-live="polite">
        {added && (
          <>
            <span>
              <Check size={15} />
              {message}
            </span>
            <button type="button" onClick={onReset}>
              {resetLabel}
              <Plus size={15} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
