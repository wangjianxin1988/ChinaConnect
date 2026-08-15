const fs = require("fs");
const p = "src/pages/[lang]/guide/business/index.astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(/href: "`\/\$\{lang\}\/guide\/business\/([^"]+)",/g, 'href: `/${lang}/guide/business/$1`,');
fs.writeFileSync(p, s);
const m = s.match(/href:[^\n]+/g) || [];
console.log(m.join("\n"));
console.log("changed:", orig !== s);
