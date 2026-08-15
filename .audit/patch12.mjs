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
patch("src/components/Guide/DepartureGuideClient.tsx", [
  // timing + details in steps
  ['                        {step.timing}\n                      </span>\n                      <span className="text-xs text-muted-foreground">{jaText(step.timingCn, lang)}</span>',
   '                        {lang === "ja" ? jaText(step.timingCn, lang) : step.timing}\n                      </span>\n                      {lang !== "ja" && <span className="text-xs text-muted-foreground">{jaText(step.timingCn, lang)}</span>}'],
  ['                      {step.details.map((detail, i) => (\n                        <li key={i} className="flex items-start gap-2 text-sm">\n                          <span className="text-blue-500">{i + 1}.</span>\n                          <span>{detail}</span>\n                        </li>\n                      ))}',
   '                      {step.details.map((detail, i) => (\n                        <li key={i} className="flex items-start gap-2 text-sm">\n                          <span className="text-blue-500">{i + 1}.</span>\n                          <span>{lang === "ja" ? jaText(step.detailsCn[i] || "", lang) : detail}</span>\n                        </li>\n                      ))}'],
  // Important Reminders
  ['              <span>⏰</span> Important Reminders\n            </h3>', '              <span>⏰</span> {lang === "ja" ? "重要な注意事項" : "Important Reminders"}\n            </h3>'],
  ['                <span>International flights: arrive at airport 3 hours before departure</span>', '                <span>{lang === "ja" ? "国際線：出発の3時間前に空港到着" : "International flights: arrive at airport 3 hours before departure"}</span>'],
  ['                  Check passport validity - must be valid for 6+ months beyond travel dates\n                </span>', '                  {lang === "ja" ? "パスポート有効期限を確認 - 渡航期間終了後6ヶ月以上の残存が必要" : "Check passport validity - must be valid for 6+ months beyond travel dates"}\n                </span>'],
  ['                <span>Verify visa exit dates - overstay fines are approximately 500 CNY/day</span>', '                <span>{lang === "ja" ? "ビザの出国期限を確認 - 超過滞在の罰金は1日あたり約500元" : "Verify visa exit dates - overstay fines are approximately 500 CNY/day"}</span>'],
  ['                <span>Keep boarding pass and receipts for expense tracking</span>', '                <span>{lang === "ja" ? "経費管理のため搭乗券と領収書を保管" : "Keep boarding pass and receipts for expense tracking"}</span>'],
  // Tax refund rates
  ['              <span>💰</span> Tax Refund Rates\n            </h3>', '              <span>💰</span> {lang === "ja" ? "税還付率" : "Tax Refund Rates"}\n            </h3>'],
  ['                <h4 className="font-medium">General Goods</h4>', '                <h4 className="font-medium">{lang === "ja" ? "一般商品" : "General Goods"}</h4>'],
  ['                <h4 className="font-medium">Luxury Items</h4>', '                <h4 className="font-medium">{lang === "ja" ? "高級品" : "Luxury Items"}</h4>'],
  ['                <h4 className="font-medium">Minimum Purchase</h4>', '                <h4 className="font-medium">{lang === "ja" ? "最低購入額" : "Minimum Purchase"}</h4>'],
  ['              Refund rate depends on item category. Luxury goods, cosmetics, and electronics\n              typically have higher rates.\n            </p>',
   '              {lang === "ja" ? "還付率は商品カテゴリーによって異なります。高級品、化粧品、電化製品は一般的に還付率が高くなります。" : "Refund rate depends on item category. Luxury goods, cosmetics, and electronics typically have higher rates."}\n            </p>'],
  // Airport info
  ['                  <h3 className="font-semibold text-lg">{airport.city}</h3>', '                  <h3 className="font-semibold text-lg">{jaText(airport.city, lang)}</h3>'],
  ['                      <p className="text-sm text-muted-foreground">{airport.airport}</p>', '                      <p className="text-sm text-muted-foreground">{jaText(airport.airport, lang)}</p>'],
  ['                    <span className="text-sm text-muted-foreground">\n                      Distance from city center:\n                    </span>', '                    <span className="text-sm text-muted-foreground">\n                      {lang === "ja" ? "市内中心部からの距離：" : "Distance from city center:"}\n                    </span>'],
  ['                    <p className="font-medium">{airport.distance}</p>', '                    <p className="font-medium">{jaText(airport.distance, lang)}</p>'],
  ['                          <span>{t}</span>', '                          <span>{jaText(t, lang)}</span>'],
  // Duty free
  ['              <h3 className="font-semibold text-lg">Duty-Free Shopping Tips</h3>', '              <h3 className="font-semibold text-lg">{lang === "ja" ? "免税店ショッピングのヒント" : "Duty-Free Shopping Tips"}</h3>'],
  ['                    <h4 className="font-medium">{item.category}</h4>', '                    <h4 className="font-medium">{jaText(item.category, lang)}</h4>'],
  ['                  <p className="text-sm text-foreground">{item.tip}</p>', '                  <p className="text-sm text-foreground">{lang === "ja" ? jaText(item.tipCn, lang) : item.tip}</p>'],
  ['                  <p className="text-sm text-muted-foreground mt-2 italic">{item.note}</p>', '                  <p className="text-sm text-muted-foreground mt-2 italic">{lang === "ja" ? jaText(item.noteCn, lang) : item.note}</p>'],
  // Checklist
  ['                    <h4 className="font-medium">{item.item}</h4>\n                    <p className="text-sm text-muted-foreground">{item.note}</p>', '                    <h4 className="font-medium">{jaText(item.item, lang)}</h4>\n                    <p className="text-sm text-muted-foreground">{jaText(item.note, lang)}</p>'],
]);
