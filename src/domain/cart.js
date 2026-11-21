import { normalizeCustomization, sameCartLine } from "./customization.js";
import {
  getProduct,
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
                option:
                  typeof x.option === "string"
                    ? legacyPlateauOptions[x.option] || x.option
                    : x.option,
              }
            : x?.id === "plateau"
              ? {
                  ...x,
                  option:
                    typeof x.option === "string"
                      ? legacyPlateauOptions[x.option] || x.option
                      : x.option,
                }
              : x,
        )
        .filter(
          (x) =>
            x &&
            getProduct(x.id)?.options.includes(x.option) &&
            Number.isInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= MAX_QUANTITY,
        )
        .map((x) => ({
          ...x,
          customization: normalizeCustomization(
            getProduct(x.id),
            x.customization,
          ),
        }))
        .filter((x) => x.customization !== null)
        .slice(0, MAX_CART_LINES)
        .reduce((lines, x) => {
          const existing = lines.find((line) => sameCartLine(line, x));
          if (existing)
            existing.quantity = Math.min(
              MAX_QUANTITY,
              existing.quantity + x.quantity,
            );
          else
            lines.push({
              id: x.id,
              option: x.option,
              quantity: x.quantity,
              ...(x.customization ? { customization: x.customization } : {}),
            });
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
export function addCartItem(
  cart,
  product,
  option,
  quantity = 1,
  customization,
) {
  return addCartItems(cart, [{ product, option, quantity, customization }]);
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

export function addCartItems(cart, entries) {
  if (!Array.isArray(entries) || !entries.length) return cart;
  let next = cart;
  for (const entry of entries) {
    const product = getProduct(entry?.product?.id);
    const { option, quantity = 1, customization } = entry || {};
    if (
      !product?.options.includes(option) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    )
      return cart;
    const config = normalizeCustomization(product, customization);
    if (config === null) return cart;
    const candidate = {
      id: product.id,
      option,
      quantity,
      ...(config ? { customization: config } : {}),
    };
    const existing = next.find((line) => sameCartLine(line, candidate));
    if (existing) {
      if (existing.quantity + quantity > MAX_QUANTITY) return cart;
      next = next.map((line) =>
        line === existing
          ? { ...line, quantity: line.quantity + quantity }
          : line,
      );
    } else {
      if (next.length >= MAX_CART_LINES) return cart;
      next = [...next, candidate];
    }
  }
  return next;
}
