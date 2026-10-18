/**
 * 压缩 shangri-la 图片到项目标准（现有图片平均 90KB，中位数 75KB）。
 *
 * 背景：2026-10-18 这批图片是 2-6MB 的原图，13 张合计 39.5MB，会让首屏加载爆炸，
 * 且 CF Pages 单文件/总大小都有约束。
 *
 * 用法：node scripts/compress-city-images.mjs shangri-la
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const prefix = process.argv[2] || "shangri-la";
const dir = path.resolve("public/img/ext");

const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith(prefix + "-") && f.endsWith(".webp"));

if (files.length === 0) {
  console.error(`没有找到 ${prefix}-*.webp`);
  process.exit(1);
}

let beforeTotal = 0;
let afterTotal = 0;

for (const f of files) {
  const p = path.join(dir, f);
  const before = fs.statSync(p).size;
  beforeTotal += before;

  try {
    const meta = await sharp(p).metadata();
    // 保持原比例，最长边不超过 1600px（卡片展示足够，Retina 也够用）
    const buf = await sharp(p)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toBuffer();

    if (buf.length < before) {
      fs.writeFileSync(p, buf);
      afterTotal += buf.length;
      console.log(
        `${f.padEnd(34)} ${(before / 1024).toFixed(0).padStart(6)}KB → ${(buf.length / 1024).toFixed(0).padStart(5)}KB  (${meta.width}x${meta.height})`,
      );
    } else {
      afterTotal += before;
      console.log(`${f.padEnd(34)} 已足够小，跳过 (${(before / 1024).toFixed(0)}KB)`);
    }
  } catch (e) {
    afterTotal += before;
    console.error(`${f}: 压缩失败 ${e.message}`);
  }
}

console.log(
  `\n合计: ${(beforeTotal / 1024 / 1024).toFixed(1)}MB → ${(afterTotal / 1024 / 1024).toFixed(1)}MB`,
);
