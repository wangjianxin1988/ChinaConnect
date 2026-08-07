import { readFileSync } from "node:fs";
import { join } from "node:path";

const ACCOUNT_ID = "d6d81a527b2e9b2620245bfa56711398";
const PROJECT = "chinaconnect";
const DOMAINS = ["chinaengage.org", "www.chinaengage.org"];

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
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: j };
}

for (const d of DOMAINS) {
  console.log("PATCH", d);
  const r = await api(
    "PATCH",
    `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains/${d}`,
    {},
  );
  console.log(
    "  HTTP " + r.status + " " + (r.ok ? "OK" : "FAIL: " + JSON.stringify(r.data.errors)),
  );
  if (r.ok)
    console.log(
      "  status:",
      r.data.result.status,
      "verification:",
      r.data.result.verification_data,
    );
}
