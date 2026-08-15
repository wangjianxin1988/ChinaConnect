const fs = require("fs"), path = require("path");
const dir = "src/components/Guide";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const p = path.join(dir, f);
  const s = fs.readFileSync(p, "utf8");
  const usesJa = (s.match(/\bjaText\b/g) || []).length > 0;
  const usesBi = (s.match(/\bBi\b/g) || []).length > 0;
  const hasImport = /import \{[^}]*\b(jaText|Bi)\b[^}]*\} from "\.\/guide-i18n"/.test(s);
  const importLines = [];
  s.split("\n").forEach((l, i) => { if (l.includes('from "./guide-i18n"')) importLines.push(i + 1); });
  const problems = [];
  if ((usesJa || usesBi) && !hasImport) problems.push("uses jaText/Bi but NO import");
  if (importLines.length && Math.min(...importLines) > 60) problems.push("import too deep: " + importLines.join(","));
  if (importLines.length > 1) problems.push("multiple import lines: " + importLines.join(","));
  if (problems.length) console.log(f + ": " + problems.join("; "));
}
