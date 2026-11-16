import {
  products,
  legacyPlateauIds,
  legacyPlateauOptions,
} from "../catalog.js";
import { CART_STORAGE_KEY, MAX_QUANTITY, MAX_CART_LINES } from "./constants.js";
export function normalizeCart(raw) {
  return Array.isArray(raw)
    ? raw
        .map((x) =>
          x && typeof x === "object" && legacyPlateauIds.includes(x.id)
            ? {
                ...x,
                id: "plateau",
                option: legacyPlateauOptions[x.option] || x.option,
              }
            : x?.id === "plateau"
              ? { ...x, option: legacyPlateauOptions[x.option] || x.option }
              : x,
        )
        .filter(
          (x) =>
            x &&
            products.some(
              (p) => p.id === x.id && p.options.includes(x.option),
            ) &&
            Number.isInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= MAX_QUANTITY,
        )
        .slice(0, MAX_CART_LINES)
        .reduce((lines, x) => {
          const existing = lines.find(
            (line) => line.id === x.id && line.option === x.option,
          );
          if (existing)
            existing.quantity = Math.min(
              MAX_QUANTITY,
              existing.quantity + x.quantity,
            );
          else lines.push({ id: x.id, option: x.option, quantity: x.quantity });
          return lines;
        }, [])
    : [];
}
export function readCart() {
  try {
    return normalizeCart(
      JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]"),
    );
  } catch {
    return [];
  }
}
export function addCartItem(cart, product, option, quantity = 1) {
  if (!product.options.includes(option)) return cart;
  const amount = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity) || 1));
  const existing = cart.find(
    (line) => line.id === product.id && line.option === option,
  );
  return existing
    ? cart.map((line) =>
        line === existing
          ? {
              ...line,
              quantity: Math.min(MAX_QUANTITY, line.quantity + amount),
            }
          : line,
      )
    : [...cart, { id: product.id, option, quantity: amount }];
}
export function changeCartQuantity(cart, index, delta) {
  return cart.flatMap((line, i) =>
    i === index
      ? line.quantity + delta <= 0
        ? []
        : [{ ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + delta) }]
      : [line],
  );
}
