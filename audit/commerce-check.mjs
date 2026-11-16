import { launchBrowser } from "../tests/helpers/browser.mjs";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { products, plateauProductPaths } from "../src/catalog.js";
const base = process.env.AUDIT_URL || "http://localhost:5174";
const browser = await launchBrowser();
const results = [];
const errors = [];
try {
  for (const width of [320, 390, 768, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/plateaux",
      "/fromages",
      "/autres-produits",
      "/a-propos",
      "/contact",
      ...products
        .filter((p) => p.category !== "plateaux")
        .map((p) => `/produit/${p.id}`),
    ]) {
      console.log(`Checking ${width} ${route}`);
      assert.equal((await page.goto(base + route)).status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      for (
        let y = 0;
        y < (await page.evaluate(() => document.body.scrollHeight));
        y += 800
      ) {
        await page.evaluate((y) => scrollTo(0, y), y);
        await page.waitForTimeout(35);
      }
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map((im) => {
            im.loading = "eager";
            return im.decode().catch(() => {});
          }),
        ),
      );
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: [...document.images]
          .filter((im) => !im.naturalWidth)
          .map((im) => im.src),
        h1: document.querySelectorAll("h1").length,
      }));
      assert.equal(result.overflow, false, `${width} ${route}`);
      assert.equal(
        await page.locator('[aria-label="Fil d’Ariane"]').count(),
        0,
      );
      assert.deepEqual(result.broken, []);
      assert.equal(result.h1, 1);
      results.push({ width, route, ...result });
      if (
        [390, 1440].includes(width) &&
        [
          "/plateaux",
          "/fromages",
          "/autres-produits",
          "/produit/comte",
        ].includes(route)
      ) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `audit/commerce-${route.slice(1).replaceAll("/", "-")}-${width}.png`,
          fullPage: true,
        });
      }
    }
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  for (const route of plateauProductPaths) {
    const response = await page.request.get(base + route, { maxRedirects: 0 });
    assert.equal(response.status(), 301);
    assert.equal(response.headers().location, "/plateaux");
  }
  await page.goto(base + "/plateaux");
  assert.equal(
    await page
      .getByRole("radio", { name: "4/5 personnes", exact: true })
      .isChecked(),
    true,
  );
  await page.getByRole("radio", { name: "4/5 personnes", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("radio", { name: "6/8 personnes", exact: true })
      .isChecked(),
    true,
  );
  assert.match(await page.locator(".plateau-price").innerText(), /60/);
  await page.reload();
  for (const option of products.find((p) => p.id === "plateau").options) {
    await page.getByRole("radio", { name: option, exact: true }).check();
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .click();
    assert.match(
      await page.locator(".plateau-status").innerText(),
      new RegExp(option),
    );
  }
  await page
    .getByRole("button", { name: "Voir mon panier", exact: true })
    .click();
  assert.equal(await page.locator(".cart-line").count(), 3);
  await page
    .getByRole("button", { name: "Vider le panier", exact: true })
    .click();
  await page.keyboard.press("Escape");
  assert.equal(
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .count(),
    1,
  );
  await page
    .getByRole("button", {
      name: "Autre composition de la fromagerie",
      exact: true,
    })
    .click();
  assert.equal(
    await page.locator(".plateau-slide.is-active > img").getAttribute("alt"),
    "Autre composition de la fromagerie",
  );
  await page
    .getByRole("button", { name: "Photo suivante", exact: true })
    .click();
  assert.equal(
    await page.locator(".plateau-slide.is-active > img").getAttribute("alt"),
    "Détail d’un plateau de la fromagerie",
  );
  assert.equal(await page.locator(".plateau-gallery-zoom").count(), 0);
  await page.locator(".plateau-composition").first().locator("summary").click();
  assert.equal(await page.locator(".plateau-composition[open]").count(), 1);
  await page.evaluate(() =>
    localStorage.setItem(
      "guichard-cart",
      JSON.stringify([
        { id: "plateau-apero", option: "4 personnes", quantity: 1 },
        { id: "plateau-decouverte", option: "4 personnes", quantity: 2 },
        { id: "plateau-table", option: "12 personnes", quantity: 1 },
        null,
      ]),
    ),
  );
  await page.reload();
  await page.locator(".cart-button").click();
  assert.equal(await page.locator(".cart-line").count(), 2);
  assert.equal(
    await page.locator(".cart-line .quantity > span").first().innerText(),
    "3",
  );
  assert.deepEqual(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("guichard-cart")).map((x) => x.id),
    ),
    ["plateau", "plateau"],
  );
  await page.keyboard.press("Escape");
  await page.goto(base + "/produit/plateau-apero");
  await page.waitForURL(base + "/plateaux");
  assert.equal(await page.locator("#plateau-title").count(), 1);
  await page.goto(base + "/fromages");
  const second = page.locator(".selection-product-heading a").nth(1);
  await second.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await second.click();
  await page.waitForURL(base + "/produit/chevre");
  await page.locator(".product-back").click();
  await page.waitForURL(base + "/fromages");
  assert.ok(Math.abs((await page.evaluate(() => scrollY)) - position) < 5);
  assert.equal(
    (await page.request.get(base + "/produit/inconnu")).status(),
    404,
  );
  assert.deepEqual(errors, []);
  await writeFile(
    "audit/commerce-mesures.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    `PASS: ${results.length} vues, plateau unique, choix visibles, 3 formats, galerie, panier, migration et fusion des anciennes sélections, redirections, autres fiches et retour catalogue.`,
  );
} finally {
  await browser.close();
}
