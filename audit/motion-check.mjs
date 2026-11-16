import { launchBrowser } from "../tests/helpers/browser.mjs";
import assert from "node:assert/strict";
const base = process.env.AUDIT_URL || "http://localhost:5174";
const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/plateaux");
  await page.evaluate(() => document.fonts.ready);
  const stage = page.locator(".plateau-image-stage"),
    slides = page.locator(".plateau-slides");
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width * 0.25, box.y + 160);
  await page.waitForTimeout(150);
  assert.equal(
    await page
      .locator(".plateau-gallery-cursor")
      .evaluate((e) => getComputedStyle(e).getPropertyValue("--pointer-turn")),
    "180deg",
  );
  assert.equal(
    await page
      .locator(".plateau-gallery-cursor")
      .evaluate((e) => Number(getComputedStyle(e).opacity)),
    1,
  );
  await page.mouse.move(box.x + box.width * 0.75, box.y + 160);
  assert.equal(
    await page
      .locator(".plateau-gallery-cursor")
      .evaluate((e) => getComputedStyle(e).getPropertyValue("--pointer-turn")),
    "0deg",
  );
  await page
    .getByRole("button", {
      name: "Détail d’un plateau de la fromagerie",
      exact: true,
    })
    .click();
  await page.waitForFunction(() => {
    const e = document.querySelector(".plateau-slides");
    return e.scrollLeft > 1 && e.scrollLeft < e.scrollWidth - e.clientWidth - 2;
  });
  await page.waitForFunction(() => {
    const e = document.querySelector(".plateau-slides");
    return Math.abs(e.scrollLeft - (e.scrollWidth - e.clientWidth)) < 1;
  });
  await page
    .getByRole("button", { name: "Vue du plateau de fromages", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Autre composition de la fromagerie",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Vue du plateau de fromages", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".plateau-slides").scrollLeft < 1,
  );
  // Drag more than half a photograph, then verify its snap point.
  await page.mouse.move(box.x + box.width * 0.8, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + 200, { steps: 10 });
  await page.mouse.up();
  await page.waitForFunction(() => {
    const e = document.querySelector(".plateau-slides");
    return (
      Math.abs(
        e.scrollLeft -
          (e.children[1].offsetLeft -
            parseFloat(getComputedStyle(e).paddingLeft)),
      ) < 1
    );
  });
  assert.equal(
    await page
      .getByRole("button", {
        name: "Autre composition de la fromagerie",
        exact: true,
      })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page
    .getByRole("button", { name: "Photo suivante", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => {
    const e = document.querySelector(".plateau-slides");
    return Math.abs(e.scrollLeft - (e.scrollWidth - e.clientWidth)) < 1;
  });
  assert.equal(await page.locator(".plateau-gallery-zoom").count(), 0);
  const details = page.locator(".plateau-composition").first();
  const summary = details.locator("summary");
  await summary.click();
  assert.equal(await summary.getAttribute("aria-expanded"), "true");
  assert.equal(
    await details.evaluate(
      (e) => e.getAnimations()[0]?.effect.getTiming().duration,
    ),
    500,
  );
  await page.waitForFunction(
    () =>
      document.querySelector(".plateau-composition").getAnimations().length ===
      0,
  );
  await summary.click();
  await page.waitForTimeout(100);
  await summary.click();
  await page.waitForFunction(() => {
    const e = document.querySelector(".plateau-composition");
    return e.open && e.getAnimations().length === 0;
  });
  await page.screenshot({ path: "audit/motion-desktop.png" });
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  await mobile.goto(base + "/plateaux");
  const mobileBox = await mobile.locator(".plateau-image-stage").boundingBox();
  const cdp = await mobile.context().newCDPSession(mobile);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: mobileBox.x + 280, y: mobileBox.y + 100 }],
  });
  for (const x of [240, 200, 160, 110, 60])
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: mobileBox.x + x, y: mobileBox.y + 100 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.waitForFunction(() => {
    const e = document.querySelector(".plateau-slides");
    const pad = parseFloat(getComputedStyle(e).paddingLeft);
    return (
      e.scrollLeft > 10 &&
      [...e.children].some(
        (c) => Math.abs(e.scrollLeft - (c.offsetLeft - pad)) < 1.5,
      )
    );
  });
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await reduced.goto(base + "/plateaux");
  await reduced
    .getByRole("button", {
      name: "Détail d’un plateau de la fromagerie",
      exact: true,
    })
    .click();
  assert.equal(
    await reduced
      .locator(".plateau-slides")
      .evaluate(
        (e) => Math.abs(e.scrollLeft - (e.scrollWidth - e.clientWidth)) < 1,
      ),
    true,
  );
  await reduced
    .locator(".plateau-composition")
    .first()
    .locator("summary")
    .click();
  assert.equal(
    await reduced
      .locator(".plateau-composition")
      .first()
      .evaluate((e) => e.getAnimations().length),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: glissement horizontal réel, navigation interrompue, curseur gauche/droite, drag, clavier, indicateur, accordéon 500 ms réversible, swipe tactile et mouvement réduit.",
  );
} finally {
  await browser.close();
}
