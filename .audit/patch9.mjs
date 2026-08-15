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
patch("src/components/Guide/EtiquetteClient.tsx", [
  ['            <h2 className="text-2xl font-bold mb-2">Business Etiquette Essentials</h2>',
   '            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "中国ビジネスマナーの基本" : "Business Etiquette Essentials"}</h2>'],
  ['              Master the unwritten rules of Chinese business culture. First impressions matter —\n              knowing these norms will help you earn respect and build lasting relationships.\n            </p>',
   '              {lang === "ja" ? "中国のビジネス文化における暗黙のルールをマスターしましょう。第一印象が重要です — これらの規範を知っていれば、信頼を得て長期的な関係を築くことができます。" : "Master the unwritten rules of Chinese business culture. First impressions matter — knowing these norms will help you earn respect and build lasting relationships."}\n            </p>'],
  ['            <p className="text-slate-400 text-xs mt-1">提前5-10分钟到达。迟到损害声誉。</p>',
   '            {lang !== "ja" && <p className="text-slate-400 text-xs mt-1">提前5-10分钟到达。迟到损害声誉。</p>}'],
]);
