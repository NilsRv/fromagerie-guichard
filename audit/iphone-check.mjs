import { launchBrowser } from "../tests/helpers/browser.mjs";
import { devices } from "playwright";
import assert from "node:assert/strict";
const base = process.env.AUDIT_URL || "http://localhost:5174";
for (const engine of ["webkit", "chromium"]) {
  const browser = await launchBrowser(engine);
  try {
    for (const width of [320, 390, 430]) {
      const page = await browser.newPage({
        ...devices["iPhone 13"],
        viewport: { width, height: 744 },
        reducedMotion: "no-preference",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base + "/plateaux");
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => {
        const r = document
            .querySelector(".plateau-slide")
            .getBoundingClientRect(),
          c = document.querySelector(".plateau-slides").getBoundingClientRect();
        return {
          ratio: r.width / r.height,
          left: r.left,
          viewport: innerWidth,
          carouselWidth: c.width,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.ok(Math.abs(dimensions.ratio - 0.8) < 0.002);
      assert.ok(Math.abs(dimensions.left - 16) < 1);
      assert.equal(dimensions.carouselWidth, width);
      assert.equal(dimensions.overflow, false);
      assert.equal(
        await page.locator(".plateau-thumbnails").isVisible(),
        false,
      );
      assert.equal(
        await page.locator(".plateau-gallery-hit").first().isVisible(),
        false,
      );
      assert.equal(
        await page.locator(".plateau-gallery-dots button").count(),
        3,
      );
      await page
        .getByRole("button", {
          name: "Détail d’un plateau de la fromagerie",
          exact: true,
        })
        .tap();
      await page.waitForFunction(() => {
        const e = document.querySelector(".plateau-slides");
        return Math.abs(e.scrollLeft - (e.scrollWidth - e.clientWidth)) < 1.5;
      });
      assert.equal(
        await page
          .locator(".plateau-gallery-dots button")
          .last()
          .getAttribute("aria-pressed"),
        "true",
      );
      const stage = await page.locator(".plateau-image-stage").boundingBox();
      await page.mouse.move(stage.x + width / 2, stage.y + 180);
      if (engine === "webkit") {
        // Mobile WebKit does not expose wheel input in Playwright.
        await page.locator(".plateau-gallery-dots button").first().tap();
      } else {
        await page.mouse.wheel(-240, 0);
      }
      await page.waitForFunction(() => {
        const e = document.querySelector(".plateau-slides"),
          pad = parseFloat(getComputedStyle(e).paddingLeft);
        return (
          e.scrollLeft < e.scrollWidth - e.clientWidth - 5 &&
          [...e.children].some(
            (c) => Math.abs(e.scrollLeft - (c.offsetLeft - pad)) < 1.5,
          )
        );
      });
      if (engine === "webkit") {
        await page.evaluate(() => window.scrollBy(0, 220));
      } else {
        await page.mouse.wheel(0, 220);
      }
      await page.waitForFunction(() => scrollY > 30);
      assert.equal(await page.locator(".plateau-gallery-zoom").count(), 0);
      await page
        .getByRole("radio", { name: "6/8 personnes", exact: true })
        .tap();
      assert.match(await page.locator(".plateau-price").innerText(), /60/);
      await page
        .getByRole("button", { name: "Ajouter au panier", exact: true })
        .tap();
      await page
        .getByRole("button", { name: "Voir mon panier", exact: true })
        .tap();
      assert.match(await page.locator(".cart-total").innerText(), /60/);
      await page
        .getByRole("button", { name: "Fermer le panier", exact: true })
        .tap();
      await page
        .locator(".plateau-composition")
        .first()
        .locator("summary")
        .tap();
      await page.waitForFunction(() => {
        const e = document.querySelector(".plateau-composition");
        return e.open && e.getAnimations().length === 0;
      });
      await page.setViewportSize({
        width: width === 430 ? 390 : 430,
        height: 744,
      });
      await page.waitForFunction(() => {
        const e = document.querySelector(".plateau-slides"),
          pad = parseFloat(getComputedStyle(e).paddingLeft);
        return [...e.children].some(
          (c) => Math.abs(e.scrollLeft - (c.offsetLeft - pad)) < 1.5,
        );
      });
      assert.deepEqual(errors, []);
      if (width === 390) {
        await page.setViewportSize({ width, height: 744 });
        await page.reload();
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() =>
          Promise.all(
            [...document.images].map((im) => im.decode().catch(() => {})),
          ),
        );
        await page.screenshot({
          path: `audit/iphone-${engine}-plateau.png`,
          fullPage: true,
        });
      }
      console.log(
        `PASS ${engine} ${width}px: portrait 4:5, aperçu voisin, repères, défilement horizontal/vertical, format, panier, accordéon et redimensionnement.`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
