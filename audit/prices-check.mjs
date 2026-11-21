import { launchBrowser } from "../tests/helpers/browser.mjs";
import assert from "node:assert/strict";
import { products, formatPrice } from "../src/catalog.js";
import { validateOrder } from "../server/validation.js";
const browser = await launchBrowser();
try {
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    for (const route of ["autres-produits"]) {
      await page.goto("http://localhost:5174/" + route);
      assert.equal(await page.locator(".catalog-product-price").count(), 3);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      for (const h of await page.locator(".selection-product-heading").all()) {
        assert.equal(
          await h.evaluate((e) => e.scrollWidth > e.clientWidth),
          false,
        );
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((im) => {
            im.loading = "eager";
            return im.decode().catch(() => {});
          }),
        );
      });
      await page.screenshot({
        path: `audit/prices-${route}-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto("http://localhost:5174/produit/comte");
    await page.getByRole("radio", { name: "500 g", exact: true }).check();
    assert.equal(
      await page.locator(".selection-price > span").innerText(),
      formatPrice(16),
    );
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Voir mon panier", exact: true })
      .click();
    assert.match(await page.locator(".cart-total").innerText(), /16/);
    await page.close();
  }
  for (const p of products) {
    for (const option of p.options) {
      const now = new Date("2026-10-09T12:00:00Z");
      const r = validateOrder(
        {
          requestId: "12345678-abcd-abcd-abcd-123456789012",
          name: "Client test",
          phone: "0612345678",
          date: "2026-10-13",
          slot: "Matin",
          note: "",
          consent: true,
          items: [
            {
              id: p.id,
              option,
              quantity: 2,
              unitPrice: 0,
              ...(["raclette", "fondue"].includes(p.id)
                ? {
                    customization: {
                      ...(p.id === "raclette"
                        ? { portions: 1 }
                        : { people: 4 }),
                      extras: [],
                      comment: "",
                    },
                  }
                : {}),
            },
          ],
        },
        now,
      );
      assert.equal(r.ok, true);
      assert.equal(
        r.value.items[0].unitPrice,
        p.peopleOptions ? p.pricesByPeople[option][4] : p.prices[option],
      );
    }
  }
  console.log(
    "PASS: prix alignés sur 320/390/1440 px, prix du format et total panier cohérents, tous les tarifs imposés par le catalogue serveur.",
  );
} finally {
  await browser.close();
}
