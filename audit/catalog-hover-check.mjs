import { launchBrowser } from "../tests/helpers/browser.mjs";
import { devices } from "playwright";
import assert from "node:assert/strict";
const base = process.env.AUDIT_URL || "http://localhost:5174";
for (const engine of ["chromium", "webkit"]) {
  const browser = await launchBrowser(engine);
  try {
    for (const width of [320, 390, 768, 1440, 1920]) {
      const page = await browser.newPage({
        ...(width < 751 ? devices["iPhone 13"] : {}),
        viewport: { width, height: 1000 },
        reducedMotion: "no-preference",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/fromages");
      await page.evaluate(() => document.fonts.ready);
      const cards = page.locator(".selection-product");
      const photo = cards.first().locator(".catalog-product-photo");
      const dimensions = await photo.boundingBox();
      assert.ok(Math.abs(dimensions.width / dimensions.height - 0.8) < 0.002);
      const columns = await page
        .locator(".selection-grid")
        .evaluate(
          (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
        );
      assert.equal(columns, width < 1024 ? 2 : 4);
      assert.equal(await page.locator(".selection-product-link").count(), 0);
      assert.equal(
        await page.getByText("Choisir mon format", { exact: true }).count(),
        0,
      );
      if (width >= 1024) {
        assert.equal(
          await cards
            .first()
            .locator(".catalog-quick-action")
            .evaluate((e) => getComputedStyle(e).visibility),
          "hidden",
        );
        await photo.hover();
        await page.waitForTimeout(260);
        assert.equal(
          await cards
            .first()
            .locator(".catalog-quick-action")
            .evaluate((e) => getComputedStyle(e).opacity),
          "1",
        );
        assert.equal(
          await cards
            .first()
            .locator(".catalog-product-photo > img")
            .evaluate((e) => getComputedStyle(e).transform),
          "none",
        );
        await page.screenshot({
          path: `audit/catalog-hover-${engine}-${width}.png`,
        });
      }
      if (width >= 751) await cards.first().hover();
      await page
        .getByRole("button", { name: "Achat rapide : Comté", exact: true })
        .click();
      assert.equal(
        await page.getByRole("dialog", { name: "Comté", exact: true }).count(),
        1,
      );
      await page
        .getByRole("button", { name: "Fermer l’achat rapide", exact: true })
        .click();
      await page.locator(".quick-shop").waitFor({ state: "detached" });
      await page.goto(base + "/fromages");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((im) => {
            im.loading = "eager";
            return im.decode().catch(() => {});
          }),
        );
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: `audit/catalog-compact-${engine}-${width}.png`,
        fullPage: true,
      });
      console.log(
        `PASS ${engine} ${width}px: dimensions, survol sans zoom, ouverture du quick shop et overflow.`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
