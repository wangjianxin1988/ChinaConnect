import fs from "node:fs";
const dir = "src/pages/[lang]/guide";
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + f.name;
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".astro")) {
      const s = fs.readFileSync(p, "utf8");
      const lines = s.split(/\r?\n/);
      for (const l of lines) {
        if (l.includes("pageTitle =") || l.includes("title=") || l.includes("description=")) {
          console.log(p.split("/").pop(), "|", l.trim().slice(0, 150));
        }
      }
    }
  }
}
walk(dir);
