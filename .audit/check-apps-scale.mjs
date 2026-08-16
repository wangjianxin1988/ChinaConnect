import fs from "node:fs";
const src = fs.readFileSync("src/data/apps/app-recommendations.ts","utf8");
const em = fs.readFileSync("src/data/emergency/global-contacts.ts","utf8");
console.log("app-recommendations.ts size:", src.length);
console.log("global-contacts.ts size:", em.length);
// count strings to translate
const APP_CATEGORIES_RE = /APP_CATEGORIES\s*=\s*\{/;
console.log("has APP_CATEGORIES:", APP_CATEGORIES_RE.test(src));
const NATIONAL_RE = /NATIONAL_EMERGENCY_NUMBERS/;
console.log("has NATIONAL_EMERGENCY_NUMBERS:", NATIONAL_RE.test(em));
