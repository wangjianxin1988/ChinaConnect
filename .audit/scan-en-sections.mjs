import fs from "node:fs";
import path from "node:path";
const DIR = "src/data/cities-i18n/ja";
const sections = {};
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const walk = (obj, section) => {
    if (typeof obj === "string") {
      const t = obj.trim();
      if (t.length >= 4 && /^[A-Za-z][A-Za-z0-9\s,.'’()\-/:%&$+#°]*$/.test(t) && !/^\d/.test(t) && !t.includes("http")) {
        sections[section] = (sections[section] || 0) + 1;
      }
    } else if (Array.isArray(obj)) { obj.forEach((v) => walk(v, section)); }
    else if (obj && typeof obj === "object") { for (const [k, v] of Object.entries(obj)) walk(v, k); }
  };
  walk(data, "");
}
const sorted = Object.entries(sections).sort((a, b) => b[1] - a[1]);
console.log("English strings by top-level section:");
sorted.slice(0, 25).forEach(([k, n]) => console.log("  " + k + ": " + n));
