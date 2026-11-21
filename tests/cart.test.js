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
test("retains independent preparations and comments through storage normalization", () => {
  const config = {
    occasion: "dinatoire",
    extras: ["fruits", "charcuterie"],
    comment: " Sans bleu ",
  };
  const first = addCartItem([], plateau, "4/5 personnes", 1, config);
  const second = addCartItem(first, plateau, "4/5 personnes", 1, {
    ...config,
    extras: ["charcuterie", "fruits"],
  });
  assert.equal(second.length, 1);
  assert.equal(second[0].quantity, 2);
  const different = addCartItem(second, plateau, "4/5 personnes", 1, {
    occasion: "fin-de-repas",
    extras: [],
    comment: "",
  });
  assert.equal(different.length, 2);
  assert.equal(
    normalizeCart(JSON.parse(JSON.stringify(different)))[0].customization
      .comment,
    "Sans bleu",
  );
  assert.equal(
    addCartItem(different, plateau, "4/5 personnes", 1, {
      ...config,
      occasion: "fin-de-repas",
    }),
    different,
  );
});
test("adds a raclette assortment atomically without dropping any variety", async () => {
  const { addCartItems } = await import("../src/domain/cart.js");
  const raclette = products.find((p) => p.id === "raclette");
  const entries = ["Nature", "Fumée"].map((option) => ({
    product: raclette,
    option,
    customization: { portions: 2, extras: [], comment: "" },
  }));
  const result = addCartItems([], entries);
  assert.equal(result.length, 2);
  assert.deepEqual(normalizeCart(result), result);
  const full = Array.from({ length: 30 }, (_, i) => ({
    id: "plateau",
    option: "4/5 personnes",
    quantity: 1,
    customization: { occasion: "dinatoire", extras: [], comment: String(i) },
  }));
  assert.strictEqual(addCartItems(full, entries), full);
  assert.strictEqual(
    addCartItems([], [...entries, { product: raclette, option: "inconnu" }])
      .length,
    0,
  );
});
test("rejects excess quantities without a partial addition or false success", async () => {
  const { addCartItems } = await import("../src/domain/cart.js");
  const initial = addCartItem([], plateau, "4/5 personnes", 19);
  assert.strictEqual(
    addCartItem(initial, plateau, "4/5 personnes", 2),
    initial,
  );
  assert.strictEqual(
    addCartItem(initial, plateau, "4/5 personnes", 0),
    initial,
  );
  assert.strictEqual(
    addCartItem(initial, plateau, "4/5 personnes", 1.5),
    initial,
  );
  assert.strictEqual(
    addCartItems(initial, [
      { product: plateau, option: "6/8 personnes" },
      { product: plateau, option: "4/5 personnes", quantity: 2 },
    ]),
    initial,
  );
});
test("a malformed stored item cannot discard the other valid cart lines", () => {
  const valid = { id: "plateau", option: "4/5 personnes", quantity: 1 };
  const malformed = { id: "plateau", option: { toString: null }, quantity: 1 };
  assert.deepEqual(normalizeCart([malformed, valid]), [valid]);
  assert.deepEqual(
    normalizeCart([
      {
        ...valid,
        customization: {
          occasion: { toString: null },
          extras: [],
          comment: "",
        },
      },
      valid,
    ]),
    [valid],
  );
});
test("money totals remain exact for decimal prices and different preparations", async () => {
  const { selectionTotal } = await import("../src/domain/customization.js");
  const cart = Array.from({ length: 10 }, (_, index) => ({
    id: "raclette",
    option: "Nature",
    quantity: 1,
    customization: { portions: 1, extras: [], comment: String(index) },
  }));
  assert.equal(selectionTotal(cart), 69);
  assert.equal(selectionTotal([{ ...cart[0], quantity: 3 }]), 20.7);
});
