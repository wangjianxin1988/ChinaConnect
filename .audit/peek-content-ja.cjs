const fs = require("fs");
const tr = JSON.parse(fs.readFileSync("content-ja.json", "utf8"));
const keys = Object.keys(tr);
console.log("content-ja.json entries:", keys.length);
// sample restaurant name keys
const names = keys.filter((k) => k.includes("rest.") && k.endsWith(".name"));
console.log("restaurant name keys:", names.length);
for (const k of names.slice(0, 5)) console.log("  " + k + " = " + JSON.stringify(tr[k]).slice(0, 60));
const attrNames = keys.filter((k) => k.includes("attr.") && k.endsWith(".name"));
console.log("attr name keys:", attrNames.length);
for (const k of attrNames.slice(0, 3)) console.log("  " + k + " = " + JSON.stringify(tr[k]).slice(0, 60));
