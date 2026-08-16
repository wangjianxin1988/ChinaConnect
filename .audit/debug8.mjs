import fs from "node:fs";
const text = fs.readFileSync("src/i18n/translations.ts", "utf8");
const lines = text.split(/\r?\n/);
const blocks = [];
for (let i = 0; i < lines.length; i += 1) {
  const m = /^  (["']?)([a-zA-Z-]{2,10})\1: \{/.exec(lines[i]);
  if (m && ["en", "ja"].includes(m[2])) blocks.push({ lang: m[2], startLine: i });
}
function traceBlock(ls, label) {
  const stack = [];
  let bad = -1;
  for (let li = 0; li < ls.length; li += 1) {
    const trim = ls[li].trim();
    if (/^[A-Za-z0-9_]+\s*:\s*\{/.test(trim)) { stack.push(trim.split(":")[0].trim()); continue; }
    if (trim.startsWith("}")) {
      if (stack.length > 0) stack.pop();
      else { bad = li; break; }
      continue;
    }
  }
  console.log(label, "depth:", stack.length, "bad:", bad);
  if (bad !== -1) {
    ls.slice(Math.max(0, bad - 4), bad + 2).forEach((l, i) => console.log("   ", bad - 3 + i, JSON.stringify(l)));
  } else if (stack.length > 0) {
    console.log("   leftover:", stack.join(" > "));
    // find last push position
  }
}
for (let b = 0; b < blocks.length; b += 1) {
  const start = blocks[b].startLine;
  const end = b + 1 < blocks.length ? blocks[b + 1].startLine : lines.length;
  traceBlock(lines.slice(start, end - 1), blocks[b].lang);
}
