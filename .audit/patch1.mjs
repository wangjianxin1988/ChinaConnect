import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 80))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/pages/[lang]/guide/payment.astro", [
  ['      <EmbeddedAppRecommendation\n        client:visible\n        categories={["payment"]}\n        title="Payment Apps You Need"',
   '      <EmbeddedAppRecommendation\n        client:visible\n        lang={lang}\n        categories={["payment"]}\n        title={lang === "ja" ? "おすすめ決済アプリ" : "Payment Apps You Need"}'],
  ['        subtitle="Download and set up these apps before arriving in China"',
   '        subtitle={lang === "ja" ? "中国に到着する前にダウンロードして設定しておきましょう" : "Download and set up these apps before arriving in China"}'],
]);
patch("src/pages/[lang]/guide/communication.astro", [
  ['      <EmbeddedAppRecommendation\n        client:visible\n        categories={["social", "connectivity"]}\n        title="Stay Connected in China"\n        subtitle="Essential messaging and connectivity apps"',
   '      <EmbeddedAppRecommendation\n        client:visible\n        lang={lang}\n        categories={["social", "connectivity"]}\n        title={lang === "ja" ? "中国でつながり続ける" : "Stay Connected in China"}\n        subtitle={lang === "ja" ? "必須のメッセージ・通信アプリ" : "Essential messaging and connectivity apps"}'],
]);
patch("src/pages/[lang]/guide/transport.astro", [
  ['      <EmbeddedAppRecommendation\n        client:visible\n        categories={["transport", "maps"]}\n        title="Transport & Navigation Apps"\n        subtitle="Essential apps for getting around China"',
   '      <EmbeddedAppRecommendation\n        client:visible\n        lang={lang}\n        categories={["transport", "maps"]}\n        title={lang === "ja" ? "交通・ナビゲーションアプリ" : "Transport & Navigation Apps"}\n        subtitle={lang === "ja" ? "中国国内の移動に必須のアプリ" : "Essential apps for getting around China"}'],
]);
patch("src/pages/[lang]/scenic-spots/index.astro", [
  ['<EmbeddedAppRecommendation client:idle categories={["travel", "maps", "transport"]} title={t.scenicSpots?.appTitle ?? "Plan Your Scenic Spot Visit"} subtitle={t.scenicSpots?.appSubtitle ?? "Apps for finding and navigating scenic spots in China"} />',
   '<EmbeddedAppRecommendation client:idle lang={lang} categories={["travel", "maps", "transport"]} title={t.scenicSpots?.appTitle ?? "Plan Your Scenic Spot Visit"} subtitle={t.scenicSpots?.appSubtitle ?? "Apps for finding and navigating scenic spots in China"} />'],
]);
