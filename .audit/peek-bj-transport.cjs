const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log("transport keys:", Object.keys(d.transport || {}));
const tr = d.transport;
for (const [k, v] of Object.entries(tr)) {
  if (typeof v === "string") console.log("  " + k + ": " + v.slice(0, 60));
}
console.log("apps:", JSON.stringify(d.apps || d.appRecommendations || "none").slice(0, 300));
