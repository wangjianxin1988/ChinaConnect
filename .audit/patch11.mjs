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
patch("src/components/Guide/TranslationServiceClient.tsx", [
  ['            <h2 className="text-2xl font-bold mb-2">Translation Services in China</h2>',
   '            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "中国の翻訳・通訳サービス" : "Translation Services in China"}</h2>'],
  ['              Book professional interpreters and translators for your business visits. From\n              consecutive interpreting at dinners to certified document translation for visas.\n            </p>',
   '              {lang === "ja" ? "出張時にプロの通訳者・翻訳者を手配できます。夕食会での逐次通訳から、ビザ用の公認文書翻訳まで対応。" : "Book professional interpreters and translators for your business visits. From consecutive interpreting at dinners to certified document translation for visas."}\n            </p>'],
  ['              <h4 className="font-semibold mb-2">⏱️ Delivery</h4>', '              <h4 className="font-semibold mb-2">⏱️ {lang === "ja" ? "納期" : "Delivery"}</h4>'],
  ['              <p className="text-sm text-foreground">{currentService.delivery}</p>', '              <p className="text-sm text-foreground">{lang === "ja" ? jaText(currentService.delivery, lang) : currentService.delivery}</p>'],
  ['          <h4 className="font-semibold mb-3">✅ What&apos;s Included</h4>', '          <h4 className="font-semibold mb-3">✅ {lang === "ja" ? "含まれる内容" : "What&apos;s Included"}</h4>'],
  ['                <th className="text-left p-3 border">Service</th>', '                <th className="text-left p-3 border">{lang === "ja" ? "サービス" : "Service"}</th>'],
  ['                  <td className="p-3 border font-medium text-violet-700">{svc.priceRange}</td>', '                  <td className="p-3 border font-medium text-violet-700">{jaText(svc.priceRange, lang)}</td>'],
  ['                  <td className="p-3 border text-muted-foreground">{svc.delivery}</td>', '                  <td className="p-3 border text-muted-foreground">{jaText(svc.delivery, lang)}</td>'],
  ['              <div className="text-2xl font-bold text-violet-700 mt-1">\n                {currentService.priceRange}\n              </div>', '              <div className="text-2xl font-bold text-violet-700 mt-1">\n                {jaText(currentService.priceRange, lang)}\n              </div>'],
  ['          <li>\n            • Book consecutive interpreters at least <strong>3–5 days in advance</strong>\n          </li>', '          {lang !== "ja" && <li>\n            • Book consecutive interpreters at least <strong>3–5 days in advance</strong>\n          </li>}'],
  ['          <li>\n            • Book simultaneous interpreters at least <strong>1–2 weeks in advance</strong>{" "}\n            (equipment prep required)\n          </li>', '          {lang !== "ja" && <li>\n            • Book simultaneous interpreters at least <strong>1–2 weeks in advance</strong>{" "}\n            (equipment prep required)\n          </li>}'],
  ['          <li>\n            • For certified legal translation, <strong>add 3–5 days</strong> for notarization if\n            needed\n          </li>', '          {lang !== "ja" && <li>\n            • For certified legal translation, <strong>add 3–5 days</strong> for notarization if\n            needed\n          </li>}'],
  ['          <li>• Always request a CV or portfolio before confirming an interpreter</li>', '          {lang !== "ja" && <li>• Always request a CV or portfolio before confirming an interpreter</li>}'],
  ['          <li>• Confirm if transportation and accommodation are included in the quote</li>', '          {lang !== "ja" && <li>• Confirm if transportation and accommodation are included in the quote</li>}'],
]);
let s = fs.readFileSync("src/components/Guide/TranslationServiceClient.tsx", "utf8");
const anchor = '        <ul className="space-y-2 text-sm text-violet-800">';
if (!s.includes(anchor)) { console.error("anchor not found"); process.exit(1); }
const jaTips = `        <ul className="space-y-2 text-sm text-violet-800">
          {lang === "ja" && (<>
            <li>• 逐次通訳は少なくとも<strong>3〜5日前</strong>までに予約</li>
            <li>• 同時通訳は少なくとも<strong>1〜2週間前</strong>までに予約（機材準備が必要）</li>
            <li>• 公認法務翻訳の場合、認証に<strong>3〜5日</strong>追加</li>
            <li>• 通訳者確定前に履歴書や実績ポートフォリオを必ず確認</li>
            <li>• 交通費・宿泊費が見積もりに含まれるか確認</li>
          </>)}`;
s = s.replace(anchor, jaTips);
fs.writeFileSync("src/components/Guide/TranslationServiceClient.tsx", s, "utf8");
console.log("ja tips added");
