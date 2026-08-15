import fs from "node:fs";
const f = "src/components/Guide/CommunicationGuideClient.tsx";
let s = fs.readFileSync(f, "utf8");
const from = 'import { jaText, Bi } from "./guide-i18n";';
const to = 'import { ct } from "@/i18n/components-strings";\nimport { jaText, Bi } from "./guide-i18n";';
if (!s.includes(from)) { console.error("not found"); process.exit(1); }
fs.writeFileSync(f, s.split(from).join(to), "utf8");
console.log("ok");
