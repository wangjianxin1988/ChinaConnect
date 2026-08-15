const fs = require("fs");
const s = fs.readFileSync("src/i18n/components-strings.ts", "utf8");
for (const k of ["food_explore_all", "hl_section_desc"]) {
  const re = new RegExp(k + "\\s*:\\s*\\{[\\s\\S]{0,200}?\\n\\s*\\}", "m");
  const m = s.match(re);
  console.log("=== " + k + " ===");
  console.log(m ? m[0] : "not found");
}
