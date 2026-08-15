import fs from "node:fs";

// 1. AIChatPage: use aiT for auth-gate subtitle
const p1 = "src/components/AIChatPage.tsx";
let s1 = fs.readFileSync(p1, "utf8");
const oldTxt = `            <p className="text-gray-600 max-w-2xl mx-auto">
              Your personal China travel intelligence — itineraries, local insights, and real-time
              guidance.
            </p>`;
const newTxt = `            <p className="text-gray-600 max-w-2xl mx-auto">
              {aiT("heroSubtitle", "Your personal China travel intelligence — itineraries, local insights, and real-time guidance.")}
            </p>`;
if (s1.includes(oldTxt)) { s1 = s1.split(oldTxt).join(newTxt); console.log("auth gate subtitle OK"); }
else console.error("NOT FOUND: auth gate subtitle");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);

// 2. translations.ts: add heroSubtitle to ja aiPage block
const p2 = "src/i18n/translations.ts";
let s2 = fs.readFileSync(p2, "utf8");
const lines = s2.split("\n");
const jaStart = lines.findIndex(l => /^  ja: \{$/.test(l));
const koStart = lines.findIndex(l => /^  ko: \{$/.test(l));
let aiIdx = -1;
for (let i = jaStart; i < koStart; i++) {
  if (/^    aiPage: \{$/.test(lines[i])) { aiIdx = i; break; }
}
if (aiIdx > 0) {
  // insert heroSubtitle right after "aiPage: {"
  lines.splice(aiIdx + 1, 0, '      heroSubtitle: "中国旅行のパーソナルアシスタント — 旅程、現地情報、リアルタイムガイダンス。",');
  fs.writeFileSync(p2 + ".tmp", lines.join("\n"), "utf8");
  fs.renameSync(p2 + ".tmp", p2);
  console.log("ja aiPage.heroSubtitle added after line", aiIdx + 1);
} else console.error("NOT FOUND: ja aiPage");
