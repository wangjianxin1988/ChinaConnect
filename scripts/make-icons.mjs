import sharp from "file:///D:/suoyouxiangmu/chinaconnect/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js";
import { readFileSync, statSync } from "fs";
const svg = readFileSync("public/logo.svg");
const fav = readFileSync("public/favicon.svg");
const tasks = [
  [svg, 512, 512, "public/logo.png"],
  [fav, 64, 64, "public/favicon.png"],
  [svg, 180, 180, "public/apple-touch-icon.png"],
  [fav, 192, 192, "public/icons/icon-192.png"],
  [fav, 512, 512, "public/icons/icon-512.png"],
  [fav, 512, 512, "public/icons/icon-maskable.png"],
];
for (const [buf, w, h, out] of tasks) {
  await sharp(buf).resize(w, h).png().toFile(out);
  console.log(out, statSync(out).size, "bytes");
}
