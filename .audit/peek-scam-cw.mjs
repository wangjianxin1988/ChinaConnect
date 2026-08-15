import fs from "node:fs";
for (const f of ["src/components/Guide/ScamPreventionClient.tsx", "src/components/Guide/CulturalWarningsClient.tsx"]) {
  const s = fs.readFileSync(f, "utf8");
  console.log("=====" + f + "=====");
  console.log(s.slice(0, 2600).replace(/\n/g, "\n"));
}
