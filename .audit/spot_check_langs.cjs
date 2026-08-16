const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const checks = [
    { url: "/ko/guide/visa", re: /[\uac00-\ud7af]/ , label: "korean-hangul" },
    { url: "/ar/guide/visa", re: /[\u0600-\u06ff]/ , label: "arabic" },
    { url: "/fa/guide", re: /[\u0600-\u06ff]/ , label: "persian" },
    { url: "/ko/city/beijing/apps/", re: /[\uac00-\ud7af]/, label: "korean-apps" },
    { url: "/de/city/beijing/apps/", re: /[äöüßÄÖÜ]/, label: "german-apps" },
    { url: "/th/guide/payment", re: /[\u0e00-\u0e7f]/, label: "thai" },
  ];
  for (const c of checks) {
    const page = await browser.newPage();
    try {
      await page.goto("http://127.0.0.1:4322" + c.url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1200);
      const body = await page.evaluate(() => document.body.innerText);
      const matches = body.match(new RegExp(c.re.source, "g")) || [];
      const sample = body.split("\n").filter(l => c.re.test(l) && l.trim().length > 10).slice(0, 2);
      console.log(`${c.url}: ${c.label}-chars=${matches.length} | sample="${(sample[0]||"").slice(0,70)}"`);
    } catch (e) {
      console.log(`${c.url}: ERR ${e.message.slice(0, 60)}`);
    }
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error("FATAL", e); process.exit(1); });
