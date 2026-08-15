import fs from "node:fs";
const dir = "src/pages/[lang]/guide";
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + f.name;
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".astro")) {
      const s = fs.readFileSync(p, "utf8");
      const line = s.split(/\r?\n/).find((l) => l.includes("title={"));
      if (line) console.log(p, "=>", line.trim().slice(0, 140));
    }
  }
}
walk(dir);
