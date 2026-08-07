import { readFileSync } from "node:fs";
import { join } from "node:path";

const ACCOUNT_ID = "d6d81a527b2e9b2620245bfa56711398";
const ZONE_ID = "1ab88b9725600c0bc2dab7680862a866";

const cfg = readFileSync(
  join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
  "utf8",
);
const TOKEN = cfg.match(/oauth_token = "(.+?)"/)[1];
const headers = { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" };

async function api(method, path, body) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let j;
  try {
    j = JSON.parse(txt);
  } catch {
    j = { raw: txt.slice(0, 200) };
  }
  return { ok: r.ok, status: r.status, data: j };
}

async function addRecord(type, name, content) {
  console.log("Creating " + type + " " + name + " -> " + content + " (proxied)...");
  const r = await api("POST", "/zones/" + ZONE_ID + "/dns_records", {
    type,
    name,
    content,
    proxied: true,
  });
  if (r.ok) {
    console.log("  HTTP " + r.status + " OK id:" + r.data.result.id);
  } else if (r.status === 403 || r.data.errors?.some((e) => e.code === 81057)) {
    // 81057 = record already exists
    console.log("  HTTP " + r.status + " - already exists or forbidden, trying patch...");
    // find existing
    const list = await api(
      "GET",
      "/zones/" + ZONE_ID + "/dns_records?type=" + type + "&name=" + name + ".chinaengage.org",
    );
    if (list.ok && list.data.result && list.data.result[0]) {
      const id = list.data.result[0].id;
      const upd = await api("PUT", "/zones/" + ZONE_ID + "/dns_records/" + id, {
        type,
        name,
        content,
        proxied: true,
      });
      console.log("  PATCH " + upd.status + " " + (upd.ok ? "OK" : "FAIL"));
    } else {
      console.log("  PATCH lookup failed:", JSON.stringify(list.data));
    }
  } else {
    console.log("  HTTP " + r.status + " FAIL:", JSON.stringify(r.data.errors || r.data));
  }
}

await addRecord("CNAME", "www", "chinaconnect.pages.dev");
await addRecord("CNAME", "@", "chinaconnect.pages.dev");

// Final list
console.log("\nFinal DNS records:");
const r = await api("GET", "/zones/" + ZONE_ID + "/dns_records?per_page=100");
if (r.ok && r.data.result) {
  r.data.result.forEach((rec) =>
    console.log(
      "  - " + rec.type + " " + rec.name + " -> " + rec.content + (rec.proxied ? " (proxied)" : ""),
    ),
  );
} else {
  console.log("  (list failed: " + r.status + ")");
}
