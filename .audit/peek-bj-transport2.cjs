const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log(JSON.stringify(d.transport, null, 1).slice(0, 1500));
