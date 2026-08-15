const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log("transport:", JSON.stringify(d.transport).slice(0, 200));
console.log("payment:", JSON.stringify(d.payment).slice(0, 200));
const base = JSON.parse(fs.readFileSync("src/data/cities/beijing.json", "utf8"));
console.log("base has transport:", !!base.transport, "| payment:", !!base.payment);
