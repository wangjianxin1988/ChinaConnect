import fs from "node:fs";
const f = "scripts/fix-translations-en-residue.mjs";
let t = fs.readFileSync(f, "utf8");
t = t.replace("const enV = en.get(k);", "const enV = en.get(k)?.value;");
t = t.replace("const jaV = ja.get(k);", "const jaV = ja.get(k)?.value;");
fs.writeFileSync(f, t, "utf8");
console.log("patched");
