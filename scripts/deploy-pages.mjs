// One-step deploy script for Cloudflare Pages.
//
// Background:
// - CF Pages project `chinaconnect` is bound to the GitHub repo and
//   auto-builds on push to master. So normally no manual deploy is needed.
// - Use this script when you want to deploy without pushing (e.g. to a
//   preview branch, or to recover from a failed auto-build).
//
// Setup (one-time, ~2 min):
//   1. Log in to https://dash.cloudflare.com/
//   2. My Profile -> API Tokens -> Create Token
//      - Template: "Edit Cloudflare Pages"
//      - Account Resources: include your account
//      - Zone Resources: All zones (or just chinaengage.org)
//      - TTL: as you prefer
//      - Copy the token (shown only once)
//   3. Save it to scripts/cf-api-token.txt (single line, no quotes)
//      OR set env CF_API_TOKEN=<token>
//
// Usage:
//   node scripts/deploy-pages.mjs                  # deploy dist/ to master
//   node scripts/deploy-pages.mjs --branch preview # deploy to preview branch
//   node scripts/deploy-pages.mjs --no-build       # skip pnpm build
//
// Prereq: dist/ exists (run pnpm build first unless --no-build)

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ACCOUNT_ID = "d6d81a527b2e9b2620245bfa56711398";
const PROJECT_NAME = "chinaconnect";
const TOKEN_FILE = "scripts/cf-api-token.txt";

function loadToken() {
  if (process.env.CF_API_TOKEN) return process.env.CF_API_TOKEN.trim();
  if (fs.existsSync(TOKEN_FILE)) {
    return fs.readFileSync(TOKEN_FILE, "utf8").trim();
  }
  console.error(`[ERROR] CF API token not found.`);
  console.error(`Either:`);
  console.error(`  - set env CF_API_TOKEN=<token>`);
  console.error(`  - or save token to ${TOKEN_FILE}`);
  console.error(`See header comment in this script for how to create one.`);
  process.exit(1);
}

function buildSite() {
  console.log("Building site...");
  const r = spawnSync("pnpm", ["build"], { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error("[FATAL] pnpm build failed");
    process.exit(1);
  }
}

async function uploadDir(token, dirPath, prefix = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    const remote = prefix + entry.name;
    if (entry.isDirectory()) {
      count += await uploadDir(token, full, remote + "/");
    } else if (entry.isFile()) {
      const content = fs.readFileSync(full);
      const hash = require("node:crypto").createHash("sha256").update(content).digest("hex");
      // Use the assets upload endpoint
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/assets/upload`;
      const form = new FormData();
      form.set("file", new Blob([content]), remote);
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!r.ok) {
        const text = await r.text();
        console.error(`[FAIL] ${remote}: ${r.status} ${text}`);
        continue;
      }
      count++;
    }
  }
  return count;
}

async function createDeployment(token, branch) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch,
      // Let CF rebuild from the source repo (no need to upload assets)
    }),
  });
  return { status: r.status, body: await r.text() };
}

async function main() {
  const args = process.argv.slice(2);
  const noBuild = args.includes("--no-build");
  const branchIdx = args.indexOf("--branch");
  const branch = branchIdx >= 0 ? args[branchIdx + 1] : "master";

  if (!noBuild) buildSite();

  const token = loadToken();
  console.log(`Deploying to branch '${branch}' of project '${PROJECT_NAME}'...`);

  const r = await createDeployment(token, branch);
  console.log(`Status: ${r.status}`);
  console.log(r.body);
  process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
}

main().catch((e) => {
  console.error("[FATAL]", e.message);
  process.exit(1);
});
