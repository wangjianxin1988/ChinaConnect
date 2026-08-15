import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 100))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/components/Guide/PriceTransparencyClient.tsx", [
  ['          <div>\n            <h2 className="font-semibold text-lg">Taxi Meter Tutorial</h2>\n            <p className="text-sm text-muted-foreground">出租车计价器教程</p>\n          </div>',
   '          <div>\n            <h2 className="font-semibold text-lg">{lang === "ja" ? "タクシーメーターの解説" : "Taxi Meter Tutorial"}</h2>\n            {lang !== "ja" && <p className="text-sm text-muted-foreground">出租车计价器教程</p>}\n          </div>'],
  ['              <h3 className="font-semibold mb-3">How Taxi Meters Work</h3>',
   '              <h3 className="font-semibold mb-3">{lang === "ja" ? "タクシーメーターの仕組み" : "How Taxi Meters Work"}</h3>'],
  ['                    <p className="font-medium">Base Fare (起步价)</p>\n                    <p className="text-muted-foreground">Usually ¥10-14 for first 3km</p>',
   '                    <p className="font-medium">{lang === "ja" ? "初乗り料金" : "Base Fare (起步价)"}</p>\n                    <p className="text-muted-foreground">{lang === "ja" ? "最初の3kmで通常¥10〜14" : "Usually ¥10-14 for first 3km"}</p>'],
  ['                    <p className="font-medium">Distance Rate (里程费)</p>\n                    <p className="text-muted-foreground">¥2-3 per km after base</p>',
   '                    <p className="font-medium">{lang === "ja" ? "距離料金" : "Distance Rate (里程费)"}</p>\n                    <p className="text-muted-foreground">{lang === "ja" ? "基本料金超過後、1kmあたり¥2〜3" : "¥2-3 per km after base"}</p>'],
  ['                    <p className="font-medium">Waiting Rate (等候费)</p>\n                    <p className="text-muted-foreground">¥2-3 per 5 minutes of waiting</p>',
   '                    <p className="font-medium">{lang === "ja" ? "待機料金" : "Waiting Rate (等候费)"}</p>\n                    <p className="text-muted-foreground">{lang === "ja" ? "待機5分ごとに¥2〜3" : "¥2-3 per 5 minutes of waiting"}</p>'],
  ['                    <p className="font-medium">Night Rate (夜间费)</p>\n                    <p className="text-muted-foreground">11PM-6AM: 10-20% higher</p>',
   '                    <p className="font-medium">{lang === "ja" ? "深夜料金" : "Night Rate (夜间费)"}</p>\n                    <p className="text-muted-foreground">{lang === "ja" ? "23時〜6時：10〜20%割増" : "11PM-6AM: 10-20% higher"}</p>'],
  ['              <h3 className="font-semibold mb-3">Sample Fares</h3>',
   '              <h3 className="font-semibold mb-3">{lang === "ja" ? "料金例" : "Sample Fares"}</h3>'],
  ['                  <span>3km (short trip)</span>', '                  <span>{lang === "ja" ? "3km（短距離）" : "3km (short trip)"}</span>'],
  ['                  <span>10km (city)</span>', '                  <span>{lang === "ja" ? "10km（市内）" : "10km (city)"}</span>'],
  ['                  <span>25km (suburb)</span>', '                  <span>{lang === "ja" ? "25km（郊外）" : "25km (suburb)"}</span>'],
  ['                  <span>Airport (50km)</span>', '                  <span>{lang === "ja" ? "空港（50km）" : "Airport (50km)"}</span>'],
]);
