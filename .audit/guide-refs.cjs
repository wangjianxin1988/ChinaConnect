const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
const refs = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const m = s.match(/from "(@\/data[^"]+)"/g) || [];
  for (const r of m) {
    const clean = r.replace(/^from "/, "").replace(/"$/, "");
    (refs[clean] ||= []).push(f);
  }
}
for (const [k, v] of Object.entries(refs)) console.log(k + "  <-  " + v.join(", "));
