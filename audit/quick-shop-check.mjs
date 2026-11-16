import { launchBrowser } from "../tests/helpers/browser.mjs";
import { devices } from "playwright";
import assert from "node:assert/strict";
const base = process.env.AUDIT_URL || "http://localhost:5174";
for (const engine of process.env.AUDIT_ENGINES?.split(",") || [
  "chromium",
  "webkit",
]) {
  const browser = await launchBrowser(engine);
  try {
    for (const width of process.env.AUDIT_WIDTHS?.split(",").map(Number) || [
      320, 390, 768, 1440,
    ]) {
      const page = await browser.newPage({
        ...(width < 751 ? devices["iPhone 13"] : {}),
        viewport: { width, height: 900 },
        reducedMotion: "no-preference",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/fromages");
      async function open(name, index) {
        if (width >= 751)
          await page.locator(".selection-product").nth(index).hover();
        await page
          .getByRole("button", { name: `Achat rapide : ${name}`, exact: true })
          .click();
        await page.getByRole("dialog", { name, exact: true }).waitFor();
        await page.waitForTimeout(410);
      }
      async function chooseQuantity(n) {
        await page
          .getByRole("combobox", { name: "Quantité", exact: true })
          .click();
        await page
          .getByRole("option", { name: String(n), exact: true })
          .click();
      }
      await open("Comté", 0);
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("guichard-cart") || "[]").length,
        ),
        0,
      );
      assert.equal(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
      assert.equal(await page.getByRole("dialog").count(), 1);
      assert.equal(
        await page
          .locator(".quick-shop-product-link")
          .evaluate((e) => getComputedStyle(e).borderBottomStyle),
        "dotted",
      );
      assert.equal(
        await page
          .locator(".quick-shop")
          .evaluate((e) => e.scrollWidth > e.clientWidth),
        false,
      );
      await page.keyboard.press("Shift+Tab");
      assert.equal(
        await page
          .locator(".quick-shop-product-link")
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .getByRole("button", { name: "Fermer l’achat rapide" })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.getByRole("radio", { name: "500 g", exact: true }).check();
      await page
        .getByRole("combobox", { name: "Quantité", exact: true })
        .focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      assert.equal(
        await page
          .getByRole("combobox", { name: "Quantité", exact: true })
          .innerText(),
        "2",
      );
      await page
        .getByRole("combobox", { name: "Quantité", exact: true })
        .click();
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 1);
      assert.equal(await page.getByRole("listbox").count(), 0);
      await chooseQuantity(3);
      assert.match(await page.locator(".quick-shop-price").innerText(), /48/);
      if ([390, 1440].includes(width)) {
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(
            [...document.querySelectorAll(".quick-shop img")].map((im) =>
              im.decode(),
            ),
          );
        });
        await page.screenshot({
          path: `audit/quick-shop-${engine}-${width}.png`,
        });
      }
      await page
        .getByRole("button", { name: "Ajouter au panier", exact: true })
        .click();
      await page.locator(".quick-shop").waitFor({ state: "detached" });
      assert.equal(
        await page
          .getByRole("dialog", { name: "Votre panier", exact: true })
          .count(),
        1,
      );
      assert.match(await page.locator(".cart-total").innerText(), /48/);
      assert.equal(
        await page.locator(".quantity > span").first().innerText(),
        "3",
      );
      await page
        .getByRole("button", { name: "Fermer le panier", exact: true })
        .click();
      if (width >= 751) await page.locator(".selection-product").nth(1).hover();
      await page
        .getByRole("button", {
          name: "Ajouter Les chèvres du comptoir au panier",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".quick-shop").count(), 0);
      assert.match(await page.locator(".cart-total").innerText(), /54/);
      assert.equal(
        await page.locator(".quantity > span").nth(1).innerText(),
        "1",
      );
      await page
        .getByRole("button", { name: "Fermer le panier", exact: true })
        .click();
      await open("Comté", 0);
      await page.getByRole("radio", { name: "500 g", exact: true }).check();
      await page
        .getByRole("combobox", { name: "Quantité", exact: true })
        .click();
      assert.equal(await page.getByRole("option").count(), 17);
      await page.getByRole("option", { name: "17", exact: true }).click();
      await page
        .getByRole("button", { name: "Ajouter au panier", exact: true })
        .click();
      await page.locator(".quick-shop").waitFor({ state: "detached" });
      assert.equal(
        await page.locator(".quantity > span").first().innerText(),
        "20",
      );
      await page
        .getByRole("button", { name: "Fermer le panier", exact: true })
        .click();
      await open("Comté", 0);
      await page.getByRole("radio", { name: "500 g", exact: true }).check();
      assert.equal(
        await page
          .getByRole("button", { name: "Limite atteinte", exact: true })
          .isDisabled(),
        true,
      );
      await page.keyboard.press("Escape");
      await page.locator(".quick-shop").waitFor({ state: "detached" });
      assert.equal(
        await page.evaluate(() =>
          document.activeElement.getAttribute("aria-label"),
        ),
        "Achat rapide : Comté",
      );
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
      await open("Tommette corse", 2);
      await page.mouse.click(5, 5);
      await page.locator(".quick-shop").waitFor({ state: "detached" });
      await open("Tommette corse", 2);
      await page
        .getByRole("link", { name: "Voir la fiche produit", exact: true })
        .click();
      await page.waitForURL(base + "/produit/tomme");
      assert.equal(await page.locator(".quick-shop").count(), 0);
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
      await page.goto(base + "/autres-produits");
      if (width >= 751)
        await page.locator(".selection-product").first().hover();
      await page
        .getByRole("button", {
          name: "Ajouter Pâte de coing au panier",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".quick-shop").count(), 0);
      const lines = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("guichard-cart")),
      );
      assert.deepEqual(
        lines.find((l) => l.id === "coing"),
        { id: "coing", option: "1 portion", quantity: 1 },
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${engine} ${width}px : ajout direct unité, modal coupes, lien pointillé, focus, quantité, prix, fusion panier, limite 20, Échap, extérieur et fiche complète.`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
