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
  const chunks = text.split(/\n/).map((c) => c.trim()).filter((c) => c.length >= 2);
  const dirty = chunks.filter((c) => isDirty(c));
  if (dirty.length) rows.push({ url, count: dirty.length });
}
rows.sort((a, b) => b.count - a.count);
const byGroup = {};
for (const r of rows) {
  const g = r.url.replace(/\/ja\/?/, "").split("/")[0] || "(root)";
  (byGroup[g] ||= []).push(r);
}
for (const [g, rs] of Object.entries(byGroup)) {
  const total = rs.reduce((s, r) => s + r.count, 0);
  console.log(g + ": " + rs.length + " pages, " + total + " dirty chunks, max=" + rs[0].count + " (" + rs[0].url + ")");
}
