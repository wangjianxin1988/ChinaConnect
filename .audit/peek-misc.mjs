import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
for (const url of ["/ja/cities/", "/ja/", "/ja/ai/"]) {
  const p = d[url];
  if (!p) { console.log(url + ": not scanned"); continue; }
  const text = (p.text || "");
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isDirty(c));
  console.log("=== " + url + " (" + dirty.length + ") ===");
  console.log(dirty.slice(0, 25).join("\n"));
}
