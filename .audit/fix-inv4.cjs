const fs = require("fs");
const p = "src/components/Guide/InvitationLetterClient.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  'import { type Language, translations } from "@/i18n/translations";\n',
  'import { type Language, translations } from "@/i18n/translations";\nimport { jaText, Bi } from "./guide-i18n";\n'
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
const lines = s.split("\n");
lines.forEach((l, i) => { if (l.includes('from "./guide-i18n"')) console.log("import at line " + (i + 1)); });
