import fs from "node:fs";

// 1. translations.ts: add midRange/highEnd to ja diningGuide (only ja block)
const p1 = "src/i18n/translations.ts";
let s1 = fs.readFileSync(p1, "utf8");
const lines = s1.split("\n");
// find ja block boundaries
const jaStart = lines.findIndex(l => /^  ja: \{$/.test(l));
const koStart = lines.findIndex(l => /^  ko: \{$/.test(l));
// find casual line within ja block (first occurrence after jaStart)
let casualIdx = -1;
for (let i = jaStart; i < koStart; i++) {
  if (lines[i].includes('casual: "カジュアルレストラン"')) { casualIdx = i; break; }
}
if (casualIdx > 0) {
  lines.splice(casualIdx + 1, 0, '      midRange: "ミドルレンジ",', '      highEnd: "高級店",');
  fs.writeFileSync(p1 + ".tmp", lines.join("\n"), "utf8");
  fs.renameSync(p1 + ".tmp", p1);
  console.log("ja diningGuide midRange/highEnd inserted after line", casualIdx + 1);
} else {
  console.error("NOT FOUND: ja casual line");
}

// 2. DiningGuideClient: use tg keys
const p2 = "src/components/Guide/DiningGuideClient.tsx";
let s2 = fs.readFileSync(p2, "utf8");
const old1 = '<div className="text-sm text-muted-foreground">Mid-range</div>';
const new1 = '<div className="text-sm text-muted-foreground">{tg.midRange || "Mid-range"}</div>';
const old2 = '<div className="text-sm text-muted-foreground">High-end</div>';
const new2 = '<div className="text-sm text-muted-foreground">{tg.highEnd || "High-end"}</div>';
let n = 0;
if (s2.includes(old1)) { s2 = s2.split(old1).join(new1); n++; }
if (s2.includes(old2)) { s2 = s2.split(old2).join(new2); n++; }
fs.writeFileSync(p2 + ".tmp", s2);
fs.renameSync(p2 + ".tmp", p2);
console.log("DiningGuideClient patched:", n);
