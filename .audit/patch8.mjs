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
patch("src/components/Guide/CompanyRegistrationClient.tsx", [
  ['            <h2 className="text-2xl font-bold mb-2">Company Registration Guide</h2>',
   '            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "会社登録ガイド" : "Company Registration Guide"}</h2>'],
  ['              Step-by-step guide to registering a business entity in China as a foreign investor.\n              Choose the structure that best fits your business needs.\n            </p>',
   '              {lang === "ja" ? "外国人投資家として中国でビジネス法人を登録するためのステップバイステップガイド。ビジネスニーズに最適な会社形態を選択してください。" : "Step-by-step guide to registering a business entity in China as a foreign investor. Choose the structure that best fits your business needs."}\n            </p>'],
  ['                    <h3 className="font-bold text-lg">{info.type}</h3>',
   '                    <h3 className="font-bold text-lg">{lang === "ja" ? jaText(info.typeCn, lang) : info.type}</h3>'],
  ['                  <div className="text-muted-foreground">Timeline</div>',
   '                  <div className="text-muted-foreground">{lang === "ja" ? "期間" : "Timeline"}</div>'],
  ['        <h3 className="text-xl font-bold mb-2">{currentInfo.type}</h3>',
   '        <h3 className="text-xl font-bold mb-2">{lang === "ja" ? jaText(currentInfo.typeCn, lang) : currentInfo.type}</h3>'],
  ['        <p className="text-foreground">{currentInfo.summary}</p>',
   '        {lang !== "ja" && <p className="text-foreground">{currentInfo.summary}</p>}'],
  ['                          <span className="bg-slate-100 px-2 py-0.5 rounded">\n                            ⏱ {step.duration}\n                          </span>',
   '                          {lang !== "ja" && <span className="bg-slate-100 px-2 py-0.5 rounded">\n                            ⏱ {step.duration}\n                          </span>}'],
  ['                          {step.cost && (\n                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">\n                              💰 {step.cost}\n                            </span>\n                          )}',
   '                          {step.cost && (\n                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">\n                              💰 {lang === "ja" ? jaText(step.cost, lang) : step.cost}\n                            </span>\n                          )}'],
  ['                          <h5 className="font-semibold mb-2 text-sm">\n                            📄 Required Documents / 所需材料\n                          </h5>',
   '                          <h5 className="font-semibold mb-2 text-sm">\n                            📄 {lang === "ja" ? "必要書類" : "Required Documents / 所需材料"}\n                          </h5>'],
  ['                                <p className="text-sm font-medium">{doc.en}</p>',
   '                                {lang !== "ja" && <p className="text-sm font-medium">{doc.en}</p>}'],
  ['                          <h5 className="font-semibold mb-2 text-sm">💡 Pro Tips / 专业提示</h5>',
   '                          <h5 className="font-semibold mb-2 text-sm">💡 {lang === "ja" ? "プロのヒント" : "Pro Tips / 专业提示"}</h5>'],
  ['                            {step.tips.map((tip, idx) => (\n                              <li\n                                key={idx}\n                                className="flex items-start gap-2 text-sm text-foreground"\n                              >\n                                <span className="text-green-500 mt-0.5">✓</span>\n                                <span>{tip.en}</span>\n                              </li>\n                            ))}',
   '                            {lang !== "ja" && step.tips.map((tip, idx) => (\n                              <li\n                                key={idx}\n                                className="flex items-start gap-2 text-sm text-foreground"\n                              >\n                                <span className="text-green-500 mt-0.5">✓</span>\n                                <span>{tip.en}</span>\n                              </li>\n                            ))}'],
  ['                <p className="text-slate-200">{point.en}</p>',
   '                {lang !== "ja" && <p className="text-slate-200">{point.en}</p>}'],
  ['        <h4 className="font-semibold text-amber-900 mb-2">⚠️ Disclaimer</h4>',
   '        <h4 className="font-semibold text-amber-900 mb-2">⚠️ {lang === "ja" ? "免責事項" : "Disclaimer"}</h4>'],
  ['        <p className="text-sm text-amber-800">\n          This guide is for informational purposes only. Registration requirements change frequently\n          and vary by city, industry, and nationality. Always consult a licensed Chinese corporate\n          service provider or lawyer before starting the registration process.\n        </p>',
   '        {lang !== "ja" && <p className="text-sm text-amber-800">\n          This guide is for informational purposes only. Registration requirements change frequently\n          and vary by city, industry, and nationality. Always consult a licensed Chinese corporate\n          service provider or lawyer before starting the registration process.\n        </p>}'],
  ['        <p className="text-xs text-amber-600 mt-2">\n          本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。\n        </p>',
   '        <p className="text-xs text-amber-600 mt-2">\n          {jaText("本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。", lang)}\n        </p>'],
]);
