import { readFileSync } from "node:fs";
import { join } from "node:path";
const cfg = readFileSync(
  join(process.env.USERPROFILE || "", ".wrangler", "config", "default.toml"),
  "utf8",
);
const token = cfg.match(/oauth_token = "(.+?)"/)[1];

// Try multiple endpoints
for (const ep of [
  "/user",
  "/user/tokens/verify",
  "/accounts/d6d81a527b2e9b2620245bfa56711398/pages/projects/chinaconnect/domains",
]) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + ep, {
    headers: { Authorization: "Bearer " + token },
  });
  const txt = await r.text();
  console.log(ep, "->", r.status, txt.slice(0, 200));
  console.log("---");
}
