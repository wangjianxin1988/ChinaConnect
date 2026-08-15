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
patch("src/components/Guide/CommunicationGuideClient.tsx", [
  // SIM placeholder
  ['                  <h3 className="text-xl font-semibold mb-2">Select a SIM Option</h3>',
   '                  <h3 className="text-xl font-semibold mb-2">{lang === "ja" ? "SIMオプションを選択" : "Select a SIM Option"}</h3>'],
  ['                  <p className="text-muted-foreground">\n                    Click on an option to see detailed information\n                  </p>',
   '                  <p className="text-muted-foreground">\n                    {lang === "ja" ? "オプションをクリックすると詳細情報が表示されます" : "Click on an option to see detailed information"}\n                  </p>'],
  // APN settings
  ['              <h3 className="font-semibold text-lg">APN Settings by Carrier</h3>',
   '              <h3 className="font-semibold text-lg">{lang === "ja" ? "通信事業者別APN設定" : "APN Settings by Carrier"}</h3>'],
  ['                  <h4 className="font-medium">{apn.carrier}</h4>',
   '                  <h4 className="font-medium">{lang === "ja" ? CARRIER_JA[apn.carrier] || apn.carrier : apn.carrier}</h4>'],
  ['                      <span className="text-muted-foreground">APN:</span>', '                      <span className="text-muted-foreground">APN:</span>'],
  ['                      <span className="text-muted-foreground">MMSC:</span>', '                      <span className="text-muted-foreground">MMSC:</span>'],
  ['                      <span className="text-muted-foreground">Proxy:</span>', '                      <span className="text-muted-foreground">{lang === "ja" ? "プロキシ：" : "Proxy:"}</span>'],
  ['                      <span className="text-muted-foreground">Notes:</span>', '                      <span className="text-muted-foreground">{lang === "ja" ? "メモ：" : "Notes:"}</span>'],
  ['                      <p className="text-muted-foreground">{apn.notes}</p>', '                      <p className="text-muted-foreground">{lang === "ja" ? jaText(apn.notes, lang) : apn.notes}</p>'],
  // add CARRIER_JA map
  ['const SIM_TYPE_JA: Record<string, string> = {', 'const CARRIER_JA: Record<string, string> = {\n  "China Mobile (中国移动)": "中国移動",\n  "China Unicom (中国联通)": "中国聯通",\n  "China Telecom (中国电信)": "中国電信",\n};\n\nconst SIM_TYPE_JA: Record<string, string> = {'],
  // Pros/Cons headings + items
  ['                        <h4 className="font-medium mb-2">✅ Pros</h4>', '                        <h4 className="font-medium mb-2">{lang === "ja" ? "✅ メリット" : "✅ Pros"}</h4>'],
  ['                        <h4 className="font-medium mb-2">⚠️ Cons</h4>', '                        <h4 className="font-medium mb-2">{lang === "ja" ? "⚠️ デメリット" : "⚠️ Cons"}</h4>'],
  ['                            <li key={i} className="text-sm">\n                              {pro}\n                            </li>', '                            <li key={i} className="text-sm">\n                              {jaText(pro, lang)}\n                            </li>'],
  ['                            <li key={i} className="text-sm">\n                              {con}\n                            </li>', '                            <li key={i} className="text-sm">\n                              {jaText(con, lang)}\n                            </li>'],
  // whereToBuy
  ['                            <span>{loc}</span>', '                            <span>{jaText(loc, lang)}</span>'],
  // VPN warning
  ['              <span>⚠️</span> Important VPN Warning\n            </h3>', '              <span>⚠️</span> {lang === "ja" ? "重要なVPN警告" : "Important VPN Warning"}\n            </h3>'],
  ['              Download and set up your VPN BEFORE arriving in China. Most VPN websites are blocked\n              domestically, and app stores may not have your preferred VPN. Install and test before\n              departure.', '              {lang === "ja" ? "中国に到着する前にVPNをダウンロードして設定してください。国内では多くのVPNサイトがブロックされており、アプリストアに希望のVPNがない場合もあります。出発前にインストールしてテストしておきましょう。" : "Download and set up your VPN BEFORE arriving in China. Most VPN websites are blocked domestically, and app stores may not have your preferred VPN. Install and test before departure."}'],
  // VPN option fields
  ['                    <h3 className="font-semibold">{vpn.name}</h3>', '                    <h3 className="font-semibold">{vpn.name}</h3>'],
  ['                    <p className="text-sm text-muted-foreground">{vpn.cost}</p>', '                    <p className="text-sm text-muted-foreground">{jaText(vpn.cost, lang)}</p>'],
  ['                      {vpn.reliability} reliability', '                      {lang === "ja" ? RELIABILITY_JA[vpn.reliability] || vpn.reliability : vpn.reliability + " reliability"}'],
  ['                    <span className="text-xs text-muted-foreground">{vpn.speed} speed</span>', '                    <span className="text-xs text-muted-foreground">{lang === "ja" ? SPEED_JA[vpn.speed] || vpn.speed : vpn.speed + " speed"}</span>'],
  ['                    <h4 className="font-medium text-sm">Features:</h4>', '                    <h4 className="font-medium text-sm">{lang === "ja" ? "機能：" : "Features:"}</h4>'],
  ['                          {f}\n                        </span>', '                          {jaText(f, lang)}\n                        </span>'],
  ['                    Setup difficulty: {vpn.setupDifficulty}', '                    {lang === "ja" ? "セットアップ難易度：" + (DIFFICULTY_JA[vpn.setupDifficulty] || vpn.setupDifficulty) : "Setup difficulty: " + vpn.setupDifficulty}'],
  // add maps
  ['const CARRIER_JA: Record<string, string> = {', 'const RELIABILITY_JA: Record<string, string> = { high: "高信頼性", medium: "中程度", low: "低" };\nconst SPEED_JA: Record<string, string> = { fast: "高速", medium: "中程度", slow: "低速" };\nconst DIFFICULTY_JA: Record<string, string> = { easy: "簡単", medium: "中程度", hard: "難しい" };\n\nconst CARRIER_JA: Record<string, string> = {'],
  // Download Before Arrival
  ['              <span>📱</span> Download Before Arrival\n            </h3>', '              <span>📱</span> {lang === "ja" ? "到着前にダウンロード" : "Download Before Arrival"}\n            </h3>'],
  ['              Google Play is blocked in China. Download these apps before arrival or use alternative\n              app stores like Apple App Store, Huawei AppGallery, or directly from app websites.', '              {lang === "ja" ? "中国ではGoogle Playがブロックされています。到着前にこれらのアプリをダウンロードするか、Apple App Store、Huawei AppGalleryなどの代替ストア、またはアプリ公式サイトからダウンロードしてください。" : "Google Play is blocked in China. Download these apps before arrival or use alternative app stores like Apple App Store, Huawei AppGallery, or directly from app websites."}'],
  // Essential apps
  ['                        Essential\n                      </span>', '                        {ct(lang, "badge_essential", "Essential")}\n                      </span>'],
  ['                <p className="text-sm">{app.purpose}</p>', '                <p className="text-sm">{jaText(app.purpose, lang)}</p>'],
  ['                <div className="text-xs text-muted-foreground mt-2">Download: {app.download}</div>', '                <div className="text-xs text-muted-foreground mt-2">{lang === "ja" ? "ダウンロード：" : "Download: "}{jaText(app.download, lang)}</div>'],
  // Setup guide
  ['                  <h3 className="font-semibold text-lg">{step.title}</h3>', '                  <h3 className="font-semibold text-lg">{lang === "ja" ? jaText(step.titleCn, lang) : step.title}</h3>'],
  ['                <p className="text-foreground mb-4">{step.description}</p>', '                <p className="text-foreground mb-4">{lang === "ja" ? jaText(step.descriptionCn, lang) : step.description}</p>'],
  ['                  <h4 className="font-medium mb-2">Action Items:</h4>', '                  <h4 className="font-medium mb-2">{lang === "ja" ? "アクション項目：" : "Action Items:"}</h4>'],
  ['              <h3 className="font-semibold text-lg">Useful Phrases</h3>', '              <h3 className="font-semibold text-lg">{lang === "ja" ? "便利なフレーズ" : "Useful Phrases"}</h3>'],
]);
