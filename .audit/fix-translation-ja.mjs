import fs from "node:fs";

// 1. ja-overrides for translation page
const p1 = "src/data/guide/ja-overrides.ts";
let s1 = fs.readFileSync(p1, "utf8");
const ADD = {
  "Japanese ↔ Chinese": "日本語 ↔ 中国語",
  "Korean ↔ Chinese": "韓国語 ↔ 中国語",
  "French ↔ Chinese": "フランス語 ↔ 中国語",
  "German ↔ Chinese": "ドイツ語 ↔ 中国語",
  "Spanish ↔ Chinese": "スペイン語 ↔ 中国語",
  "Arabic ↔ Chinese": "アラビア語 ↔ 中国語",
  "Day rate covers 8 hours of interpreting": "日当には8時間の通訳が含まれます",
  "Overtime charged at CNY 200–500/hour": "時間外は1時間あたりCNY 200〜500",
  "Transportation and accommodation for off-site events": "遠方イベントの交通費・宿泊費",
  "Industry-specific vocabulary preparation": "業界特有の用語準備",
  "Requires booth, headsets, and equipment": "ブース、ヘッドセット、機材が必要",
  "Two interpreters per language pair (shifts every 20 min)": "言語ペアごとに通訳2名（20分ごとに交代）",
  "Equipment rental: CNY 3,000–8,000/day": "機材レンタル：1日CNY 3,000〜8,000",
  "Technical operator required": "技術オペレーターが必要",
  "Official stamp from an accredited translation agency": "公認翻訳機関の公印",
  "Apostille service for international use": "国際利用のためのアポスティーユサービス",
  "Accepted by Chinese embassies and government offices": "中国大使館・政府機関で受理",
  "CNY 1,500–4,000/day": "CNY 1,500〜4,000/日",
  "CNY 6,000–15,000/day/interpreter": "CNY 6,000〜15,000/日/通訳者",
  "CNY 500–2,000/document": "CNY 500〜2,000/書類",
};
let block = "";
for (const [k, v] of Object.entries(ADD)) block += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
s1 = s1.replace(/\n\};[\s]*$/, "\n" + block + "};");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);
console.log("translation overrides added:", Object.keys(ADD).length);

// 2. TranslationServiceClient: fix language pair rendering
const p2 = "src/components/Guide/TranslationServiceClient.tsx";
let s2 = fs.readFileSync(p2, "utf8");
const oldLangs = "                {currentService.languages.map((lang) => (\n                  <span\n                    key={lang}\n                    className=\"bg-violet-100 text-violet-700 px-2 py-1 rounded text-sm font-medium\"\n                  >\n                    {lang}\n                  </span>\n                ))}";
const newLangs = "                {currentService.languages.map((pair) => (\n                  <span\n                    key={pair}\n                    className=\"bg-violet-100 text-violet-700 px-2 py-1 rounded text-sm font-medium\"\n                  >\n                    {lang === \"ja\" ? jaText(pair, lang) : pair}\n                  </span>\n                ))}";
if (s2.includes(oldLangs)) { s2 = s2.split(oldLangs).join(newLangs); console.log("languages fixed"); }
else console.error("NOT FOUND: languages block");
fs.writeFileSync(p2 + ".tmp", s2);
fs.renameSync(p2 + ".tmp", p2);
