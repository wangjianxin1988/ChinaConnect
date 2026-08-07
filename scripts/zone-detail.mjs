import { readFileSync } from "node:fs";
import { join } from "node:path";
const cfg = readFileSync(
  join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
  "utf8",
);
const TOKEN = cfg.match(/oauth_token = "(.+?)"/)[1];
const r = await fetch(
  "https://api.cloudflare.com/client/v4/zones/1ab88b9725600c0bc2dab7680862a866",
  { headers: { Authorization: "Bearer " + TOKEN } },
);
const j = await r.json();
console.log("Zone details:");
console.log(JSON.stringify(j.result, null, 2));
