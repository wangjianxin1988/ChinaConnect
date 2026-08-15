const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const p = path.join(dir, f);
  const s = fs.readFileSync(p, "utf8");
  const lines = s.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('from "./guide-i18n"') && i > 60) {
      console.log(p + ":" + (i + 1) + " suspicious import");
    }
  }
}
