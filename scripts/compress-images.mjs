// Compress all images in public/img/ext/*.{jpg,png} to webp 1280w q78 (or keep if already small)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "public", "img", "ext");
const MAP = path.join(ROOT, "src", ".image-map.json");

if (!fs.existsSync(DIR)) {
  console.error("no", DIR);
  process.exit(1);
}
const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
console.log("[scan] files to process:", files.length);

const map = JSON.parse(fs.readFileSync(MAP, "utf8"));
let totalIn = 0,
  totalOut = 0,
  converted = 0,
  skipped = 0,
  failed = 0;
const startedAt = Date.now();

async function one(f) {
  const fp = path.join(DIR, f);
  const inSize = fs.statSync(fp).size;
  totalIn += inSize;
  try {
    const img = sharp(fp, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    let pipeline = img;
    if (meta.width && meta.width > 1280) {
      pipeline = pipeline.resize({ width: 1280, withoutEnlargement: true });
    }
    pipeline = pipeline.webp({ quality: 78, effort: 4 });
    const buf = await pipeline.toBuffer();
    const outName = f.replace(/\.(jpe?g|png)$/i, ".webp");
    const outPath = path.join(DIR, outName);
    if (buf.length < inSize * 0.97 || inSize > 300 * 1024) {
      fs.writeFileSync(outPath, buf);
      fs.unlinkSync(fp);
      totalOut += buf.length;
      converted++;
      const oldLeaf = f;
      const newLeaf = outName;
      for (const [u, v] of Object.entries(map)) {
        if (v === "/img/ext/" + oldLeaf) {
          map[u] = "/img/ext/" + newLeaf;
        }
      }
    } else {
      totalOut += inSize;
      skipped++;
    }
  } catch (e) {
    failed++;
    totalOut += inSize;
    console.error("  ! fail", f, e.message);
  }
}

const CONC = 6;
let i = 0;
async function pool() {
  const ws = Array.from({ length: CONC }, async () => {
    while (i < files.length) {
      const idx = i++;
      await one(files[idx]);
      if ((idx + 1) % 100 === 0) {
        const msg =
          "  [compress] " +
          (idx + 1) +
          "/" +
          files.length +
          " in=" +
          ((totalIn / 1024) * 1024).toFixed(1) +
          "MB" +
          " out=" +
          ((totalOut / 1024) * 1024).toFixed(1) +
          "MB" +
          " fail=" +
          failed;
        console.log(msg);
      }
    }
  });
  await Promise.all(ws);
}
await pool();

fs.writeFileSync(MAP, JSON.stringify(map, null, 2));
const sec = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(
  "[done] in=" +
    ((totalIn / 1024) * 1024).toFixed(1) +
    "MB" +
    " out=" +
    ((totalOut / 1024) * 1024).toFixed(1) +
    "MB" +
    " converted=" +
    converted +
    " skipped=" +
    skipped +
    " failed=" +
    failed +
    " elapsed=" +
    sec +
    "s",
);
