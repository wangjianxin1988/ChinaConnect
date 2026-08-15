const fs = require("fs");
const d = JSON.parse(fs.readFileSync("src/data/cities-i18n/ja/beijing.json", "utf8"));
console.log("arrival[0].from:", d.transport.arrival[0].from);
console.log("arrival[0].tips:", (d.transport.arrival[0].tips || "").slice(0, 80));
console.log("local.metro[0]:", d.transport.local.metro[0]);
console.log("local.taxi[0]:", d.transport.local.taxi[0]);
console.log("payment[0].description:", d.payment[0].description);
