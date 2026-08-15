import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 120))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/components/Guide/EmergencyGuideClient.tsx", [
  ['                      <div className="font-medium">{emergency.type}</div>', '                      <div className="font-medium">{jaText(emergency.type, lang)}</div>'],
  ['                      {emergency.severity}\n                    </span>', '                      {lang === "ja" ? SEVERITY_JA[emergency.severity] || emergency.severity : emergency.severity}\n                    </span>'],
  ['                        <h2 className="text-2xl font-bold">{currentEmergency.type}</h2>', '                        <h2 className="text-2xl font-bold">{jaText(currentEmergency.type, lang)}</h2>'],
  ['                          {currentEmergency.severity} severity\n                        </span>', '                          {lang === "ja" ? (SEVERITY_JA[currentEmergency.severity] || currentEmergency.severity) + "（重大度）" : currentEmergency.severity + " severity"}\n                        </span>'],
  ['                  <h3 className="text-xl font-semibold mb-2">Select an Emergency Type</h3>', '                  <h3 className="text-xl font-semibold mb-2">{lang === "ja" ? "緊急事態の種類を選択" : "Select an Emergency Type"}</h3>'],
  ['                    Click on an emergency type to see detailed guidance\n                  </p>', '                    {lang === "ja" ? "緊急事態の種類をクリックすると詳細なガイダンスが表示されます" : "Click on an emergency type to see detailed guidance"}\n                  </p>'],
  ['              <span>📝</span> Important Note\n            </h3>', '              <span>📝</span> {lang === "ja" ? "重要な注意" : "Important Note"}\n            </h3>'],
  ['              Save your embassy&apos;s emergency number before travel. Most embassies have 24/7\n              emergency lines for citizens abroad. In serious emergencies (lost passport, detention,\n              hospitalization), contact your embassy immediately.\n            </p>',
   '              {lang === "ja" ? "旅行前に大使館の緊急連絡先を保存しておきましょう。多くの大使館は在外国民向けの24時間緊急回線を設置しています。重大な緊急時（パスポート紛失、拘留、入院）はすぐに大使館へ連絡してください。" : "Save your embassy&apos;s emergency number before travel. Most embassies have 24/7 emergency lines for citizens abroad. In serious emergencies (lost passport, detention, hospitalization), contact your embassy immediately."}\n            </p>'],
  ['              <h2 className="font-semibold text-xl">Essential Emergency Phrases</h2>', '              <h2 className="font-semibold text-xl">{lang === "ja" ? "緊急時に役立つフレーズ" : "Essential Emergency Phrases"}</h2>'],
  ['              <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>', '              <h3 className="font-semibold text-lg">{lang === "ja" ? "よくある質問" : "Frequently Asked Questions"}</h3>'],
  ['                    <span className="font-medium text-left pr-4">{faq.question}</span>', '                    <span className="font-medium text-left pr-4">{lang === "ja" ? jaText(faq.qCn || "", lang) : faq.question}</span>'],
  ['                      <p className="text-foreground">{faq.answer}</p>', '                      <p className="text-foreground">{lang === "ja" ? jaText(faq.aCn || "", lang) : faq.answer}</p>'],
  ['              <span>🛡️</span> General Prevention Tips\n            </h3>', '              <span>🛡️</span> {lang === "ja" ? "一般的な予防のヒント" : "General Prevention Tips"}\n            </h3>'],
  ['                <span>Keep digital copies of all important documents in cloud storage</span>', '                <span>{lang === "ja" ? "重要な書類はすべてクラウドにデジタルコピーを保存" : "Keep digital copies of all important documents in cloud storage"}</span>'],
  ['                <span>Share your travel itinerary with family/friends back home</span>', '                <span>{lang === "ja" ? "旅行日程を家族や友人と共有" : "Share your travel itinerary with family/friends back home"}</span>'],
]);
// add SEVERITY_JA map
let s = fs.readFileSync("src/components/Guide/EmergencyGuideClient.tsx", "utf8");
const anchor = 'export function EmergencyGuideClient';
if (!s.includes(anchor)) { console.error("anchor missing"); process.exit(1); }
s = s.replace(anchor, 'const SEVERITY_JA: Record<string, string> = { critical: "重大", high: "高", medium: "中", low: "低" };\n\n' + anchor);
fs.writeFileSync("src/components/Guide/EmergencyGuideClient.tsx", s, "utf8");
console.log("SEVERITY_JA added");
