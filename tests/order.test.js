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
