import fs from "node:fs";
const c = JSON.parse(fs.readFileSync(".audit/ja-translation-cache.json", "utf8"));
for (const t of ["10 years multiple entry", "3-5 business days", "DS-160 form required", "Standard Visitor", "Only for passport holders", "United States", "United Kingdom", "Tourist (L)", "90 days within 180 days", "AUD $20", "Prime location near Sanlitun", "¥2500-5000/night"]) {
  console.log(JSON.stringify(t), "=>", JSON.stringify(c[t] || "(missing)").slice(0, 90));
}
