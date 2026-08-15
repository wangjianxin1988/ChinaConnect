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
patch("src/components/Guide/VisaGuideClient.tsx", [
  // overview requirements data
  ['                    <h3 className="font-semibold">{req.country}</h3>', '                    <h3 className="font-semibold">{jaText(req.country, lang)}</h3>'],
  ['                      {req.visaType}\n                    </span>', '                      {jaText(req.visaType, lang)}\n                    </span>'],
  ['                      <p className="font-medium">{req.duration}</p>', '                      <p className="font-medium">{jaText(req.duration, lang)}</p>'],
  ['                      <p className="font-medium">{req.processingTime}</p>', '                      <p className="font-medium">{jaText(req.processingTime, lang)}</p>'],
  ['                      <p className="font-medium">{req.fee}</p>', '                      <p className="font-medium">{jaText(req.fee, lang)}</p>'],
  ['                          {note}\n                        </li>', '                          {jaText(note, lang)}\n                        </li>'],
  // requirements label
  ['                    <span className="text-sm text-muted-foreground">{tv.requirements || "Requirements:"}</span>', '                    <span className="text-sm text-muted-foreground">{lang === "ja" ? "要件：" : (tv.requirements || "Requirements:")}</span>'],
  // FAQ data
  ['                    <span className="font-medium text-left pr-4">{faq.question}</span>', '                    <span className="font-medium text-left pr-4">{lang === "ja" ? jaText(faq.qCn || "", lang) : faq.question}</span>'],
  ['                      <p className="text-foreground">{faq.answer}</p>', '                      <p className="text-foreground">{lang === "ja" ? jaText(faq.aCn || "", lang) : faq.answer}</p>'],
  // overstay warning paragraph
  ['                  Overstaying your visa can result in fines, detention, and future travel bans. If\n                  you need more time, apply for extension at the Public Security Bureau (PSB) before\n                  your visa expires. Current overstay fines are approximately 500 CNY per day.\n                </p>',
   '                  {lang === "ja" ? "ビザの超過滞在は罰金、拘束、今後の入国禁止につながる可能性があります。延長が必要な場合は、ビザの有効期限前に公安局（PSB）で延長申請をしてください。現在の超過滞在罰金は1日あたり約500元です。" : "Overstaying your visa can result in fines, detention, and future travel bans. If you need more time, apply for extension at the Public Security Bureau (PSB) before your visa expires. Current overstay fines are approximately 500 CNY per day."}\n                </p>'],
  // checklist headings + data
  ['                <span>📅</span> {tv.weeksBefore || "Weeks Before Travel (4-6 weeks)"}', '                <span>📅</span> {lang === "ja" ? "渡航の4〜6週間前" : (tv.weeksBefore || "Weeks Before Travel (4-6 weeks)")}'],
  ['                {tv.weeksBeforeDesc || "Complete these 4-6 weeks before departure"}', '                {lang === "ja" ? "出発の4〜6週間前に完了してください" : (tv.weeksBeforeDesc || "Complete these 4-6 weeks before departure")}'],
  ['                <span>⏰</span> Days Before Travel (2-3 days)', '                <span>⏰</span> {lang === "ja" ? "渡航の2〜3日前" : "Days Before Travel (2-3 days)"}'],
  ['                <span>🔌</span> What to Bring - Electronics', '                <span>🔌</span> {lang === "ja" ? "持参品 - 電化製品" : "What to Bring - Electronics"}'],
  ['                <span>🎒</span> What to Bring - Essentials', '                <span>🎒</span> {lang === "ja" ? "持参品 - 必須アイテム" : "What to Bring - Essentials"}'],
  ['                      <h3 className="font-medium">{item.item}</h3>\n                      <p className="text-sm text-muted-foreground">{item.note}</p>', '                      <h3 className="font-medium">{jaText(item.item, lang)}</h3>\n                      <p className="text-sm text-muted-foreground">{jaText(item.note, lang)}</p>'],
  ['                    <h3 className="font-medium">{item.item}</h3>\n                  </div>', '                    <h3 className="font-medium">{jaText(item.item, lang)}</h3>\n                  </div>'],
  ['              Progress: {checkedItems.size}/', '              {lang === "ja" ? "進捗：" : "Progress: "}{checkedItems.size}/'],
  ['              items checked\n            </p>', '              {lang === "ja" ? "件チェック済み" : "items checked"}\n            </p>'],
]);
