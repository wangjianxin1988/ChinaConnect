// One-shot: collect all external image URLs from src/, dedupe, download to public/img/ext/.
// Output: src/.image-map.json  { url: "/img/ext/<hash>.<ext>" }
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public", "img", "ext");
const MAP = path.join(SRC, ".image-map.json");

const fileExt = (u) => {
  const m = u.match(/\.(jpe?g|png|webp|avif|gif)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
};
const hash = (u) => crypto.createHash("sha1").update(u).digest("hex").slice(0, 12);

function walk(d) {
  const out = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const re = /https:\/\/images\.(?:unsplash|pexels)\.com\/[^"\s<>)]+/g;
const urls = new Set();
for (const f of walk(SRC)) {
  if (!/\.(json|ts|tsx|astro|mdx?|html)$/.test(f)) continue;
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(re)) urls.add(m[0]);
}
console.log("[scan] unique URLs:", urls.size);
fs.mkdirSync(OUT, { recursive: true });

const existingMap = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, "utf8")) : {};
const nextMap = { ...existingMap };
const list = [...urls];
let done = 0,
  failed = 0,
  skipped = 0;
const startedAt = Date.now();

async function one(u) {
  if (nextMap[u]) {
    skipped++;
    return;
  }
  const ext = fileExt(u);
  const h = hash(u);
  const fname = `${h}.${ext}`;
  const fpath = path.join(OUT, fname);
  try {
    const r = await fetch(u, {
      redirect: "follow",
      headers: { "User-Agent": "chinaconnect-localizer/1.0" },
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(fpath, buf);
    nextMap[u] = `/img/ext/${fname}`;
  } catch (e) {
    failed++;
    console.error("  ! failed:", u.slice(0, 80), e.message);
  }
}

const CONC = 12;
let i = 0;
async function pool() {
  const workers = Array.from({ length: CONC }, async () => {
    while (i < list.length) {
      const idx = i++;
      await one(list[idx]);
      done++;
      if (done % 50 === 0)
        console.log(`  [download] ${done}/${list.length} (failed=${failed}, skipped=${skipped})`);
    }
  });
  await Promise.all(workers);
}
await pool();

fs.writeFileSync(MAP, JSON.stringify(nextMap, null, 2));
const sec = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(
  `[done] mapped=${Object.keys(nextMap).length}, failed=${failed}, skipped=${skipped}, elapsed=${sec}s`,
);
