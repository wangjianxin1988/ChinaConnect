import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("src/data/cities/nanjing.json","utf8"));
console.log(Object.keys(en.attractions[10]));
console.log("highopts:", JSON.stringify(en.attractions[10].highopts));
console.log("name:", en.attractions[10].name);
