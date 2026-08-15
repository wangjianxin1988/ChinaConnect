import fs from "node:fs";
const s = fs.readFileSync("src/components/Guide/DiningGuideClient.tsx", "utf8");
const i = s.indexOf("activeTab === \"budget\"");
console.log(s.slice(i - 50, i + 2400));
