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
patch("src/components/Guide/TransportGuideClient.tsx", [
  // key renames to existing translation keys
  ['tg.selectModePrompt || "Select a Transport Mode"', 'tg.selectMode || "Select a Transport Mode"'],
  ['tg.howToUseLabel || "How to Use:"', 'tg.howToUse || "How to Use:"'],
  ['tg.proTipsLabel || "Pro Tips:"', 'tg.proTips || "Pro Tips:"'],
  ['tg.bookingPlatformsHeading || "Booking Platforms"', 'tg.bookingPlatforms || "Booking Platforms"'],
  ['tg.tripcomLabel || "Trip.com / Ctrip"', 'tg.tripCta || "Trip.com / Ctrip"'],
  ['tg.usefulPhrasesHeading || "Useful Transport Phrases"', 'tg.usefulPhrases || "Useful Transport Phrases"'],
  // headings
  ['              <span>💡</span> Pro Tips\n            </h3>', '              <span>💡</span> {lang === "ja" ? "プロのヒント" : "Pro Tips"}\n            </h3>'],
  ['                      <span>📖</span> How to Use\n                      </h3>', '                      <span>📖</span> {lang === "ja" ? "使い方" : "How to Use"}\n                      </h3>'],
  ['                      <span>💡</span> Pro Tips\n                      </h3>', '                      <span>💡</span> {lang === "ja" ? "プロのヒント" : "Pro Tips"}\n                      </h3>'],
  ['              <span>🚨</span> Emergency Transport Numbers\n            </h3>', '              <span>🚨</span> {lang === "ja" ? "緊急時の交通連絡先" : "Emergency Transport Numbers"}\n            </h3>'],
  ['                <span className="font-medium">Police:</span>\n                <span>110</span>', '                <span className="font-medium">{lang === "ja" ? "警察：" : "Police:"}</span>\n                <span>110</span>'],
  ['                <span className="font-medium">Ambulance:</span>\n                <span>120</span>', '                <span className="font-medium">{lang === "ja" ? "救急車：" : "Ambulance:"}</span>\n                <span>120</span>'],
  ['                <span className="font-medium">Fire:</span>\n                <span>119</span>', '                <span className="font-medium">{lang === "ja" ? "消防：" : "Fire:"}</span>\n                <span>119</span>'],
  // platform descriptions
  ['                  Official train booking (English version available)\n                </p>', '                  {lang === "ja" ? "公式の列車予約（英語版あり）" : "Official train booking (English version available)"}\n                </p>'],
  ['                  All transport types with English interface\n                </p>', '                  {lang === "ja" ? "英語インターフェースで全交通手段を予約可能" : "All transport types with English interface"}\n                </p>'],
  ['                  Ride-hailing for local transport and airport trips\n                </p>', '                  {lang === "ja" ? "市内交通と空港送迎のライドシェア" : "Ride-hailing for local transport and airport trips"}\n                </p>'],
  // placeholder hint
  ['                    Click on a transport option to see detailed guide\n                  </p>', '                    {lang === "ja" ? "交通手段をクリックすると詳細ガイドが表示されます" : "Click on a transport option to see detailed guide"}\n                  </p>'],
]);
