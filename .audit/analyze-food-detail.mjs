import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const urls = Object.keys(d).filter((k) => /\/ja\/food\/[a-z]/.test(k));
for (const url of urls.slice(0, 3)) {
  const text = (d[url].text || "");
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isDirty(c));
  console.log("=== " + url + " (" + dirty.length + " dirty) ===");
  console.log(dirty.slice(0, 20).join("\n"));
  console.log();
}
