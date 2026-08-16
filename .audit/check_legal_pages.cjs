const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const path of ["/privacy/", "/terms/", "/contact/", "/ja/privacy/", "/ja/terms/", "/ja/contact/", "/ar/privacy/", "/de/terms/"]) {
    const page = await browser.newPage();
    try {
      const resp = await page.goto("http://127.0.0.1:4322" + path, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1000);
      const title = await page.title();
      const body = await page.evaluate(() => document.body.innerText);
      const hasRawKey = body.split("\n").some(l => /^[a-z][a-zA-Z0-9]*\.[a-zA-Z0-9.]+$/.test(l.trim()));
      console.log(`${path} -> ${resp.status()} title="${title.slice(0,45)}" rawKey=${hasRawKey} len=${body.length}`);
    } catch (e) { console.log(`${path} -> ERR ${e.message.slice(0,60)}`); }
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
