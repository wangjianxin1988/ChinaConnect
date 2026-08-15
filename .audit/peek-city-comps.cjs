const fs = require("fs"), path = require("path");
const dir = "src/components/city";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const s = fs.readFileSync(path.join(dir, f), "utf8");
  const lines = s.split("\n");
  const hits = [];
  lines.forEach((l, i) => {
    if (/[\u4e00-\u9fff]/.test(l) && (l.includes(">") || l.includes("=")) && !l.trim().startsWith("//") && !l.includes("import") && !l.includes("labelZh") && !l.includes("nameZh") && !l.includes("descriptionZh")) {
      const t = l.trim();
      if (t.length < 130 && t.length > 4) hits.push((i + 1) + ": " + t);
    }
  });
  if (hits.length) console.log("=== " + f + " ===\n" + hits.slice(0, 12).join("\n"));
}
