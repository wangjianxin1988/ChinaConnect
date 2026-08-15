const fs = require("fs");
for (const f of ["src/pages/[lang]/city/[slug]/attractions.astro", "src/pages/[lang]/city/[slug].astro", "src/pages/[lang]/city/[slug]/food.astro"]) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  console.log("=== " + f.split("/").pop() + " ===");
  lines.forEach((l, i) => {
    if (/[\u4e00-\u9fff]/.test(l) && (l.includes(">") || l.includes("=")) && !l.trim().startsWith("//") && !l.includes("import")) {
      const t = l.trim();
      if (t.length < 130 && t.length > 4 && !t.includes("data-i18n=")) console.log((i + 1) + ": " + t);
    }
  });
}
