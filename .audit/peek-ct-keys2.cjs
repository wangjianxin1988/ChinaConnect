const fs = require("fs");
const s = fs.readFileSync("src/i18n/components-strings.ts", "utf8");
for (const k of ["food_explore_all", "hl_section_desc"]) {
  const i = s.indexOf(k);
  console.log("=== " + k + " @ " + i + " ===");
  if (i !== -1) console.log(s.slice(i, i + 300));
}
