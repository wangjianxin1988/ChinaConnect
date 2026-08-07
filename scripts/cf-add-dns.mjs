import { readFileSync } from "node:fs";
import { join } from "node:path";

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
    j = { raw: txt.slice(0, 300) };
  }
  return { ok: r.ok, status: r.status, data: j };
}

async function addRecord(type, name, content, proxied = true) {
  console.log("Creating " + type + " " + name + " -> " + content + (proxied ? " (proxied)" : ""));
  const r = await api("POST", "/zones/" + ZONE_ID + "/dns_records", {
    type,
    name,
    content,
    proxied,
  });
  console.log(
    "  HTTP " +
      r.status +
      (r.ok ? " OK id:" + r.data.result.id : " FAIL: " + JSON.stringify(r.data.errors || r.data)),
  );
  return r;
}

console.log("Adding DNS records for chinaengage.org -> chinaconnect.pages.dev\n");
await addRecord("CNAME", "www", "chinaconnect.pages.dev", true);
// For root domain @, use CNAME flattening (Cloudflare allows CNAME on root with proxy)
await addRecord("CNAME", "@", "chinaconnect.pages.dev", true);

console.log("\nDone");
