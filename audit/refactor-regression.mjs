import { launchBrowser } from "../tests/helpers/browser.mjs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.AUDIT_URL || "http://localhost:5174";
const phase = process.env.AUDIT_PHASE || "after";
const directory =
  process.env.AUDIT_SNAPSHOTS || "/private/tmp/guichard-clean-snapshots";
await mkdir(`${directory}/${phase}`, { recursive: true });
const browser = await launchBrowser();
const results = {};
const errors = [];
try {
  for (const width of [320, 390, 768, 1100, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    async function settle() {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((im) => {
            im.loading = "eager";
            return im.decode().catch(() => {});
          }),
        );
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      });
    }
    async function capture(key) {
      await settle();
      results[`${width}:${key}`] = await page.evaluate(() => {
        const properties = [
          "display",
          "position",
          "color",
          "backgroundColor",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "fontStyle",
          "fontVariantNumeric",
          "lineHeight",
          "letterSpacing",
          "padding",
          "margin",
          "borderWidth",
          "borderStyle",
          "borderColor",
          "borderRadius",
          "gap",
          "gridTemplateColumns",
          "flexDirection",
          "alignItems",
          "justifyContent",
          "opacity",
          "transform",
          "overflow",
          "textDecoration",
          "boxShadow",
        ];
        return [...document.querySelectorAll("body *")]
          .filter((e) => e.checkVisibility())
          .map((e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              class: e.getAttribute("class")?.trim() || null,
              rect: [r.x, r.y, r.width, r.height].map(
                (n) => Math.round(n * 100) / 100,
              ),
              style: Object.fromEntries(properties.map((k) => [k, s[k]])),
            };
          });
      });
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `${directory}/${phase}/${width}-${key.replaceAll("/", "_")}.png`,
          fullPage: true,
          animations: "disabled",
        });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${width} ${key}`,
      );
    }
    for (const route of [
      "/",
      "/plateaux",
      "/fromages",
      "/autres-produits",
      "/a-propos",
      "/contact",
      "/informations",
      "/gestion",
      "/produit/comte",
      "/produit/chevre",
      "/produit/tomme",
      "/produit/coing",
      "/produit/fruits",
      "/produit/cremerie",
    ]) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      await settle();
      await page.mouse.move(0, 0);
      await capture(route || "home");
    }
    await page.goto(base + "/plateaux");
    await page
      .getByRole("radio", { name: "6/8 personnes", exact: true })
      .check();
    await capture("plateau-selected");
    await page.goto(base + "/fromages");
    await page.getByRole("button", { name: "chèvre", exact: true }).click();
    await capture("filtered");
    await page.getByRole("button", { name: "tous", exact: true }).click();
    await page.locator(".selection-product").first().hover();
    await capture("hover");
    await page
      .getByRole("button", { name: "Achat rapide : Comté", exact: true })
      .click();
    await page.getByRole("radio", { name: "500 g", exact: true }).check();
    await page.getByRole("combobox", { name: "Quantité", exact: true }).click();
    await page.getByRole("option", { name: "3", exact: true }).click();
    await capture("quick-shop");
    await page.getByRole("combobox", { name: "Quantité", exact: true }).click();
    await capture("quantity-menu");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Ajouter au panier", exact: true })
      .click();
    await capture("cart");
    await page.getByRole("button", { name: /retrait/i, exact: true }).click();
    await capture("checkout");
    await page.close();
    console.log(`Captured ${phase} ${width}px`);
  }
  assert.deepEqual(errors, []);
  await writeFile(`${directory}/${phase}.json`, JSON.stringify(results));
  if (phase === "after") {
    const before = JSON.parse(
      await readFile(`${directory}/before.json`, "utf8"),
    );
    for (const dataset of [before, results]) {
      for (const elements of Object.values(dataset)) {
        for (const element of elements)
          element.class = element.class?.trim() || null;
      }
    }
    const differences = [];
    for (const key of Object.keys(before))
      if (JSON.stringify(before[key]) !== JSON.stringify(results[key]))
        differences.push(key);
    await writeFile(
      `${directory}/differences.json`,
      JSON.stringify(differences, null, 2),
    );
    console.log("Computed-style differences:", differences);
    assert.deepEqual(
      differences,
      [],
      "Le refactoring a modifié le rendu mesuré",
    );
  }
} finally {
  await browser.close();
}
