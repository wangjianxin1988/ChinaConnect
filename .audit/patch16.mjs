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
patch("src/components/Guide/AccommodationGuideClient.tsx", [
  ['                    <h3 className="font-semibold text-lg">{hotel.type}</h3>\n                    <p className="text-primary font-medium">{hotel.priceRange}</p>',
   '                    <h3 className="font-semibold text-lg">{lang === "ja" ? jaText(hotel.type, lang) : hotel.type}</h3>\n                    <p className="text-primary font-medium">{jaText(hotel.priceRange, lang)}</p>'],
  ['                    <h4 className="font-medium text-sm mb-2">Features:</h4>', '                    <h4 className="font-medium text-sm mb-2">{lang === "ja" ? "設備：" : "Features:"}</h4>'],
  ['                    <h4 className="font-medium text-sm mb-2">Best For:</h4>', '                    <h4 className="font-medium text-sm mb-2">{lang === "ja" ? "こんな人におすすめ：" : "Best For:"}</h4>'],
  ['                          {r}\n                        </span>', '                          {jaText(r, lang)}\n                        </span>'],
  ['              <h3 className="font-semibold text-lg">Recommended Booking Platforms</h3>', '              <h3 className="font-semibold text-lg">{lang === "ja" ? "おすすめの予約プラットフォーム" : "Recommended Booking Platforms"}</h3>'],
  ['                <h4 className="font-medium">Trip.com (Ctrip International)</h4>\n                <p className="text-sm text-muted-foreground">\n                  Best English interface, reliable customer service, wide selection\n                </p>',
   '                <h4 className="font-medium">Trip.com (Ctrip International)</h4>\n                <p className="text-sm text-muted-foreground">\n                  {lang === "ja" ? "英語インターフェースが最良、信頼できるカスタマーサービス、豊富な選択肢" : "Best English interface, reliable customer service, wide selection"}\n                </p>'],
  ['                <h4 className="font-medium">Booking.com</h4>\n                <p className="text-sm text-muted-foreground">\n                  Good international support, often has best price guarantees\n                </p>',
   '                <h4 className="font-medium">Booking.com</h4>\n                <p className="text-sm text-muted-foreground">\n                  {lang === "ja" ? "国際的なサポートが充実、価格保証も充実" : "Good international support, often has best price guarantees"}\n                </p>'],
  ['                <h4 className="font-medium">Hotels.com</h4>\n                <p className="text-sm text-muted-foreground">\n                  Rewards program good for frequent travelers\n                </p>',
   '                <h4 className="font-medium">Hotels.com</h4>\n                <p className="text-sm text-muted-foreground">\n                  {lang === "ja" ? "頻繁に旅行する人に嬉しいリワードプログラム" : "Rewards program good for frequent travelers"}\n                </p>'],
  ['                <h4 className="font-medium">Agoda</h4>\n                <p className="text-sm text-muted-foreground">\n                  Often has lowest prices for Asian destinations\n                </p>',
   '                <h4 className="font-medium">Agoda</h4>\n                <p className="text-sm text-muted-foreground">\n                  {lang === "ja" ? "アジアの目的地で最安値が多い" : "Often has lowest prices for Asian destinations"}\n                </p>'],
]);
