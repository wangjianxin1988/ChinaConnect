import { readFileSync } from "node:fs";
import { join } from "node:path";

const ACCOUNT_ID = "d6d81a527b2e9b2620245bfa56711398";
const PROJECT = "chinaconnect";
const DOMAINS = ["chinaengage.org", "www.chinaengage.org"];

const DRY_RUN = process.argv.includes("--dry-run");
let TOKEN = process.env.CF_API_TOKEN;

if (!TOKEN) {
  try {
    const cfg = readFileSync(
      join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
      "utf8",
    );
    const m = cfg.match(/oauth_token = "(.+?)"/);
    TOKEN = m ? m[1] : null;
    if (TOKEN) console.log("[auth] Using OAuth token from wrangler config");
  } catch (e) {
    console.error("Could not read wrangler config:", e.message);
  }
}

if (!TOKEN) {
  console.error("ERROR: No token found. Set $env:CF_API_TOKEN or run wrangler login");
  process.exit(2);
}

const headers = {
  Authorization: "Bearer " + TOKEN,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j };
}

async function listDomains() {
  const r = await api("GET", "/accounts/" + ACCOUNT_ID + "/pages/projects/" + PROJECT + "/domains");
  if (!r.ok) {
    console.error("List domains failed:", r.status, JSON.stringify(r.data));
    return [];
  }
  return r.data.result;
}

async function addDomain(domain) {
  console.log("-> " + (DRY_RUN ? "[DRY-RUN] " : "") + "Add " + domain + " to " + PROJECT + "...");
  if (DRY_RUN) {
    console.log("  POST /accounts/" + ACCOUNT_ID + "/pages/projects/" + PROJECT + "/domains");
    console.log("  body: { name: " + domain + " }");
    return { ok: true, status: 200, data: { result: { name: domain }, dry_run: true } };
  }
  const r = await api(
    "POST",
    "/accounts/" + ACCOUNT_ID + "/pages/projects/" + PROJECT + "/domains",
    { name: domain },
  );
  console.log("  HTTP " + r.status + " " + (r.ok ? "\u2713" : "\u2717"));
  if (!r.ok) {
    const errs = r.data.errors || [];
    errs.forEach((e) => console.log("    - " + e.message + " (code " + e.code + ")"));
    if (r.status === 409 || errs.some((e) => e.code === 1224)) {
      console.log("    (domain already attached - treating as success)");
      return { ok: true, status: 200, data: { result: { name: domain, already: true } } };
    }
  } else {
    const cert = r.data.result && r.data.result.validation_data;
    if (cert) console.log("    cert: " + JSON.stringify(cert));
  }
  return r;
}

(async () => {
  console.log('Cloudflare Pages - Add custom domain to "' + PROJECT + '"');
  console.log("Account: " + ACCOUNT_ID);
  console.log("Mode: " + (DRY_RUN ? "DRY-RUN" : "LIVE") + "\n");

  console.log("Current domains on project:");
  const existing = await listDomains();
  existing.forEach((d) => console.log("  - " + d.name + " (" + d.status + ")"));
  if (existing.length === 0) console.log("  (none)");

  for (const domain of DOMAINS) {
    const r = await addDomain(domain);
    if (!r.ok) {
      console.error("\u2717 Failed to add " + domain + ". Aborting.");
      process.exit(4);
    }
  }

  console.log("\nFinal domain list:");
  const final = await listDomains();
  final.forEach((d) => console.log("  - " + d.name + " (" + d.status + ")"));

  console.log("\n\u2713 Done. SSL certificate will be issued in 1-5 minutes.");
  console.log("Verify: https://chinaengage.org  https://www.chinaengage.org");
})().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
