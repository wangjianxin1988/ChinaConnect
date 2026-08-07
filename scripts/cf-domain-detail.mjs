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

for (const d of ["chinaengage.org", "www.chinaengage.org"]) {
  const r = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" +
      ACCOUNT_ID +
      "/pages/projects/" +
      PROJECT +
      "/domains/" +
      d,
    { headers },
  );
  const j = await r.json();
  console.log("===", d, "===");
  console.log(JSON.stringify(j.result, null, 2));
  console.log("");
}
