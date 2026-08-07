#!/usr/bin/env node
// End-to-end launch verification
// Usage: node scripts/verify-launch.mjs
import https from "node:https";
import { execFileSync } from "node:child_process";

const DOMAINS = ["chinaengage.org", "www.chinaengage.org", "chinaconnect.pages.dev"];
const CRITICAL_PATHS = [
  "/",
  "/cities",
  "/food",
  "/ai",
  "/guide",
  "/city/beijing",
  "/city/beijing/food",
  "/city/beijing/hotels",
  "/city/beijing/attractions",
  "/pricing",
  "/account",
  "/auth/login",
];
const KEYWORDS_HOME = [
  ["ChinaGuide AI", "AI rename (item 15)"],
  ["hreflang", "Multilingual SEO (item 3)"],
  ["chinaengage.org", "Domain canonical"],
];
const KEYWORDS_CITY = [
  ["tel:", "Phone click-to-call (items 4,5,7,8)"],
  ["maps.google", "Map deep-link (items 4,5,7)"],
];

function get(url, timeout = 15000, maxRedirects = 5) {
  return new Promise((resolve) => {
    function attempt(u, n) {
      if (n > maxRedirects) return resolve({ status: 0, error: "too many redirects" });
      const url = new URL(u);
      https
        .get(
          {
            host: url.host,
            path: url.pathname + url.search,
            port: 443,
            method: "GET",
            timeout,
            headers: { "User-Agent": "Mozilla/5.0 verify-launch" },
          },
          (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
              const next = new URL(res.headers.location, u).toString();
              res.resume();
              return attempt(next, n + 1);
            }
            let body = "";
            res.on("data", (c) => (body += c));
            res.on("end", () =>
              resolve({ status: res.statusCode, headers: res.headers, body, finalUrl: u }),
            );
          },
        )
        .on("error", (e) => resolve({ status: 0, error: e.message }));
    }
    attempt(url, 0);
  });
}

function dnsNs(domain) {
  try {
    const out = execFileSync("nslookup", ["-type=NS", domain, "8.8.8.8"], {
      encoding: "utf8",
      timeout: 10000,
    });
    const lines = out.split(/\r?\n/).filter((l) => l.includes("nameserver ="));
    const ns = lines.map((l) => l.split("=")[1].trim());
    // SOA-only response = subdomain (e.g. www.example.com) inheriting parent zone via CNAME
    const hasSoa = /primary name server/i.test(out);
    const nxdomain = /can.t find|Non-existent/i.test(out);
    const isSubdomain = ns.length === 0 && hasSoa && !nxdomain;
    return { ns, nxdomain, isSubdomain };
  } catch (e) {
    return { error: e.message };
  }
}

let pass = 0,
  fail = 0;
function ok(msg) {
  console.log("  \u2713 " + msg);
  pass++;
}
function bad(msg) {
  console.log("  \u2717 " + msg);
  fail++;
}

console.log("== ChinaConnect Launch Verification ==\n");

console.log("[1/6] DNS NS via nslookup");
for (const d of DOMAINS) {
  const r = dnsNs(d);
  if (r.error) bad(d + " \u2192 " + r.error);
  else if (r.nxdomain) ok(d + " \u2192 NXDOMAIN (unregistered, ready to buy)");
  else if (r.ns.length > 0) ok(d + " \u2192 " + r.ns.join(", "));
  else if (r.isSubdomain) ok(d + " \u2192 CNAME subdomain (inherits parent zone)");
  else bad(d + " \u2192 no NS found");
}

console.log("\n[2/6] HTTP Status (follow redirects)");
for (const d of DOMAINS) {
  const r = await get("https://" + d + "/");
  if (r.status === 200) ok(d + "/ \u2192 200");
  else bad(d + "/ \u2192 " + (r.status || "ERROR") + " " + (r.error || ""));
}

console.log("\n[3/6] Critical Pages (chinaconnect.pages.dev)");
for (const path of CRITICAL_PATHS) {
  const r = await get("https://chinaconnect.pages.dev" + path);
  if (r.status === 200) ok(path + " \u2192 200");
  else bad(path + " \u2192 " + r.status);
}

console.log("\n[4/6] SSL / Cloudflare");
for (const d of DOMAINS) {
  const r = await get("https://" + d + "/");
  if (r.headers && r.headers.server) ok(d + " \u2192 server: " + r.headers.server);
  else bad(d + " \u2192 no SSL response");
}

console.log("\n[5/6] Content Spot-Check");
const home = await get("https://chinaconnect.pages.dev/");
if (home.body) {
  for (const [kw, label] of KEYWORDS_HOME) {
    if (home.body.includes(kw)) ok(label + ' \u2014 "' + kw + '" found');
    else bad(label + ' \u2014 "' + kw + '" missing');
  }
} else bad("Could not fetch home");

const cityFood = await get("https://chinaconnect.pages.dev/city/beijing/food");
if (cityFood.body) {
  for (const [kw, label] of KEYWORDS_CITY) {
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const count = (cityFood.body.match(re) || []).length;
    if (count > 0) ok(label + ' \u2014 "' + kw + '" x' + count);
    else bad(label + ' \u2014 "' + kw + '" missing');
  }
} else bad("Could not fetch /city/beijing/food");

console.log("\n[6/6] hreflang Tags");
if (home.body) {
  const matches = home.body.match(/hreflang="[a-z-]+"/g) || [];
  const langs = new Set(matches.map((m) => m.match(/"([^"]+)"/)[1]));
  if (langs.size >= 10) ok("hreflang count: " + langs.size);
  else bad("hreflang count: " + langs.size + " (expected >=10)");
}

console.log("\n== RESULT: " + pass + " pass, " + fail + " fail ==");
if (fail === 0) console.log("\ud83d\udfe2 LAUNCH READY");
else console.log("\ud83d\udd34 LAUNCH BLOCKED");
process.exit(fail === 0 ? 0 : 1);
