const fs = require("fs");
const p = "src/components/Guide/CompanyRegistrationClient.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
for (const v of ["doc", "tip", "point"]) {
  s = s.split("{" + v + ".cn}").join("{jaText(" + v + ".cn, lang)}");
}
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
