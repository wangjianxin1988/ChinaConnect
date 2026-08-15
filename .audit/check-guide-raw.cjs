const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  // find raw Cn field renders not wrapped in jaText
  const re = /\{[a-zA-Z0-9_.\[\]]*[Cc]n[^}]*\}/g;
  let m, bad = [];
  while ((m = re.exec(s))) {
    const full = m[0];
    const before = s.slice(Math.max(0, m.index - 30), m.index);
    if (!before.includes("jaText(") && !full.includes("labelCn") ) bad.push(full);
  }
  if (bad.length) console.log(f + ": " + [...new Set(bad)].join(" | "));
}
