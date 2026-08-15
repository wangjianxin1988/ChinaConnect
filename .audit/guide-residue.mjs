import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const guideUrls = Object.keys(d).filter((k) => k.includes("/guide/"));
for (const url of guideUrls) {
  const text = (d[url].text || "");
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isDirty(c));
  if (dirty.length) {
    console.log("=== " + url + " (" + dirty.length + ") ===");
    console.log(dirty.slice(0, 12).join(" | "));
  }
}
