import fs from "node:fs";
const f = "scripts/fix-city-data-cjk-v2.mjs";
let t = fs.readFileSync(f, "utf8");
const old = '      if (!CJK_RE.test(v)) continue;\n      if (isKeepableToken(v)) continue;\n      if (p.endsWith(".name")) continue; // proper noun; displayed via nameEn\n';
const neu = '      if (!CJK_RE.test(v)) continue;\n      if (p.includes("emergencyContacts")) continue; // handled by fix-emergency-contacts.mjs\n      if (isKeepableToken(v)) continue;\n      if (p.endsWith(".name")) continue; // proper noun; displayed via nameEn\n';
if (!t.includes(old)) { console.log("PATTERN NOT FOUND"); process.exit(1); }
t = t.replace(old, neu);
fs.writeFileSync(f, t, "utf8");
console.log("patched v2");
