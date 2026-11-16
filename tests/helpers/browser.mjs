import { chromium, webkit } from "playwright";
import { existsSync } from "node:fs";

export function launchBrowser(engine = "chromium") {
  if (engine === "webkit") return webkit.launch({ headless: true });
  const chrome =
    process.env.CHROME_PATH ||
    (existsSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : undefined);
  return chromium.launch({
    headless: true,
    ...(chrome ? { executablePath: chrome } : {}),
  });
}
