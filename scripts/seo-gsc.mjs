// Submit sitemap to Google Search Console via the Webmasters API v3.
//
// Setup (one-time, ~2 min):
//   1. In Google Cloud Console (https://console.cloud.google.com/):
//      - Create or select a project
//      - Enable the "Google Search Console API" (Webmasters API v3)
//      - Create a Service Account (IAM & Admin -> Service Accounts)
//      - Download the JSON key -> save as scripts/gsc-service-account.json
//   2. In Google Search Console (https://search.google.com/search-console/):
//      - Add property "https://chinaengage.org" (URL prefix type)
//      - Settings -> Users and permissions -> Add the service account email
//        as an Owner (so it can submit sitemaps)
//
// Usage:
//   node scripts/seo-gsc.mjs                    # submits sitemap.xml
//   node scripts/seo-gsc.mjs path/to/file.xml   # submits custom file
//   node scripts/seo-gsc.mjs --check           # lists existing sitemaps
//
// Env:
//   GSC_SA_KEY=path/to/json   override default scripts/gsc-service-account.json

import fs from "node:fs";
import crypto from "node:crypto";

const SITE_URL = "sc-domain:chinaengage.org";
const DEFAULT_FEEDPATH = "https://chinaengage.org/sitemap.xml";
const SA_PATH = process.env.GSC_SA_KEY || "scripts/gsc-service-account.json";

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signatureInput = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  signer.end();
  const signature = base64url(signer.sign(sa.private_key));
  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }
  return (await res.json()).access_token;
}

async function submitSitemap(accessToken, feedpath) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE_URL,
  )}/sitemaps/${encodeURIComponent(feedpath)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function listSitemaps(accessToken) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    SITE_URL,
  )}/sitemaps`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const feedpath = args.find((a) => !a.startsWith("--")) || DEFAULT_FEEDPATH;

  if (!fs.existsSync(SA_PATH)) {
    console.error(`[ERROR] Service account JSON not found at: ${SA_PATH}`);
    console.error("Set GSC_SA_KEY env or place the JSON file there.");
    console.error("See header comment in scripts/seo-gsc.mjs for setup.");
    process.exit(1);
  }

  const sa = JSON.parse(fs.readFileSync(SA_PATH, "utf8"));
  console.log(`Using service account: ${sa.client_email}`);

  const token = await getAccessToken(sa);
  console.log("Access token obtained.");

  if (checkOnly) {
    console.log(`Listing sitemaps for ${SITE_URL}...`);
    const r = await listSitemaps(token);
    console.log(`Status: ${r.status}`);
    console.log(r.body);
    process.exit(r.status === 200 ? 0 : 1);
  }

  console.log(`Submitting ${feedpath} to ${SITE_URL}...`);
  const r = await submitSitemap(token, feedpath);
  console.log(`Status: ${r.status}`);
  console.log(r.body);
  process.exit(r.status === 200 ? 0 : 1);
}

main().catch((err) => {
  console.error("[FATAL]", err.message);
  process.exit(1);
});
