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
patch("src/components/Guide/ExpoCalendarClient.tsx", [
  ['            <h2 className="text-2xl font-bold mb-2">China Expo Calendar 2026</h2>',
   '            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "中国見本市カレンダー2026" : "China Expo Calendar 2026"}</h2>'],
  ['              Plan your business trips around China&apos;s most important trade shows and\n              exhibitions. From the Canton Fair to industry-specific events across major cities.\n            </p>',
   '              {lang === "ja" ? "中国の最も重要な見本市や展示会に合わせて出張を計画しましょう。広州交易会から主要都市の業界別イベントまで。" : "Plan your business trips around China&apos;s most important trade shows and exhibitions. From the Canton Fair to industry-specific events across major cities."}\n            </p>'],
  ['          Showing {filteredExpos.length} event{filteredExpos.length !== 1 ? "s" : ""}\n        </p>',
   '          {lang === "ja" ? `全${filteredExpos.length}件のイベントを表示中` : `Showing ${filteredExpos.length} event${filteredExpos.length !== 1 ? "s" : ""}`}\n        </p>'],
  ['            <p className="text-muted-foreground">No events found for the selected filters.</p>\n            <p className="text-muted-foreground text-sm">请尝试其他筛选条件</p>',
   '            <p className="text-muted-foreground">{lang === "ja" ? "選択したフィルターに一致するイベントがありません。" : "No events found for the selected filters."}</p>\n            {lang !== "ja" && <p className="text-muted-foreground text-sm">请尝试其他筛选条件</p>}'],
  ['                    <span>📍 {expo.city}</span>\n                    <span>🏢 {expo.venue}</span>\n                    <span>🔁 {expo.frequency}</span>',
   '                    <span>📍 {jaText(expo.city, lang)}</span>\n                    <span>🏢 {jaText(expo.venue, lang)}</span>\n                    <span>🔁 {jaText(expo.frequency, lang)}</span>'],
  ['                          <span className="font-medium">{expo.city}</span>', '                          <span className="font-medium">{jaText(expo.city, lang)}</span>'],
  ['                          <span className="font-medium">{expo.frequency}</span>', '                          <span className="font-medium">{jaText(expo.frequency, lang)}</span>'],
  ['                          <span className="font-medium">{expo.venue}</span>', '                          <span className="font-medium">{jaText(expo.venue, lang)}</span>'],
]);
