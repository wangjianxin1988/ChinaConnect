import fs from "node:fs";
import { simplifiedCount, kanaCount, hanCount } from "./ja-residue.mjs";
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const rows = [];
for (const [url, p] of Object.entries(d)) {
  const text = (p.text || "") + "\n" + (p.title || "");
  // split into chunks by whitespace-ish boundaries to find dirty segments
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isDirty(c));
  if (dirty.length) rows.push({ url, count: dirty.length, samples: dirty.slice(0, 5) });
}
rows.sort((a, b) => b.count - a.count);
console.log("pages with dirty residue:", rows.length);
for (const r of rows) {
  console.log(r.count + "  " + r.url);
  console.log("    " + r.samples.join(" | "));
}
