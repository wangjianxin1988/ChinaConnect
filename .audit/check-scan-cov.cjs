const fs = require("fs");
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const keys = Object.keys(d);
const routes = ["/guide", "/guide/accommodation", "/guide/attractions", "/guide/business", "/guide/business/company-registration", "/guide/business/etiquette", "/guide/business/expo-calendar", "/guide/business/invitation-letter", "/guide/business/translation", "/guide/communication", "/guide/cultural-warnings", "/guide/departure", "/guide/dining", "/guide/emergency-procedures", "/guide/payment", "/guide/scam-prevention", "/guide/transparency", "/guide/transport", "/guide/visa", "/blog", "/ai", "/scenic-spots", "/cities"];
for (const r of routes) {
  const k = "/ja" + r + (r === "/guide" || r === "/blog" || r === "/cities" ? "/" : "");
  const hit = keys.find((x) => x === k || x === "/ja" + r);
  console.log((hit ? "scanned " : "MISSING  ") + r + (hit ? "  -> " + hit : ""));
}
