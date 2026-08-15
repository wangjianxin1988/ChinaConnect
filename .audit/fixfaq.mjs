import fs from "node:fs";
function patch(path, pairs) {
  let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) { console.error("MISSING in " + path + ": " + JSON.stringify(a.slice(0, 80))); process.exitCode = 1; return; }
    s = s.split(a).join(b);
  }
  const tmp = path + ".tmp";
  fs.writeFileSync(tmp, s);
  fs.renameSync(tmp, path);
  console.log("patched", path);
}
patch("src/components/Guide/EmergencyGuideClient.tsx", [
  ['jaText(faq.qCn || "", lang)', 'jaText(faq.question, lang)'],
  ['jaText(faq.aCn || "", lang)', 'jaText(faq.answer, lang)'],
]);
patch("src/components/Guide/VisaGuideClient.tsx", [
  ['jaText(faq.qCn || "", lang)', 'jaText(faq.question, lang)'],
  ['jaText(faq.aCn || "", lang)', 'jaText(faq.answer, lang)'],
]);
console.log("done");
