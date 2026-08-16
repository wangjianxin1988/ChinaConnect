const fs = require("fs");
const path = require("path");
const base = "src/data/cities-i18n/de";
let mismatch = 0;
for (const fn of fs.readdirSync(base).filter(f => f.endsWith(".json"))) {
  const fp = path.join(base, fn);
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  const ours = JSON.stringify(data, null, 2);
  const onDisk = fs.readFileSync(fp, "utf8").replace(/\r\n/g, "\n").replace(/\n$/, "");
  if (ours !== onDisk) {
    mismatch++;
    if (mismatch <= 3) {
      console.log("MISMATCH", fn);
      // find first differing line
      const a = ours.split("\n"); const b = onDisk.split("\n");
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { console.log("  line", i, "| node:", JSON.stringify(a[i]), "| disk:", JSON.stringify(b[i])); break; }
      }
    }
  }
}
console.log("mismatch files:", mismatch, "/", fs.readdirSync(base).filter(f => f.endsWith(".json")).length);
