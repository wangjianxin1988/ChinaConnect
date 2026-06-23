/**
 * Verify download/phone/map links on built city pages actually point to real
 * store / phone-app / map-app URLs. Requires `pnpm build` to have produced
 * dist/, plus a static server on PORT (start it via scripts/static-server.mjs).
 *
 * Usage:
 *   # Terminal A
 *   node scripts/static-server.mjs
 *   # Terminal B
 *   node scripts/verify-links.mjs
 */
import { chromium } from "playwright";

const PORT = 4322;
const BASE = `http://localhost:${PORT}`;
const CITIES = ["beijing", "shanghai", "chengdu", "guangzhou", "xian", "hangzhou", "shenzhen"];

const results = {
  appStoreLinks: { tested: 0, ok: 0, broken: [] },
  androidLinks: { tested: 0, ok: 0, broken: [] },
  phoneLinks: { tested: 0, ok: 0, broken: [] },
  mapLinks: { tested: 0, ok: 0, broken: [] },
  nationalEmergency: { tested: 0, ok: 0, broken: [] },
};

function isValidHref(href, kind) {
  if (!href) return { ok: false, reason: "empty" };
  if (kind === "appStore") {
    if (href.startsWith("itms-apps://itunes.apple.com/app/id")) return { ok: true };
    if (href.includes("apps.apple.com/app/") && !href.includes("%25")) return { ok: true };
    return { ok: false, reason: "malformed apps.apple.com URL" };
  }
  if (kind === "android") {
    if (href.startsWith("intent://details?id=")) return { ok: true };
    if (href.includes("play.google.com/store/apps/details?id=") && !href.includes(" ")) return { ok: true };
    return { ok: false, reason: "malformed play.google.com URL" };
  }
  if (kind === "phone") {
    if (href.startsWith("tel:") && href.length > 4) return { ok: true };
    return { ok: false, reason: "not a tel: link" };
  }
  if (kind === "map") {
    if (href.startsWith("comgooglemaps://") || href.startsWith("geo:") || href.startsWith("maps://")) return { ok: true };
    if (href.includes("google.com/maps/") || href.includes("amap.com/")) return { ok: true };
    return { ok: false, reason: "no map URL pattern matched" };
  }
  if (kind === "nationalEmergency") {
    if (href.startsWith("tel:") && href.length > 4) return { ok: true };
    return { ok: false, reason: "not a tel: link" };
  }
  return { ok: false, reason: "unknown kind" };
}

async function main() {
  console.log(`[verify-links] Visiting ${CITIES.length} cities on ${BASE}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  let visited = 0;

  for (const city of CITIES) {
    console.log(`\n=== ${city} ===`);
    try {
      await page.goto(`${BASE}/city/${city}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (e) {
      console.log(`  Skipped: ${e.message.slice(0, 80)}`);
      continue;
    }
    visited++;

    // App section
    const appStoreHrefs = await page.$$eval('a[href*="apps.apple.com"], a[href*="itms-apps://"]', (els) =>
      els.map((e) => e.getAttribute("href")).filter(Boolean),
    );
    const androidHrefs = await page.$$eval('a[href*="play.google.com"], a[href*="intent://"]', (els) =>
      els.map((e) => e.getAttribute("href")).filter(Boolean),
    );
    for (const h of appStoreHrefs) {
      results.appStoreLinks.tested++;
      const v = isValidHref(h, "appStore");
      if (v.ok) results.appStoreLinks.ok++;
      else results.appStoreLinks.broken.push({ city, href: h, reason: v.reason });
    }
    for (const h of androidHrefs) {
      results.androidLinks.tested++;
      const v = isValidHref(h, "android");
      if (v.ok) results.androidLinks.ok++;
      else results.androidLinks.broken.push({ city, href: h, reason: v.reason });
    }
    console.log(`  App Store links: ${appStoreHrefs.length} (${results.appStoreLinks.ok} ok)`);
    console.log(`  Android links:   ${androidHrefs.length} (${results.androidLinks.ok} ok)`);

    // Hotels page
    try {
      await page.goto(`${BASE}/city/${city}/hotels/`, { waitUntil: "domcontentloaded", timeout: 20000 });
      const telHrefs = await page.$$eval('a[href^="tel:"]', (els) =>
        els.map((e) => e.getAttribute("href")).filter(Boolean),
      );
      for (const h of telHrefs) {
        results.phoneLinks.tested++;
        const v = isValidHref(h, "phone");
        if (v.ok) results.phoneLinks.ok++;
        else results.phoneLinks.broken.push({ city, href: h, reason: v.reason });
      }
      console.log(`  Phone links:     ${telHrefs.length} (${results.phoneLinks.ok} ok)`);
    } catch (e) {
      console.log(`  Hotels skipped: ${e.message.slice(0, 80)}`);
    }

    // City home emergency section
    try {
      await page.goto(`${BASE}/city/${city}/#emergency`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.evaluate(() => {
        const el = document.getElementById("emergency");
        if (el) el.scrollIntoView();
      });
      await page.waitForTimeout(500);
      const emergencyHrefs = await page.$$eval(
        'a[href^="tel:+86"], a[href^="tel:+1"], a[href*="12308"], a[href*="12301"]',
        (els) => els.map((e) => e.getAttribute("href")).filter(Boolean),
      );
      for (const h of emergencyHrefs) {
        results.nationalEmergency.tested++;
        const v = isValidHref(h, "nationalEmergency");
        if (v.ok) results.nationalEmergency.ok++;
        else results.nationalEmergency.broken.push({ city, href: h, reason: v.reason });
      }
      console.log(`  Emergency tel:   ${emergencyHrefs.length} (${results.nationalEmergency.ok} ok)`);
    } catch (e) {
      console.log(`  Emergency skipped: ${e.message.slice(0, 80)}`);
    }
  }

  await browser.close();

  console.log("\n=== Summary ===");
  let totalBroken = 0;
  for (const [k, v] of Object.entries(results)) {
    const pct = v.tested > 0 ? Math.round((v.ok / v.tested) * 100) : 0;
    console.log(`  ${k}: ${v.ok}/${v.tested} ok (${pct}%)`);
    if (v.broken.length) {
      totalBroken += v.broken.length;
      console.log("    broken samples:");
      for (const b of v.broken.slice(0, 5)) {
        console.log(`      - ${b.city} | ${b.href.slice(0, 90)} | ${b.reason}`);
      }
    }
  }
  console.log(`\nVisited ${visited}/${CITIES.length} cities. Total broken: ${totalBroken}`);
  if (totalBroken > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
