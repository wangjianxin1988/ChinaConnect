import fs from "node:fs";
const overridesRaw = fs.readFileSync("src/data/guide/ja-overrides.ts", "utf8");
const getOvs = new Set();
for (const m of overridesRaw.matchAll(/"((?:[^"\\]|\\.)*)":/g)) getOvs.add(m[1]);
const { TRANSLATION_SERVICES, TRANSLATION_FAQS } = await import("../src/data/guide/business/translation.ts");
const missing = new Set();
for (const s of TRANSLATION_SERVICES) {
  for (const l of s.languages) if (!getOvs.has(l)) missing.add("LANG: " + l);
  for (const f of s.features) if (!getOvs.has(f)) missing.add("FEATURE: " + f);
  if (!getOvs.has(s.priceRange)) missing.add("PRICE: " + s.priceRange);
  if (!getOvs.has(s.delivery)) missing.add("DELIVERY: " + s.delivery);
}
for (const f of TRANSLATION_FAQS) {
  if (!getOvs.has(f.q)) missing.add("FAQ.q: " + f.q);
  if (!getOvs.has(f.a)) missing.add("FAQ.a: " + f.a);
}
console.log("missing:", missing.size);
console.log([...missing].join("\n"));
