const fs = require("fs");
const raw = fs.readFileSync("src/data/guide/ja-overrides.ts", "utf8");
const d = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
console.log("dict entries:", Object.keys(d).length);
const files = ["src/data/guide/accommodation.ts","src/data/guide/communication.ts","src/data/guide/departure.ts","src/data/guide/dining.ts","src/data/guide/emergency.ts","src/data/guide/payment.ts","src/data/guide/transport.ts","src/data/guide/visa.ts","src/data/cultural-warnings.ts","src/data/price-transparency.ts","src/data/scam-prevention.ts","src/data/guide/business/company-registration.ts","src/data/guide/business/etiquette.ts","src/data/guide/business/expo-calendar.ts","src/data/guide/business/invitation-letter.ts","src/data/guide/business/translation.ts"];
const missing = [];
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const re = /(\w*Cn)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|\[)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[2] !== undefined) {
      if (!d[m[2]]) missing.push({ f: f.split("/").pop(), t: m[2] });
    } else {
      const rest = s.slice(m.index + m[0].length);
      const arrRe = /"((?:[^"\\]|\\.)*)"/g;
      let am;
      let inArr = true;
      while (inArr && (am = arrRe.exec(rest))) {
        if (!d[am[1]]) missing.push({ f: f.split("/").pop(), t: am[1] });
        const after = rest.slice(arrRe.lastIndex);
        const nextBracket = after.indexOf("]");
        const nextComma = after.indexOf(",");
        inArr = !(nextBracket !== -1 && (nextComma === -1 || nextBracket < nextComma));
      }
    }
  }
}
console.log("missing dict entries:", missing.length);
missing.slice(0, 80).forEach((x) => console.log("  [" + x.f + "] " + x.t.slice(0, 70)));
