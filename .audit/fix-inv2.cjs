const fs = require("fs");
const p = "src/components/Guide/InvitationLetterClient.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
// add top import if missing
if (!s.includes('import { jaText, Bi } from "./guide-i18n";\r\n')) {
  s = s.replace(
    'import { type Language, translations } from "@/i18n/translations";\r\n',
    'import { type Language, translations } from "@/i18n/translations";\r\nimport { jaText, Bi } from "./guide-i18n";\r\n'
  );
}
// remove stray import inside template literal (CRLF-aware)
s = s.replace(/\r\nimport \{ jaText, Bi \} from "\.\/guide-i18n";\r\n/, "\r\n");
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
// verify
const lines = s.split("\r\n");
lines.forEach((l, i) => { if (l.includes('from "./guide-i18n"')) console.log("import at line " + (i + 1) + ": " + l); });
