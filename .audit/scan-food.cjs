const fs = require("fs");
const { simplifiedCount, kanaCount, hanCount } = await import("./.audit/ja-residue.mjs");
const isDirty = (text) => {
  const n = simplifiedCount(text);
  if (n >= 2) return true;
  if (n >= 1 && kanaCount(text) === 0 && hanCount(text) >= 2) return true;
  return false;
};
const files = ["categories.ts", "cities-food-data.ts", "cities.ts", "restaurants.ts", "sample-restaurants.ts"];
const hits = [];
for (const f of files) {
  const s = fs.readFileSync("src/data/food/" + f, "utf8");
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[1];
    if (t.length >= 2 && /[\u4e00-\u9fff]/.test(t) && isDirty(t)) hits.push({ f, t });
  }
}
console.log("dirty string count:", hits.length);
const byF = {};
for (const h of hits) (byF[h.f] ||= []).push(h.t);
for (const [f, ts] of Object.entries(byF)) {
  console.log("--- " + f + " (" + ts.length + ") ---");
  console.log(ts.slice(0, 8).join(" | "));
}
