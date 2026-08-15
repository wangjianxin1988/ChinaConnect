const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /(\w*Cn)\.map\(\s*\((\w+)(?:\s*,\s*(\w+))?\)\s*=>/g;
  let m;
  const found = [];
  while ((m = re.exec(s))) found.push(m[1] + " -> var " + m[2]);
  if (found.length) console.log(f + ": " + found.join(" ; "));
}
