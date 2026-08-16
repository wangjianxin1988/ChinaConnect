const fs = require("fs");
const p = "src/components/Emergency/GPSLocator.tsx";
let src = fs.readFileSync(p, "utf8");
const before = src;
src = src.replace("interface GPSLocatorProps {\n  className?: string;\n}", "interface GPSLocatorProps {\n  className?: string;\n  lang?: string;\n}");
src = src.replace("export function GPSLocator({ className = \"\" }: GPSLocatorProps) {", "export function GPSLocator({ className = \"\", lang = \"en\" }: GPSLocatorProps) {");
if (src === before) { console.log("NO CHANGE - pattern mismatch!"); process.exit(1); }
fs.writeFileSync(p, src, "utf8");
console.log("patched GPSLocator.tsx");
