import { MAX_COMMENT_LENGTH, MAX_PORTIONS } from "./constants.js";
import { getProduct } from "../catalog.js";

function pricedAccompaniment(id) {
  const product = getProduct(id);
  return {
    id,
    label: product.name,
    detail: product.options[0],
    price: product.prices[product.options[0]],
  };
}
export const accompaniments = [
  {
    id: "charcuterie",
    label: "Charcuterie",
    detail: "Assortiment et supplément confirmés par la boutique",
  },
  pricedAccompaniment("coing"),
  pricedAccompaniment("fruits"),
];
export const occasions = {
  "fin-de-repas": {
    label: "Fin de repas",
    preparation: "Quelques coupes, le reste à découper à table.",
  },
  dinatoire: {
    label: "Dînatoire",
    preparation: "Tous les fromages sont prédécoupés, prêts à partager.",
  },
};
export function normalizeCustomization(product, raw) {
  if (!product) return null;
  const seasonal = ["raclette", "fondue"].includes(product.id);
  if (raw === undefined) return seasonal ? null : undefined;
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    !["plateau", "raclette", "fondue"].includes(product.id)
  )
    return null;
  if (
    typeof raw.comment !== "string" ||
    raw.comment.length > MAX_COMMENT_LENGTH ||
    !Array.isArray(raw.extras)
  )
    return null;
  if (
    product.id === "plateau" &&
    (typeof raw.occasion !== "string" ||
      !Object.hasOwn(occasions, raw.occasion))
  )
    return null;
  const count =
    product.id === "raclette" ? (raw.portions ?? raw.people) : raw.people;
  if (
    seasonal &&
    (!Number.isInteger(count) || count < 1 || count > MAX_PORTIONS)
  )
    return null;
  if (product.peopleOptions && !product.peopleOptions.includes(count))
    return null;
  const allowed = seasonal
    ? ["charcuterie"]
    : raw.occasion === "dinatoire"
      ? accompaniments.map((x) => x.id)
      : [];
  if (raw.extras.some((id) => !allowed.includes(id))) return null;
  return {
    ...(product.id === "raclette"
      ? { portions: count }
      : seasonal
        ? { people: count }
        : { occasion: raw.occasion }),
    extras: accompaniments
      .filter((x) => raw.extras.includes(x.id))
      .map((x) => x.id),
    comment: raw.comment.trim(),
  };
}
const raclettePortionGrams = getProduct("raclette").portionGrams;

export function customizationSummary(config) {
  if (!config) return "";
  return [
    config.occasion &&
      `${occasions[config.occasion]?.label} · ${occasions[config.occasion]?.preparation}`,
    config.portions &&
      `${config.portions} portion${config.portions > 1 ? "s" : ""} de ${raclettePortionGrams} g (${config.portions * raclettePortionGrams} g)`,
    config.people && `${config.people} personne${config.people > 1 ? "s" : ""}`,
    ...(config.extras || []).map(
      (id) => accompaniments.find((x) => x.id === id)?.label,
    ),
    config.comment,
  ]
    .filter(Boolean)
    .join(" · ");
}
export function lineUnitPrice(line) {
  const product = getProduct(line.id);
  const base = product?.pricesByPeople
    ? product.pricesByPeople[line.option]?.[line.customization?.people]
    : product?.prices?.[line.option];
  if (!Number.isFinite(base)) return undefined;
  return (
    Math.round(
      (base *
        (product.portionGrams
          ? (line.customization?.portions ?? line.customization?.people ?? 1)
          : 1) +
        (line.customization?.extras || []).reduce(
          (sum, id) =>
            sum + (accompaniments.find((x) => x.id === id)?.price || 0),
          0,
        )) *
        100,
    ) / 100
  );
}
export function selectionTotal(lines) {
  const cents = lines.reduce(
    (sum, line) =>
      sum + Math.round((lineUnitPrice(line) ?? 0) * 100) * (line.quantity ?? 1),
    0,
  );
  return cents / 100;
}
export function hasUnpricedExtra(line) {
  return (line.customization?.extras || []).includes("charcuterie");
}
export function sameCartLine(a, b) {
  const key = (c) =>
    c
      ? JSON.stringify([
          c.occasion,
          c.people,
          c.portions,
          [...c.extras].sort(),
          c.comment.trim(),
        ])
      : "";
  return (
    a.id === b.id &&
    a.option === b.option &&
    key(a.customization) === key(b.customization)
  );
}
