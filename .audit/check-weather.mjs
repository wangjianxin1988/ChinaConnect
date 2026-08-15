import fs from "node:fs";
const src = fs.readFileSync("src/i18n/translations.ts", "utf8");
// ja cityPage block keys
let m = src.match(/ja: \{[\s\S]*?cityPage: \{/);
if (m) {
  const start = m.index + m[0].length - "cityPage: {".length;
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } } }
  const keys = [...src.slice(start, end + 1).matchAll(/^\s{6}(\w+):/gm)].map((x) => x[1]);
  console.log("ja cityPage weather keys:", keys.filter((k) => /weather/i.test(k)).join(", "));
  console.log("has weatherHumidity:", keys.includes("weatherHumidity"));
}
// ja weather block
m = src.match(/ja: \{[\s\S]*?\n\s{4}weather: \{/);
if (m) {
  const start = m.index + m[0].length - "weather: {".length;
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } } }
  console.log("ja weather block:", src.slice(start, end + 1).replace(/\s+/g, " ").slice(0, 400));
}
