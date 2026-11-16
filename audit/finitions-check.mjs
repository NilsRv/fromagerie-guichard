import { launchBrowser } from "../tests/helpers/browser.mjs";
import assert from "node:assert/strict";
const browser = await launchBrowser();
const base = process.env.AUDIT_URL || "http://localhost:5174";
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await page.goto(base + "/plateaux");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page
        .locator(".plateau-page")
        .evaluate((e) => getComputedStyle(e).backgroundColor),
      "rgb(243, 242, 233)",
    );
    await page
      .getByRole("radio", { name: "6/8 personnes", exact: true })
      .check();
    await page.locator(".plateau-format").nth(1).hover();
    assert.equal(
      await page
        .locator(".plateau-format > span")
        .nth(1)
        .evaluate((e) => getComputedStyle(e).color),
      "rgb(81, 58, 49)",
    );
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Voir mon panier", exact: true })
      .click();
    assert.equal(await page.locator(".quantity > span").innerText(), "1");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Ajouter un autre plateau", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Voir mon panier", exact: true })
      .click();
    assert.equal(await page.locator(".quantity > span").innerText(), "2");
    assert.match(await page.locator(".cart-total").innerText(), /120/);
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
    assert.equal(await page.locator(".plateau-gallery-zoom").count(), 0);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() =>
      Promise.all(
        [...document.images].map((im) => im.decode().catch(() => {})),
      ),
    );
    if (width !== 320)
      await page.screenshot({
        path: `audit/plateau-creme-${width}.png`,
        fullPage: true,
      });
    await page.close();
  }
  console.log(
    "PASS: fond crème, contrastes, ajout et accès au panier, ajout supplémentaire, total, suppression à 1440/390/320 px.",
  );
} finally {
  await browser.close();
}
