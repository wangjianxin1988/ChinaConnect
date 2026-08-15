const fs = require("fs");
const f = "src/components/Guide/AccommodationGuideClient.tsx";
const s = fs.readFileSync(f, "utf8");
console.log("read OK, length:", s.length);
fs.writeFileSync(f + ".testwrite", "x");
console.log("write test OK");
fs.unlinkSync(f + ".testwrite");
