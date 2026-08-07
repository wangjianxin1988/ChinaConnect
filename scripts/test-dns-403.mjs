import { readFileSync } from "node:fs";
import { join } from "node:path";
const cfg = readFileSync(
  join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
  "utf8",
);
const TOKEN = cfg.match(/oauth_token = "(.+?)"/)[1];

// Try a few DNS endpoints to see what we have permission for
for (const path of [
  "/zones?name=chinaengage.org",
  "/zones/1ab88b9725600c0bc2dab7680862a866/dns_records?per_page=10",
  "/zones/1ab88b9725600c0bc2dab7680862a866",
]) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + path, {
    headers: { Authorization: "Bearer " + TOKEN },
  });
  const j = await r.json().catch(() => ({}));
  console.log(path, "->", r.status);
  if (j.result && Array.isArray(j.result)) {
    j.result.forEach((x) => console.log("  -", JSON.stringify(x).slice(0, 100)));
  } else if (j.result) {
    console.log("  result keys:", Object.keys(j.result).join(","));
  } else {
    console.log("  body:", JSON.stringify(j).slice(0, 200));
  }
}
