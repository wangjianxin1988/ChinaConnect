import fs from "node:fs";
const d = JSON.parse(fs.readFileSync(".audit/ja-js-scan.json", "utf8"));
const keys = Object.keys(d);
const food = keys.filter((k) => k.includes("food"));
// inspect structure of one entry
console.log("sample entry keys:", Object.keys(d[food[0]]));
console.log(JSON.stringify(d[food[0]]).slice(0, 800));
