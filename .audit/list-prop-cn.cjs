const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /\{(\w+)\.cn\}/g;
  let m, out = [];
  while ((m = re.exec(s))) out.push(m[0]);
  if (out.length) console.log(f + ": " + out.join(" "));
}
