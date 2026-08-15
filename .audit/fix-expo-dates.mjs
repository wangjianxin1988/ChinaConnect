import fs from "node:fs";
const p = "src/components/Guide/ExpoCalendarClient.tsx";
let s = fs.readFileSync(p, "utf8");
const oldS1 = "Spring: April 15 – May 5, 2026";
const oldS2 = "Autumn: October 15 – November 4, 2026";
const newS1 = "{lang === \"ja\" ? \"春：2026年4月15日〜5月5日\" : \"Spring: April 15 – May 5, 2026\"}";
const newS2 = "{lang === \"ja\" ? \"秋：2026年10月15日〜11月4日\" : \"Autumn: October 15 – November 4, 2026\"}";
let n = 0;
if (s.includes(oldS1)) { s = s.split(oldS1).join(newS1); n++; }
if (s.includes(oldS2)) { s = s.split(oldS2).join(newS2); n++; }
fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("dates patched:", n);
