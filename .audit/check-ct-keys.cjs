const fs = require("fs");
const s = fs.readFileSync("src/i18n/components-strings.ts", "utf8");
const keys = ["hl_local_recommend", "hl_affordable", "hl_street_food", "food_explore_all", "food_filter_layers", "hl_section_title", "hl_section_desc", "hl_view_all", "tier_short_s", "tier_short_a"];
for (const k of keys) {
  const re = new RegExp(k + "\\s*:\\s*\\{");
  const found = re.test(s);
  const jaRe = new RegExp(k + "\\s*:\\s*\\{[^}]*ja\\s*:");
  console.log(k + ": " + (jaRe.test(s) ? "ja OK" : found ? "key exists but NO ja?" : "MISSING"));
}
