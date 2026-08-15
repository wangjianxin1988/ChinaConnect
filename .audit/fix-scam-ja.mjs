import fs from "node:fs";

const p = "src/components/Guide/ScamPreventionClient.tsx";
let s = fs.readFileSync(p, "utf8");
let n = 0;
function rep(oldStr, newStr, label) {
  if (s.includes(oldStr)) { s = s.split(oldStr).join(newStr); n++; console.log("OK:", label); }
  else console.error("MISS:", label);
}

// JA severity map after imports
rep(
  'import { jaText, Bi } from "./guide-i18n";',
  'import { jaText, Bi } from "./guide-i18n";\n\nconst JA_SEV: Record<string, string> = { high: "高リスク", medium: "中リスク", low: "低リスク" };',
  "JA_SEV map"
);

// filter label
rep(
  '<span className="text-sm font-medium mr-2">Filter by severity:</span>',
  '<span className="text-sm font-medium mr-2">{lang === "ja" ? "深刻度で絞り込み：" : "Filter by severity:"}</span>',
  "filter label"
);

// severity buttons
rep(
  '{severity === "all" ? "All" : SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS]}',
  '{severity === "all" ? (lang === "ja" ? "すべて" : "All") : (lang === "ja" ? JA_SEV[severity] : SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS])}',
  "severity buttons"
);

// Common Scams heading
rep(
  '<h2 className="text-lg font-semibold">Common Scams</h2>',
  '<h2 className="text-lg font-semibold">{lang === "ja" ? "よくある詐欺" : "Common Scams"}</h2>',
  "Common Scams"
);

// list severity badge
rep(
  "                    {scam.severity.toUpperCase()}",
  "                    {lang === \"ja\" ? JA_SEV[scam.severity] : scam.severity.toUpperCase()}",
  "list severity badge"
);

// detail severity label
rep(
  "                      {SEVERITY_LABELS[currentScam.severity]}",
  "                      {lang === \"ja\" ? JA_SEV[currentScam.severity] : SEVERITY_LABELS[currentScam.severity]}",
  "detail severity label"
);

// examples Cn -> jaText
rep(
  "                        {currentScam.examplesCn[idx]}",
  "                        {jaText(currentScam.examplesCn[idx], lang)}",
  "examplesCn jaText"
);

// section: Warning Signs
rep(
  '<span className="font-semibold">Warning Signs</span>\n                    <span className="text-muted-foreground">/ 警示特征</span>',
  '<span className="font-semibold">{lang === "ja" ? "警告サイン" : "Warning Signs"}</span>\n                    {lang !== "ja" && <span className="text-muted-foreground">/ 警示特征</span>}',
  "Warning Signs"
);
// section: Prevention
rep(
  '<span className="font-semibold">Prevention</span>\n                    <span className="text-muted-foreground">/ 预防方法</span>',
  '<span className="font-semibold">{lang === "ja" ? "予防方法" : "Prevention"}</span>\n                    {lang !== "ja" && <span className="text-muted-foreground">/ 预防方法</span>}',
  "Prevention"
);
// section: What To Do
rep(
  '<span className="font-semibold">What To Do</span>\n                    <span className="text-muted-foreground">/ 应对方法</span>',
  '<span className="font-semibold">{lang === "ja" ? "対処方法" : "What To Do"}</span>\n                    {lang !== "ja" && <span className="text-muted-foreground">/ 应对方法</span>}',
  "What To Do"
);

// empty state
rep(
  '<h3 className="text-xl font-semibold mb-2">Select a Scam Type</h3>',
  '<h3 className="text-xl font-semibold mb-2">{lang === "ja" ? "詐欺の種類を選択" : "Select a Scam Type"}</h3>',
  "Select a Scam Type"
);
rep(
  "                Choose a scam from the list to see detailed information",
  "                {lang === \"ja\" ? \"リストから詐欺を選択すると詳細情報が表示されます\" : \"Choose a scam from the list to see detailed information\"}",
  "Choose a scam"
);

fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("total patched:", n);
