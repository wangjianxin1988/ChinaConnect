import fs from "node:fs";

// 1. timeline jaText in client
const p1 = "src/components/Guide/CompanyRegistrationClient.tsx";
let s1 = fs.readFileSync(p1, "utf8");
const oldT = "                    {timeline.min} – {timeline.max}";
const newT = "                    {jaText(timeline.min, lang)} – {jaText(timeline.max, lang)}";
if (s1.includes(oldT)) { s1 = s1.split(oldT).join(newT); console.log("timeline jaText OK"); }
else console.error("NOT FOUND: timeline");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);

// 2. ja overrides for timeline + costs
const p2 = "src/data/guide/ja-overrides.ts";
let s2 = fs.readFileSync(p2, "utf8");
const add = [
  ["2 months", "2か月"],
  ["3 months", "3か月"],
  ["1 month", "1か月"],
  ["2 weeks", "2週間"],
  ["RMB 10,000–50,000 (agent + government fees)", "RMB 1万〜5万（エージェント料＋政府手数料）"],
  ["RMB 5,000–20,000 (agent + government fees)", "RMB 5,000〜20,000（エージェント料＋政府手数料）"],
  ["RMB 3,000–10,000 (advisor + filing fees)", "RMB 3,000〜10,000（アドバイザー料＋申請手数料）"],
  ["RMB 0–500 (government fees vary by city)", "RMB 0〜500（政府手数料は都市により異なります）"],
].filter(([k]) => !s2.includes(JSON.stringify(k).slice(1, -1)));
let block = "";
for (const [k, v] of add) block += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
if (block) {
  s2 = s2.replace(/\n\};[\s]*$/, "\n" + block + "};");
  fs.writeFileSync(p2 + ".tmp", s2);
  fs.renameSync(p2 + ".tmp", p2);
}
console.log("overrides added:", add.length);
