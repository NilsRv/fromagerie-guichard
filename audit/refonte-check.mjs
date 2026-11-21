import { launchBrowser } from "../tests/helpers/browser.mjs";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await launchBrowser();
const base = process.env.AUDIT_URL || "http://localhost:5174";
const results = [];
const errors = [];
try {
  for (const width of [1440, 1920, 1024, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "/",
      "/plateaux",
      "/raclettes",
      "/fondues",
      "/autres-produits",
      "/a-propos",
      "/contact",
      "/informations",
      "/page-inconnue",
    ]) {
      await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      for (
        let y = 0;
        y < (await page.evaluate(() => document.body.scrollHeight));
        y += 700
      ) {
        await page.evaluate((y) => scrollTo(0, y), y);
        await page.waitForTimeout(50);
      }
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map((im) => im.decode().catch(() => {})),
        ),
      );
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: [...document.images]
          .filter((im) => !im.naturalWidth)
          .map((im) => im.getAttribute("src")),
        headings: document.querySelectorAll("h1").length,
      }));
      results.push({ width, route, ...result });
      assert.equal(result.overflow, false, `Overflow: ${width} ${route}`);
      assert.deepEqual(result.broken, [], `Broken images: ${route}`);
      assert.equal(result.headings, 1);
      if ([1440, 390].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `audit/refonte-${route === "/" ? "home" : route.slice(1)}-${width}.png`,
          fullPage: true,
        });
      }
    }
    if (width === 390) {
      await page.goto(base);
      await page
        .getByRole("button", { name: "Ouvrir le menu", exact: true })
        .click();
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement.textContent),
        "Plateaux",
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.evaluate(() =>
          document.activeElement.getAttribute("aria-controls"),
        ),
        "main-navigation",
      );
      await page
        .getByRole("button", { name: "Ouvrir le menu", exact: true })
        .click();
      await page
        .locator("#main-navigation")
        .getByRole("link", { name: "Fromages", exact: true })
        .click();
      assert.equal(
        await page.evaluate(() => document.activeElement.tagName),
        "H1",
      );
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "audit/refonte-mesures.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    `PASS: ${results.length} vues, images chargées, un h1 par page, aucun débordement ni erreur JS, menu clavier et focus de navigation.`,
  );
} finally {
  await browser.close();
}
