const fs = require("fs");
for (const f of ["src/components/city/CityTierBadge.tsx", "src/components/city/CityTierFilter.tsx"]) {
  const s = fs.readFileSync(f, "utf8");
  console.log("=== " + f + " ===");
  console.log(s.slice(0, 1500));
  console.log();
}
