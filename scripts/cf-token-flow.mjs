import { chromium } from "playwright";

const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
console.log("Connected");

const ctx = browser.contexts()[0];
const page = await ctx.newPage();
console.log("New page");

try {
  await page.goto("https://dash.cloudflare.com/profile/api-tokens", {
    waitUntil: "commit",
    timeout: 15000,
  });
  console.log("Navigated to:", page.url());
} catch (e) {
  console.log("Nav error:", e.message);
}

await page.waitForTimeout(3000);
console.log("After 3s URL:", page.url());
console.log("Title:", await page.title().catch(() => "?"));

await page.screenshot({ path: "C:\\Temp\\cf-dashboard.png" });
console.log("Screenshot OK");

await browser.close();
