import { launchBrowser } from "./helpers/browser.mjs";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const dir = await mkdtemp(path.join(tmpdir(), "guichard-qa-"));
const server = spawn(process.execPath, ["server/index.js"], {
  env: { ...process.env, PORT: "0", DATA_DIR: dir },
  stdio: "pipe",
});
let base;
let browser;
try {
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (d) => {
      if (d.toString().includes("http://localhost")) {
        base = d.toString().match(/http:\/\/localhost:\d+/)[0];
        resolve();
      }
    });
    server.stderr.on("data", (d) => process.stderr.write(d));
    server.on("error", reject);
    server.on("exit", (code) => {
      if (code) reject(new Error("Test server failed"));
    });
  });
  browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mkdir(".playwright", { recursive: true });
  await page.goto(base);
  await page.locator("h1").waitFor();
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 650
  ) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: ".playwright/home-desktop.png",
    fullPage: true,
  });
  assert.match(await page.locator("h1").innerText(), /du fromage pour/);
  assert.equal(
    await page.locator(".hero-occasion").innerText(),
    "une raclette",
  );
  const headerBasket = await page.locator(".cart-button").boundingBox();
  assert.equal(await page.locator(".cart-button").count(), 1);
  assert.equal(await page.locator(".floating-cart.on-footer").count(), 0);
  await page.locator(".footer-bottom").scrollIntoViewIfNeeded();
  assert.ok(
    await page
      .locator(".footer")
      .evaluate((el) => el.getBoundingClientRect().top <= 0),
    "Footer must cover the top of the viewport at the end of the page",
  );
  assert.deepEqual(
    await page.locator(".header").evaluate((el) => {
      const style = getComputedStyle(el);
      return [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth,
      ];
    }),
    ["0px", "0px", "1px", "0px"],
  );
  await page.locator(".floating-cart.on-footer").waitFor();
  const footerBasket = await page.locator(".cart-button").boundingBox();
  assert.ok(Math.abs(headerBasket.x - footerBasket.x) < 2);
  assert.ok(Math.abs(headerBasket.y - footerBasket.y) < 2);
  assert.equal(
    await page
      .locator(".cart-button")
      .evaluate((el) => getComputedStyle(el).color),
    "rgb(243, 242, 233)",
  );
  await page.locator(".cart-button").click();
  await page.locator(".cart-dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.locator(".cart-dialog").waitFor({ state: "detached" });
  for (const route of [
    "/plateaux",
    "/fromages",
    "/autres-produits",
    "/a-propos",
    "/contact",
    "/informations",
  ]) {
    await page.goto(base + route);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator('[aria-label="Fil d’Ariane"]').count(), 0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow on ${route}`,
    );
  }
  await page.goto(base + "/fromages");
  await page.getByRole("button", { name: "chèvre", exact: true }).click();
  assert.equal(await page.locator(".product-card").count(), 1);
  await page.getByRole("button", { name: "tous", exact: true }).click();
  assert.equal(await page.locator(".product-card").count(), 3);
  await page.goto(base + "/plateaux");
  await page.getByRole("radio", { name: "6/8 personnes", exact: true }).check();
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Ouvrir le panier, 1 article", exact: true })
    .click();
  assert.match(await page.locator(".cart-line").innerText(), /6\/8 personnes/);
  await page
    .getByRole("button", { name: "Augmenter Le plateau de fromages" })
    .click();
  assert.equal(await page.locator(".quantity>span").innerText(), "2");
  assert.match(await page.locator(".cart-total").innerText(), /120/);
  await page
    .getByRole("button", { name: "Préparer mon retrait", exact: true })
    .click();
  await page.locator("#customer-name").fill("TEST — client navigateur");
  await page.locator("#customer-phone").fill("0612345678");
  const date = new Date();
  date.setDate(date.getDate() + 4);
  while (date.getDay() === 1) date.setDate(date.getDate() + 1);
  const dateString = date.toISOString().slice(0, 10);
  await page.locator("#pickup-date").fill(dateString);
  await page.locator(".consent input").check();
  let submitted;
  page.on("request", (req) => {
    if (req.url().endsWith("/api/orders") && req.method() === "POST")
      submitted = req.postDataJSON();
  });
  await page.getByRole("button", { name: "Demander mon retrait" }).click();
  await page.locator(".receipt").waitFor();
  assert.match(await page.locator(".receipt").innerText(), /enregistrée/);
  const ref = await page.locator(".receipt>.eyebrow").innerText();
  const repeat = await page.request.post(base + "/api/orders", {
    data: submitted,
  });
  assert.equal((await repeat.json()).reference, ref);
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Télécharger mon récapitulatif" })
    .click();
  assert.match((await downloadPromise).suggestedFilename(), /guichard-G-/);
  await page.getByRole("button", { name: "Continuer la visite" }).click();
  assert.equal(await page.locator(".cart-count").innerText(), "(0)");
  assert.equal(
    (await page.request.get(base + "/api/admin/orders")).status(),
    401,
  );
  await page.goto(base + "/gestion");
  await page
    .locator("#admin-key")
    .fill((await readFile(path.join(dir, "admin-token"), "utf8")).trim());
  await page.getByRole("button", { name: "Ouvrir les demandes" }).click();
  await page.locator(".admin-order").waitFor();
  assert.equal(await page.locator(".admin-order").count(), 1);
  await page.locator(".admin-order select").selectOption("Confirmée");
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Actualiser", exact: true }).click();
  assert.equal(
    await page.locator(".admin-order select").inputValue(),
    "Confirmée",
  );
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of [
      "/",
      "/plateaux",
      "/fromages",
      "/autres-produits",
      "/a-propos",
      "/contact",
    ]) {
      await page.goto(base + route);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow ${width} ${route}`,
      );
    }
    if (width === 390) {
      await page.goto(base);
      await page
        .getByRole("button", { name: "Ouvrir le menu", exact: true })
        .click();
      await page
        .locator(".nav")
        .getByRole("link", { name: /^plateaux$/i })
        .click();
      await page.locator(".nav.open").waitFor({ state: "detached" });
      assert.equal(await page.locator(".nav.open").count(), 0);
      await page
        .getByRole("radio", { name: "4/5 personnes", exact: true })
        .check();
      await page.screenshot({ path: ".playwright/product-mobile.png" });
      assert.equal(new URL(page.url()).pathname, "/plateaux");
      await page.goto(base);
      for (
        let y = 0;
        y < (await page.evaluate(() => document.body.scrollHeight));
        y += 600
      ) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await page.waitForTimeout(90);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: ".playwright/home-mobile.png",
        fullPage: true,
      });
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: 7 routes, desktop/mobile/tablet, filters, cart persistence, quantities, checkout, download, server persistence, idempotency, admin auth and status, mobile menu, Escape, zero overflow or browser errors.",
  );
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((r) => server.once("exit", r));
  }
  await rm(dir, { recursive: true, force: true });
}
