import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/catalog.js";
import {
  normalizeCart,
  addCartItem,
  changeCartQuantity,
} from "../src/domain/cart.js";
import { MAX_QUANTITY } from "../src/domain/constants.js";

const plateau = products.find((p) => p.id === "plateau");
test("migrates and merges legacy plateau formats without retaining client fields", () => {
  const raw = [
    { id: "plateau-apero", option: "4 personnes", quantity: 2, price: 0 },
    { id: "plateau", option: "4/5 personnes", quantity: 3 },
  ];
  assert.deepEqual(normalizeCart(raw), [
    { id: "plateau", option: "4/5 personnes", quantity: 5 },
  ]);
  assert.equal(raw[0].id, "plateau-apero");
});
test("ignores corrupted storage and caps merged quantities", () => {
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(
    normalizeCart([
      null,
      {},
      { id: "inconnu", option: "250 g", quantity: 1 },
      { id: "comte", option: "250 g", quantity: 1.5 },
    ]),
    [],
  );
  assert.deepEqual(
    normalizeCart([
      { id: "plateau", option: "6/8 personnes", quantity: 12 },
      { id: "plateau-table", option: "8 personnes", quantity: 12 },
    ]),
    [{ id: "plateau", option: "6/8 personnes", quantity: MAX_QUANTITY }],
  );
});
test("adds several items atomically and keeps distinct formats separate", () => {
  const initial = [{ id: "plateau", option: "4/5 personnes", quantity: 2 }];
  const next = addCartItem(initial, plateau, "4/5 personnes", 3);
  assert.equal(next[0].quantity, 5);
  assert.equal(initial[0].quantity, 2);
  assert.equal(addCartItem(next, plateau, "6/8 personnes", 2).length, 2);
  assert.strictEqual(addCartItem(next, plateau, "invalide", 1), next);
});
test("enforces the same quantity cap for quick shop and cart updates", () => {
  const cart = addCartItem([], plateau, "4/5 personnes", MAX_QUANTITY);
  assert.equal(
    addCartItem(cart, plateau, "4/5 personnes", 2)[0].quantity,
    MAX_QUANTITY,
  );
  assert.equal(changeCartQuantity(cart, 0, 1)[0].quantity, MAX_QUANTITY);
  assert.deepEqual(
    changeCartQuantity([{ ...cart[0], quantity: 1 }], 0, -1),
    [],
  );
});
