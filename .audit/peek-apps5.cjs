const fs = require("fs");
for (const f of ["src/components/apps/EmbeddedAppRecommendation.tsx", "src/components/apps/InlineAppPills.tsx"]) {
  const s = fs.readFileSync(f, "utf8");
  console.log("=== " + f + " ===");
  const lines = s.split("\n");
  lines.forEach((l, i) => {
    if (/[\u4e00-\u9fff]/.test(l) && !l.trim().startsWith("//") && !l.includes("import") && !l.includes("nameZh") && !l.includes("labelZh")) {
      const t = l.trim();
      if (t.length < 120 && t.length > 3) console.log((i + 1) + ": " + t);
    }
  });
}
