const fs = require("fs");
const p = "src/components/Guide/PDFGenerator.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(/\nimport \{ jaText \} from "\.\/guide-i18n";\n/, "\n");
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
console.log("remaining jaText refs:", (s.match(/jaText/g) || []).length);
