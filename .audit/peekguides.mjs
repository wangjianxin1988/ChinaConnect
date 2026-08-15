import fs from "node:fs";
const s = fs.readFileSync("src/pages/[lang]/guide/index.astro", "utf8");
const i = s.indexOf("const guides = [");
const j = s.indexOf("];", i);
console.log(s.slice(i, j + 3));
