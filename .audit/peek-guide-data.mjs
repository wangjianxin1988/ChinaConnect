import fs from "node:fs";
for (const f of ["visa", "accommodation", "dining", "communication"]) {
  const s = fs.readFileSync("src/data/guide/" + f + ".ts", "utf8");
  console.log("=====" + f + "=====");
  console.log(s.slice(0, 400).replace(/\n/g, " | ").slice(0, 400));
}
