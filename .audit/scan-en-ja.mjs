import fs from "node:fs";
import path from "node:path";
const DIR = "src/data/cities-i18n/ja";
const enStrings = new Map();
const walk = (obj, section) => {
  if (typeof obj === "string") {
    const t = obj.trim();
    if (t.length >= 4 && /^[A-Za-z][A-Za-z0-9\s,.'’()\-/:%&$+#°0-9]*$/.test(t) && !/\d{4}/.test(t) && !t.includes("http") && !/^[A-Za-z]+\.(com|net|org|cn)$/.test(t)) {
      enStrings.set(t, (enStrings.get(t) || 0) + 1);
    }
  } else if (Array.isArray(obj)) { obj.forEach((v) => walk(v, section)); }
  else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) walk(v, k);
  }
};
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  walk(data, "");
}
const sorted = [...enStrings.entries()].sort((a, b) => b[1] - a[1]);
console.log("unique English strings:", sorted.length);
sorted.slice(0, 50).forEach(([s, n]) => console.log("  (" + n + ") " + s.slice(0, 90)));
