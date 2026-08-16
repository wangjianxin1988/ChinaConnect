import { chromium } from "playwright";
const urls = process.argv.slice(2);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const out = {};
for (const u of urls) {
  try {
    await page.goto(u, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(2000);
    const data = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let cjk = 0, kana = 0; const samples = []; const seen = new Set();
      let node;
      while ((node = walker.nextNode())) {
        const t = node.textContent || "";
        for (const ch of t) {
          const cp = ch.codePointAt(0);
          if (cp >= 0x3400 && cp <= 0x9fff) { cjk++; if (seen.size < 25) { const seg = t.replace(/\s+/g, " ").trim().slice(0, 90); if (seg && !seen.has(seg)) { seen.add(seg); samples.push(seg); } } }
          if (cp >= 0x3040 && cp <= 0x30ff) kana++;
        }
      }
      return { cjk, kana, samples };
    });
    out[u] = data;
  } catch (e) {
    out[u] = { err: e.message.slice(0, 120) };
  }
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
