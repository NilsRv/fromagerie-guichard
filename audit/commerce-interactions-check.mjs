import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { devices } from "playwright";
import { launchBrowser } from "../tests/helpers/browser.mjs";
import { startTestServer } from "../tests/helpers/server.mjs";
import { MAX_QUANTITY, MAX_CART_LINES } from "../src/domain/constants.js";

const server = await startTestServer();
const { base, dir } = server;
const token = (await readFile(path.join(dir, "admin-token"), "utf8")).trim();
const widths = process.env.AUDIT_WIDTHS?.split(",").map(Number) || [
  320, 390, 768, 1440,
];
const engines = process.env.AUDIT_ENGINES?.split(",") || ["chromium", "webkit"];
try {
  for (const engine of engines) {
    const browser = await launchBrowser(engine);
    try {
      for (const width of widths) {
        const page = await browser.newPage({
          ...(width < 751 ? devices["iPhone 13"] : {}),
          viewport: { width, height: 900 },
          reducedMotion: "reduce",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const goto = (route) => page.goto(base + route);
        const button = (name) =>
          page.getByRole("button", { name, exact: true });
        async function closeCart(clear = false) {
          if (clear) await button("Vider le panier").click();
          await page.keyboard.press("Escape");
          await page.locator(".cart-dialog").waitFor({ state: "detached" });
        }
        async function storedCart() {
          return page.evaluate(() =>
            JSON.parse(localStorage.getItem("guichard-cart") || "[]"),
          );
        }
        async function help(name, expected) {
          const trigger = button(name);
          if (width < 751) await trigger.tap();
          else await trigger.hover();
          const tooltip = page.getByRole("tooltip");
          await tooltip.waitFor();
          for (const text of expected)
            assert.ok((await tooltip.innerText()).includes(text));
          const bounds = await tooltip.boundingBox();
          assert.ok(bounds.x >= 15 && bounds.x + bounds.width <= width - 15);
          await page.keyboard.press("Escape");
          assert.equal(await tooltip.count(), 0);
        }
        await goto("/autres-produits");
        if (width >= 751)
          await page.locator(".selection-product").first().hover();
        assert.equal(
          await page
            .locator(".catalog-product-photo > img")
            .first()
            .evaluate((el) => getComputedStyle(el).transform),
          "none",
        );
        await button("Ajouter Pâte de coing au panier").click();
        await page.locator(".cart-dialog").waitFor();
        assert.equal(await page.locator(".quantity > span").innerText(), "1");
        await closeCart();
        if (width >= 751)
          await page.locator(".selection-product").first().hover();
        await button("Ajouter Pâte de coing au panier").click();
        assert.equal(await page.locator(".quantity > span").innerText(), "2");
        await closeCart(true);

        await goto("/plateaux");
        const notes = page.locator(".meal-comment textarea");
        const section = page.locator(".meal-comment");
        assert.equal(await section.getAttribute("data-expanded"), null);
        await notes.focus();
        await button("Préciser : envie de…").click();
        await page.keyboard.insertText("chèvre");
        await button("Préciser : sans…").click();
        await page.keyboard.insertText("bleu");
        await button("Préciser : sans…").click();
        assert.equal(await notes.inputValue(), "Envie de chèvre\nSans bleu");
        assert.equal(
          await notes.evaluate((el) => el.selectionStart),
          (await notes.inputValue()).length,
        );
        await notes.fill("");
        await page
          .getByRole("radio", { name: "6/8 personnes", exact: true })
          .click();
        assert.equal(await section.getAttribute("data-expanded"), null);
        await page
          .getByRole("radio", { name: "4/5 personnes", exact: true })
          .check();
        await page
          .getByRole("radio", { name: "dînatoire", exact: true })
          .check();
        await page.getByRole("checkbox", { name: /Pâte de coing/ }).check();
        await page.getByRole("checkbox", { name: /Charcuterie/ }).check();
        await notes.fill("Allergie aux noix. Sans bleu.");
        await button("Ajouter au panier").click();
        await button("Voir mon panier").click();
        const plateauLine = (await storedCart())[0];
        assert.match(await page.locator(".cart-total").innerText(), /40/);
        assert.match(
          await page.locator(".cart-customization").innerText(),
          /Allergie aux noix/,
        );
        await closeCart(true);

        // A full line and a full cart must never announce an addition that failed.
        const defaultLine = {
          id: "plateau",
          option: "4/5 personnes",
          quantity: MAX_QUANTITY,
          customization: { occasion: "fin-de-repas", extras: [], comment: "" },
        };
        await page.evaluate(
          (line) =>
            localStorage.setItem("guichard-cart", JSON.stringify([line])),
          defaultLine,
        );
        await page.reload();
        assert.equal(await button("Ajouter au panier").isDisabled(), true);
        assert.equal(await page.locator(".plateau-status").innerText(), "");
        const full = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
          ...defaultLine,
          quantity: 1,
          customization: {
            ...defaultLine.customization,
            comment: `Sélection ${index}`,
          },
        }));
        await page.evaluate(
          (lines) =>
            localStorage.setItem("guichard-cart", JSON.stringify(lines)),
          full,
        );
        await page.reload();
        assert.equal(await button("Ajouter au panier").isDisabled(), true);
        await page.locator(".cart-button").click();
        await page.locator(".remove-item").first().click();
        await closeCart();
        assert.equal(await button("Ajouter au panier").isEnabled(), true);
        await page.evaluate(() => localStorage.removeItem("guichard-cart"));

        await goto("/raclettes");
        assert.equal(await page.locator("textarea").count(), 0);
        assert.equal(await button("Ajouter au panier").isDisabled(), true);
        await page
          .getByRole("spinbutton", { name: "Portions de Nature", exact: true })
          .fill("2");
        await button("Ajouter une portion de Fumée").click();
        await page.getByRole("checkbox", { name: /Charcuterie/ }).check();
        assert.equal(
          await page.locator(".raclette-variety[data-selected]").count(),
          2,
        );
        assert.match(await page.locator(".plateau-price").innerText(), /21,70/);
        await button("Ajouter au panier").click();
        await page.locator(".cart-dialog").waitFor();
        const racletteLines = await storedCart();
        assert.equal(racletteLines.length, 2);
        await closeCart();
        await button("Voir mon panier").click();
        assert.deepEqual(
          await page.locator(".quantity > span").allTextContents(),
          ["1", "1"],
        );
        await closeCart();
        await button("Composer une autre sélection").click();
        assert.equal(
          await page
            .getByRole("spinbutton")
            .evaluateAll((inputs) => inputs.every((el) => el.value === "0")),
          true,
        );
        await page.locator(".cart-button").click();
        await closeCart(true);

        await goto("/fondues");
        for (const [type, prices] of [
          ["Savoyarde", [35, 49, 82]],
          ["Suisse", [38, 54, 90]],
        ]) {
          await page.getByRole("radio", { name: type, exact: true }).check();
          for (const [index, count] of [4, 6, 10].entries()) {
            await page
              .getByRole("radio", { name: `${count} personnes`, exact: true })
              .check();
            assert.equal(
              (await page.locator(".plateau-price").innerText()).replace(
                /\s/g,
                "",
              ),
              `${prices[index]}€`,
            );
          }
        }
        await help("Découvrir la composition des fondues", [
          "Abondance, Beaufort, Comté fruité",
          "Gruyère Suisse, Vacherin Fribourgeois",
        ]);
        await help("Voir les poids des fondues", ["900 g", "1,3 kg", "2,2 kg"]);
        await page
          .getByRole("radio", { name: "6 personnes", exact: true })
          .check();
        await button("Ajouter au panier").click();
        await button("Voir mon panier").click();
        const fondueLine = (await storedCart())[0];
        assert.equal(fondueLine.customization.people, 6);
        assert.match(await page.locator(".cart-total").innerText(), /54/);
        await closeCart();
        await page.reload();
        await page.locator(".cart-button").click();
        assert.match(await page.locator(".cart-total").innerText(), /54/);
        await closeCart();

        // The server must preserve each preparation and compute its own price.
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + 4);
        while (date.getUTCDay() === 1) date.setUTCDate(date.getUTCDate() + 1);
        const response = await page.request.post(base + "/api/orders", {
          data: {
            requestId: randomUUID(),
            name: "Test commerce",
            phone: "0612345678",
            date: date.toISOString().slice(0, 10),
            slot: "Matin",
            consent: true,
            note: "",
            items: [plateauLine, ...racletteLines, fondueLine],
          },
        });
        assert.equal(response.status(), 201);
        const { reference } = await response.json();
        const saved = await page.request.get(base + "/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(saved.status(), 200);
        const orders = await saved.json();
        const order = orders.find((item) => item.reference === reference);
        assert.deepEqual(
          order.items.map((item) => item.unitPrice),
          [40, 13.8, 7.9, 54],
        );
        assert.equal(
          order.items[0].customization.comment,
          "Allergie aux noix. Sans bleu.",
        );
        assert.equal(order.items[1].supplementToConfirm, true);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.deepEqual(errors, []);
        console.log(
          `PASS ${engine} ${width}px: notes, aides, unités, limites, assortiment, prix, persistance et demande.`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
