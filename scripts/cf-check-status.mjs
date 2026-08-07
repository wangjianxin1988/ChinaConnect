import { readFileSync } from "node:fs";
import { join } from "node:path";

const ACCOUNT_ID = "d6d81a527b2e9b2620245bfa56711398";
const PROJECT = "chinaconnect";

const cfg = readFileSync(
  join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
  "utf8",
);
const TOKEN = cfg.match(/oauth_token = "(.+?)"/)[1];
const headers = { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" };

async function api(method, path) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + path, { method, headers });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

console.log("=== Cloudflare Pages Custom Domain Status ===\n");
const r = await api("GET", "/accounts/" + ACCOUNT_ID + "/pages/projects/" + PROJECT + "/domains");
if (r.ok) {
  r.data.result.forEach((d) => {
    console.log("Domain: " + d.name);
    console.log("  Status: " + d.status);
    console.log("  Cert status: " + (d.validation_data?.status || "n/a"));
    console.log("  Cert method: " + (d.validation_data?.method || "n/a"));
    console.log("  Cert txt name: " + (d.validation_data?.txt_name || "n/a"));
    console.log("  Cert txt value: " + (d.validation_data?.txt_value || "n/a"));
    console.log("  Cert http body: " + (d.validation_data?.http_body || "n/a"));
    console.log("  Cert http url: " + (d.validation_data?.http_url || "n/a"));
    console.log("  Created: " + d.created_on);
    console.log("");
  });
} else {
  console.log("List failed:", r.status, JSON.stringify(r.data));
}

console.log("=== Zone DNS Records (chinaengage.org) ===\n");
const z = await api("GET", "/zones?name=chinaengage.org&account.id=" + ACCOUNT_ID);
if (z.ok && z.data.result[0]) {
  const zid = z.data.result[0].id;
  const recs = await api("GET", "/zones/" + zid + "/dns_records?per_page=50");
  if (recs.ok) {
    recs.data.result.forEach((rec) => {
      console.log(
        "  " + rec.type + " " + rec.name + " -> " + rec.content + (rec.proxied ? " (proxied)" : ""),
      );
    });
    if (recs.data.result.length === 0) console.log("  (no records)");
  } else {
    console.log("  List failed: " + recs.status, JSON.stringify(recs.data));
  }
} else {
  console.log("Zone lookup failed");
}
