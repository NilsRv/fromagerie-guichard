import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOrder } from "../server/validation.js";
const now = new Date("2026-10-09T12:00:00Z");
const order = () => ({
  requestId: "12345678-abcd-abcd-abcd-123456789012",
  name: "Client test",
  phone: "0612345678",
  date: "2026-10-13",
  slot: "Matin",
  note: "",
  consent: true,
  items: [{ id: "plateau", option: "4/5 personnes", quantity: 1 }],
});
test("valid pickup preserves catalog identity and drops client prices", () => {
  const o = order();
  o.items[0].price = 0;
  o.items[0].name = "fake";
  const r = validateOrder(o, now);
  assert.equal(r.ok, true);
  assert.equal(r.value.items[0].name, "Le plateau de fromages");
  assert.equal(r.value.items[0].price, undefined);
  assert.equal(r.value.items[0].unitPrice, 35);
});
test("reject empty cart, unknown products, invalid quantities and options", () => {
  for (const items of [
    [],
    [{ id: "fake", option: "4/5 personnes", quantity: 1 }],
    [{ id: "plateau", option: "4/5 personnes", quantity: -1 }],
    [{ id: "plateau", option: "100 personnes", quantity: 1 }],
  ])
    assert.equal(validateOrder({ ...order(), items }, now).ok, false);
});
test("reject dates in the past, Mondays, nonexistent dates, distant dates and closed afternoons", () => {
  for (const date of ["2026-10-08", "2026-10-12", "2026-02-31", "2027-01-01"])
    assert.equal(validateOrder({ ...order(), date }, now).ok, false);
  assert.equal(
    validateOrder({ ...order(), date: "2026-10-11", slot: "Après-midi" }, now)
      .ok,
    false,
  );
});
test("reject missing contact and consent", () => {
  for (const patch of [
    { name: "" },
    { phone: "abc" },
    { consent: false },
    { note: "x".repeat(501) },
  ])
    assert.equal(validateOrder({ ...order(), ...patch }, now).ok, false);
});

test("one plateau supports each offered party size", () => {
  for (const option of ["4/5 personnes", "6/8 personnes", "10/12 personnes"]) {
    assert.equal(
      validateOrder(
        { ...order(), items: [{ id: "plateau", option, quantity: 1 }] },
        now,
      ).ok,
      true,
    );
  }
  assert.equal(
    validateOrder(
      {
        ...order(),
        items: [{ id: "plateau-apero", option: "4/5 personnes", quantity: 1 }],
      },
      now,
    ).ok,
    false,
  );
});

test("plateau prices come from the server catalog", () => {
  for (const [option, unitPrice] of [
    ["4/5 personnes", 35],
    ["6/8 personnes", 60],
    ["10/12 personnes", 80],
  ]) {
    const result = validateOrder(
      {
        ...order(),
        items: [{ id: "plateau", option, quantity: 2, unitPrice: 1, price: 1 }],
      },
      now,
    );
    assert.equal(result.ok, true);
    assert.equal(result.value.items[0].unitPrice, unitPrice);
  }
});
test("preserves meal preferences and computes supplements from the catalog", () => {
  const o = order();
  o.items[0].customization = {
    occasion: "dinatoire",
    extras: ["coing", "charcuterie"],
    comment: "Allergie aux noix",
    price: 0,
  };
  const r = validateOrder(o, now);
  assert.equal(r.ok, true);
  assert.equal(r.value.items[0].unitPrice, 40);
  assert.equal(r.value.items[0].supplementToConfirm, true);
  assert.equal(r.value.items[0].customization.comment, "Allergie aux noix");
  assert.equal(r.value.items[0].customization.price, undefined);
});
test("rejects invalid preparations, accompaniments, comments and person counts", () => {
  for (const customization of [
    { occasion: "inconnu", extras: [], comment: "" },
    { occasion: "fin-de-repas", extras: ["charcuterie"], comment: "" },
    { occasion: "dinatoire", extras: ["inconnu"], comment: "" },
    { occasion: "dinatoire", extras: [], comment: "a".repeat(501) },
  ]) {
    const o = order();
    o.items[0].customization = customization;
    assert.equal(validateOrder(o, now).ok, false);
  }
  for (const people of [0, 21, 2.5, "2"]) {
    const o = order();
    o.items = [
      {
        id: "raclette",
        option: "Nature",
        quantity: 1,
        customization: { people, extras: [], comment: "" },
      },
    ];
    assert.equal(validateOrder(o, now).ok, false);
  }
});
test("accepts seasonal meals with confirmed prices and a charcuterie supplement", () => {
  for (const [id, option] of [
    ["raclette", "Nature"],
    ["fondue", "Suisse"],
  ]) {
    const o = order();
    o.items = [
      {
        id,
        option,
        quantity: 1,
        customization: {
          people: 6,
          extras: ["charcuterie"],
          comment: "Sans porc si possible",
        },
        unitPrice: 1,
      },
    ];
    const r = validateOrder(o, now);
    assert.equal(r.ok, true);
    assert.equal(
      id === "raclette"
        ? r.value.items[0].customization.portions
        : r.value.items[0].customization.people,
      6,
    );
    assert.equal(r.value.items[0].unitPrice, id === "raclette" ? 41.4 : 54);
    assert.equal(r.value.items[0].supplementToConfirm, true);
  }
});
test("raclette portions use each confirmed price and reject client totals", () => {
  for (const [option, price] of [
    ["Nature", 6.9],
    ["Fumée", 7.9],
    ["Ail des ours", 8.9],
    ["Morbier", 6.9],
    ["5 baies", 8],
  ]) {
    const o = order();
    o.items = [
      {
        id: "raclette",
        option,
        quantity: 1,
        unitPrice: 0,
        customization: { portions: 3, extras: [], comment: "" },
      },
    ];
    const r = validateOrder(o, now);
    assert.equal(r.ok, true);
    assert.equal(r.value.items[0].unitPrice, Math.round(price * 3 * 100) / 100);
    assert.equal(r.value.items[0].customization.portions, 3);
  }
});

test("fondue prices match every type and party size, ignoring client prices", () => {
  for (const [option, expected] of [
    ["Savoyarde", { 4: 35, 6: 49, 10: 82 }],
    ["Suisse", { 4: 38, 6: 54, 10: 90 }],
  ]) {
    for (const [people, price] of Object.entries(expected)) {
      const o = order();
      o.items = [
        {
          id: "fondue",
          option,
          quantity: 1,
          unitPrice: 1,
          customization: { people: Number(people), extras: [], comment: "" },
        },
      ];
      const result = validateOrder(o, now);
      assert.equal(result.ok, true);
      assert.equal(result.value.items[0].unitPrice, price);
    }
  }
  for (const people of [2, 5, 8, 12]) {
    const o = order();
    o.items = [
      {
        id: "fondue",
        option: "Suisse",
        quantity: 1,
        customization: { people, extras: [], comment: "" },
      },
    ];
    assert.equal(validateOrder(o, now).ok, false);
  }
});
test("malformed preference objects and dates are rejected without throwing", () => {
  for (const occasion of [{ toString: null }, [], 1, null, "constructor"]) {
    const o = order();
    o.items[0].customization = { occasion, extras: [], comment: "" };
    assert.equal(validateOrder(o, now).ok, false);
  }
  assert.equal(
    validateOrder({ ...order(), date: { toString: null } }, now).ok,
    false,
  );
});
test("comments and portions use the same limits as the purchase forms", async () => {
  const { MAX_COMMENT_LENGTH, MAX_PORTIONS } =
    await import("../src/domain/constants.js");
  const o = order();
  o.items = [
    {
      id: "raclette",
      option: "Fumée",
      quantity: 1,
      customization: {
        portions: MAX_PORTIONS,
        extras: [],
        comment: "a".repeat(MAX_COMMENT_LENGTH),
      },
    },
  ];
  assert.equal(validateOrder(o, now).ok, true);
  o.items[0].customization.portions++;
  assert.equal(validateOrder(o, now).ok, false);
  o.items[0].customization.portions = 1;
  o.items[0].customization.comment += "a";
  assert.equal(validateOrder(o, now).ok, false);
});
