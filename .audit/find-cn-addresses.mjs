import fs from "node:fs";
const dir = "src/data/cities-i18n/ja";
const targets = ["静安区乌鲁木齐中路12号", "浦东新区世纪大道8号西塘商场", "浦东新区世纪大道8号西塘商场20階", "渝中区友谊路1号", "晋安区东大路68号"];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));
  const hits = [];
  (function walk(obj, path) {
    if (Array.isArray(obj)) { obj.forEach((v, i) => walk(v, path + "[" + i + "]")); return; }
    if (obj && typeof obj === "object") { for (const k of Object.keys(obj)) walk(obj[k], path ? path + "." + k : k); return; }
    if (typeof obj === "string" && targets.some((t) => obj.includes(t))) hits.push(path + " = " + obj);
  })(data, "");
  if (hits.length) console.log("=== " + f); hits.forEach((h) => console.log("  " + h));
}
