import fs from "node:fs";
const overridesRaw = fs.readFileSync("src/data/guide/ja-overrides.ts", "utf8");
const getOvs = new Set();
for (const m of overridesRaw.matchAll(/"((?:[^"\\]|\\.)*)":/g)) getOvs.add(m[1]);
const { PAYMENT_METHODS, SHOPPING_TIPS, PAYMENT_FAQS } = await import("../src/data/guide/payment.ts");
const missing = new Set();
for (const m of PAYMENT_METHODS) {
  for (const t of m.tips) if (!getOvs.has(t)) missing.add("TIP: " + t);
  for (const t of m.pros) if (!getOvs.has(t)) missing.add("PRO: " + t);
  for (const t of m.cons) if (!getOvs.has(t)) missing.add("CON: " + t);
}
for (const t of SHOPPING_TIPS || []) {
  for (const k of ["tip","warning"]) if (t[k] && !getOvs.has(t[k])) missing.add("SHOPPING." + k + ": " + t[k]);
}
for (const f of PAYMENT_FAQS || []) {
  for (const k of ["q","a"]) if (f[k] && !getOvs.has(f[k])) missing.add("FAQ." + k + ": " + f[k]);
}
console.log("missing overrides:", missing.size);
console.log([...missing].join("\n"));
