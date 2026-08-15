import fs from "node:fs";
const s = fs.readFileSync("src/pages/[lang]/guide/index.astro", "utf8");
const i = s.indexOf("];", s.indexOf("const guides = ["));
console.log(s.slice(i + 3, i + 4200));
