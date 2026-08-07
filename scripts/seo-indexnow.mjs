import fs from "fs";
import path from "path";

// Submit URLs to the public IndexNow endpoint (used by Microsoft Bing, Yandex,
// DuckDuckGo, Seznam and others). The shared key + key file is published at the
// site root at https://chinaengage.org/<key>.txt so any search engine that
// receives the submission can verify ownership.
//
// Usage: node scripts/seo-indexnow.mjs [path-to-url-list]
//   defaults to scripts/seo-indexnow.urls.txt (one URL per line).

const HOST = "chinaengage.org";
const KEY = "db47c0eb9e3c4f56a05e6a91faebc2f1";
const ENDPOINT = "https://api.indexnow.org/indexnow";

const urlFile = process.argv[2] || path.join("scripts", "seo-indexnow.urls.txt");
if (!fs.existsSync(urlFile)) {
  console.error(`Missing URL list: ${urlFile}`);
  process.exit(1);
}
const urlList = fs
  .readFileSync(urlFile, "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);
if (urlList.length === 0) {
  console.error(`URL list is empty: ${urlFile}`);
  process.exit(1);
}

const payload = { host: HOST, key: KEY, urlList };
const body = JSON.stringify(payload);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body,
});

console.log(`posted ${urlList.length} urls to ${ENDPOINT} -> http ${res.status}`);
if (!res.ok) {
  const text = await res.text();
  console.error("response:", text);
  process.exitCode = 1;
}
