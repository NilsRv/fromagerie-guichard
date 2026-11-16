import { launchBrowser } from "../tests/helpers/browser.mjs";
import assert from "node:assert/strict";
import { products } from "../src/catalog.js";
const browser = await launchBrowser();
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    for (const p of products.filter((p) => p.category !== "plateaux")) {
      await page.goto(`http://localhost:5174/produit/${p.id}`);
      await page
        .getByRole("radio", { name: p.options.at(-1), exact: true })
        .check();
      assert.equal(await page.locator(".plateau-gallery-zoom").count(), 0);
      await page
        .getByRole("button", { name: "Ajouter au panier", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Voir mon panier", exact: true })
        .click();
      assert.match(
        await page.locator(".cart-lines").innerText(),
        new RegExp(p.options.at(-1)),
      );
      await page
        .getByRole("button", { name: "Fermer le panier", exact: true })
        .click();
      await page.locator(".plateau-composition summary").first().click();
      assert.equal(
        await page.locator(".plateau-composition").first().getAttribute("open"),
        "",
      );
    }
    for (const route of [
      "fromages",
      "autres-produits",
      "a-propos",
      "contact",
      "produit/comte",
    ]) {
      await page.goto("http://localhost:5174/" + route);
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
        path: `audit/aligned-${route.replaceAll("/", "-")}-${width}.png`,
        fullPage: true,
      });
    }
    await page.close();
    console.log(
      `PASS ${width}px: six fiches, formats, ajout, panier, accordéons et captures.`,
    );
  }
} finally {
  await browser.close();
}
