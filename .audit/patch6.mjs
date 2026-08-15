import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 110))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/components/Guide/PaymentGuideClient.tsx", [
  // tg key renames
  ['tg.taxMinPurchase || "Minimum purchase: 500 CNY at participating stores"', 'tg.taxTip2 || "Minimum purchase: 500 CNY at participating stores"'],
  ['tg.taxRefundRate || "Refund rate: 3-11% depending on item category"', 'tg.taxTip3 || "Refund rate: 3-11% depending on item category"'],
  ['tg.taxProcessTip || "Process at airport departure hall before security"', 'tg.taxTip1 || "Process at airport departure hall before security"'],
  ['tg.taxInvoiceTip || "Keep invoice with tax refund mark"', 'tg.taxTip4 || "Keep invoice with tax refund mark"'],
  ['tg.bestATMsHeading || "Best ATMs for International Cards"', 'tg.atmHeading || "Best ATMs for International Cards"'],
  ['tg.faqHeading || "Frequently Asked Questions"', 'tg.faqsHeading || "Frequently Asked Questions"'],
  ['tg.atmRate1 || "ATMs at airports and banks have best exchange rates"', 'tg.atmTip1 || "ATMs at airports and banks have best exchange rates"'],
  ['tg.atmRate2 || "Check with your bank about international withdrawal fees"', 'tg.atmTip2 || "Check with your bank about international withdrawal fees"'],
  ['tg.atmRate3 || "Some ATMs limit foreign card withdrawals (max 2000 CNY)"', 'tg.atmTip3 || "Some ATMs limit foreign card withdrawals (max 2000 CNY)"'],
  ['tg.atmRate4 || "Use card machines inside banks for better security"', 'tg.atmTip4 || "Use card machines inside banks for better security"'],
  // Pros / Cons / Pro Tips headings
  ['                      <span>✅</span> Pros\n                    </h4>', '                      <span>✅</span> {lang === "ja" ? "メリット" : "Pros"}\n                    </h4>'],
  ['                      <span>⚠️</span> Cons\n                    </h4>', '                      <span>⚠️</span> {lang === "ja" ? "デメリット" : "Cons"}\n                    </h4>'],
  ['                    <span>💡</span> Pro Tips\n                  </h4>', '                    <span>💡</span> {lang === "ja" ? "プロのヒント" : "Pro Tips"}\n                  </h4>'],
  // pros/cons/tips items -> jaText
  ['                          <span>{pro}</span>', '                          <span>{jaText(pro, lang)}</span>'],
  ['                          <span>{con}</span>', '                          <span>{jaText(con, lang)}</span>'],
  ['                        <span>{tip}</span>', '                        <span>{jaText(tip, lang)}</span>'],
  // security warning paragraph
  ['                <p className="text-sm text-muted-foreground mt-1">\n                  Never share your payment passwords, verification codes, or personal information\n                  with strangers. Bank staff and merchants will never ask for your passwords. Report\n                  suspicious activity immediately.\n                </p>',
   '                <p className="text-sm text-muted-foreground mt-1">\n                  {lang === "ja" ? "支払いパスワード、認証コード、個人情報を他人と共有しないでください。銀行員や店員がパスワードを尋ねることは絶対にありません。不審な活動があればすぐに報告してください。" : "Never share your payment passwords, verification codes, or personal information with strangers. Bank staff and merchants will never ask for your passwords. Report suspicious activity immediately."}\n                </p>'],
  // shopping tips
  ['                  <h3 className="font-semibold">{tip.category}</h3>', '                  <h3 className="font-semibold">{jaText(tip.category, lang)}</h3>'],
  ['                <p className="text-sm text-foreground">{tip.tip}</p>', '                <p className="text-sm text-foreground">{jaText(tip.tip, lang)}</p>'],
  ['                      <span className="font-medium text-amber-700">Warning:</span> {tip.warning}', '                      <span className="font-medium text-amber-700">{lang === "ja" ? "警告：" : "Warning:"}</span> {jaText(tip.warning, lang)}'],
  // VAT section
  ['              <span>💰</span> VAT Tax Refund (增值税退税)\n            </h3>', '              <span>💰</span> {lang === "ja" ? "VAT税還付（付加価値税還付）" : "VAT Tax Refund (增值税退税)"}\n            </h3>'],
  // ATM sub heading
  ['              <p className="text-sm text-muted-foreground">\n                Look for these bank ATMs for best service\n              </p>', '              <p className="text-sm text-muted-foreground">\n                {lang === "ja" ? "サービスが良い銀行ATMを探しましょう" : "Look for these bank ATMs for best service"}\n              </p>'],
  // ATM data
  ['                    <h3 className="font-semibold">{atm.bank}</h3>', '                    <h3 className="font-semibold">{jaText(atm.bank, lang)}</h3>'],
  ['                    <p className="text-sm text-muted-foreground">{atm.notes}</p>', '                    <p className="text-sm text-muted-foreground">{jaText(atm.notes, lang)}</p>'],
  // FAQ data
  ['                    <span className="font-medium text-left pr-4">{faq.question}</span>', '                    <span className="font-medium text-left pr-4">{jaText(faq.question, lang)}</span>'],
  ['                      <p className="text-foreground">{faq.answer}</p>', '                      <p className="text-foreground">{jaText(faq.answer, lang)}</p>'],
]);
