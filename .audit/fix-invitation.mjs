const fs = require("fs");
const p = "src/components/Guide/InvitationLetterClient.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  'import { type Language, translations } from "@/i18n/translations";',
  'import { type Language, translations } from "@/i18n/translations";\nimport { jaText, Bi } from "./guide-i18n";'
);
s = s.replace(
  "function buildLetterHTML(template: (typeof INVITATION_TEMPLATES)[0], values: FormValues): string {",
  "function buildLetterHTML(template: (typeof INVITATION_TEMPLATES)[0], values: FormValues, lang: Language): string {"
);
s = s.split("buildLetterHTML(currentTemplate, formValues)").join("buildLetterHTML(currentTemplate, formValues, lang)");
s = s.replace('\nimport { jaText, Bi } from "./guide-i18n";\n', "\n");
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
