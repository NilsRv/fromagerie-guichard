import { launchBrowser } from "../tests/helpers/browser.mjs";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = await mkdtemp(path.join(tmpdir(), "guichard-audit-"));
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
    server.on("exit", () => reject(Error("server exit")));
    server.on("error", reject);
  });
  browser = await launchBrowser();
  const results = [];
  for (const width of [1440, 390, 320, 768]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      hasTouch: width < 1000,
      isMobile: width < 600,
    });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `audit/home-${width}.png` });
    results.push({
      width,
      home: await page.evaluate(() => ({
        height: document.body.scrollHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        resources: performance
          .getEntriesByType("resource")
          .map((x) => ({
            url: x.name.split("/").pop(),
            bytes: x.transferSize,
          })),
        smallText: [...document.querySelectorAll("p,a,button,span")]
          .filter(
            (e) =>
              e.children.length === 0 &&
              e.getBoundingClientRect().height &&
              parseFloat(getComputedStyle(e).fontSize) < 12,
          )
          .map((e) => ({
            text: e.textContent,
            size: getComputedStyle(e).fontSize,
          }))
          .slice(0, 15),
      })),
    });
    if (width === 390) {
      await page
        .getByRole("button", { name: "Ouvrir le menu", exact: true })
        .click();
      const seq = [];
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        seq.push(
          await page.evaluate(() => ({
            text: document.activeElement.textContent,
            tag: document.activeElement.tagName,
          })),
        );
      }
      results.push({ mobileTab: seq });
    }
    for (const route of ["/plateaux", "/contact", "/a-propos"]) {
      await page.goto(base + route);
      await page.waitForTimeout(200);
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `audit/${route.slice(1)}-${width}.png`,
          fullPage: true,
        });
    }
    if (width === 1440) {
      await page.goto(base + "/plateaux");
      await page.locator(".nav a").filter({ hasText: "Fromages" }).click();
      results.push({
        navigationFocus: await page.evaluate(() => ({
          tag: document.activeElement.tagName,
          text: document.activeElement.textContent,
          h1: document.querySelector("h1").textContent,
        })),
      });
      results.push({
        missingStatus: (
          await page.request.get(base + "/inconnue-audit")
        ).status(),
        robotsStatus: (await page.request.get(base + "/robots.txt")).status(),
      });
    }
    await page.close();
  }
  await writeFile("audit/mesures.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  server.kill();
  await new Promise((r) => server.once("exit", r));
  await rm(dir, { recursive: true, force: true });
}
