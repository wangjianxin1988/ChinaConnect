import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
// ko block 8630..12910 (0-based 8629..12909)
const koLines = lines.slice(8629, 12910);
const stack = [];
let mismatch = -1;
for (let idx = 0; idx < koLines.length; idx += 1) {
  const trim = koLines[idx].trim();
  if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
  if (trim.startsWith("}")) {
    // closing brace: could close object or value-last-line like `},`
    if (stack.length > 0) stack.pop();
    else { mismatch = idx; break; }
    continue;
  }
}
console.log("stack end depth:", stack.length, "mismatch at ko-relative line:", mismatch === -1 ? "none" : mismatch + 8630);
if (mismatch !== -1) {
  console.log("around mismatch:", koLines.slice(Math.max(0, mismatch - 3), mismatch + 3).map((l, i) => `${mismatch - 2 + i + 8630}: ${JSON.stringify(l)}`).join("\n"));
} else {
  console.log("stack tail:", stack.slice(-10).join(" > "));
}
