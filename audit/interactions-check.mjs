import { launchBrowser } from "../tests/helpers/browser.mjs";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
const dir = await mkdtemp(path.join(tmpdir(), "guichard-interactions-"));
const server = spawn(process.execPath, ["server/index.js"], {
  env: { ...process.env, PORT: "0", DATA_DIR: dir },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  const base = await new Promise((resolve, reject) => {
    server.stdout.on("data", (d) => {
      const m = d.toString().match(/http:\/\/localhost:\d+/);
      if (m) resolve(m[0]);
    });
    server.on("error", reject);
    server.on("exit", () => reject(Error("server stopped")));
  });
  browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  assert.equal((await page.request.get(base + "/introuvable")).status(), 404);
  assert.equal((await page.request.get(base + "/contact/")).status(), 200);
  assert.equal(
    (await page.request.get(base + "/gestion")).headers()["x-robots-tag"],
    "noindex, nofollow",
  );
  await page.goto(base + "/plateaux");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => scrollTo(0, 1000));
  await page.waitForTimeout(250);
  const position = await page.evaluate(() => scrollY);
  const target = await page
    .locator(".nav")
    .getByRole("link", { name: "Contact", exact: true })
    .boundingBox();
  await page.mouse.click(
    target.x + target.width / 2,
    target.y + target.height / 2,
  );
  await page.waitForTimeout(150);
  await page.goBack();
  await page.waitForTimeout(400);
  const restored = await page.evaluate(() => scrollY);
  assert.ok(
    Math.abs(restored - position) < 5,
    `History: ${position} → ${restored}`,
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + "/plateaux");
    await page
      .getByRole("radio", { name: "4/5 personnes", exact: true })
      .check();
    assert.equal(
      await page
        .locator(".plateau-page")
        .evaluate((el) => el.scrollWidth > el.clientWidth),
      false,
    );
    await page.getByRole("button", { name: "Ajouter au panier" }).click();
    await page.locator(".cart-button").click();
    await page.getByRole("button", { name: "Préparer mon retrait" }).click();
    const monday = new Date(Date.now() + 7 * 86400000);
    while (monday.getUTCDay() !== 1) monday.setUTCDate(monday.getUTCDate() + 1);
    await page.locator("#pickup-date").fill(monday.toISOString().slice(0, 10));
    assert.equal(
      await page.locator("#pickup-date").getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Demander mon retrait" })
        .isDisabled(),
      true,
    );
    await page.keyboard.press("Escape");
  }
  console.log(
    "PASS: HTTP 404, trailing slash, admin noindex, historique avec animations, fiches 320/390 px, validation immédiate du lundi.",
  );
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    server.kill();
    await new Promise((r) => server.once("exit", r));
  }
  await rm(dir, { recursive: true, force: true });
}
