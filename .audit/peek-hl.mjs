import fs from "node:fs";
for (const f of ["dalian","guangzhou","shenzhen","kunming"]) {
  const j = JSON.parse(fs.readFileSync(`src/data/cities-i18n/ja/${f}.json`, "utf8"));
  console.log("== " + f);
  (j.highlights||[]).forEach((h,i)=>console.log("  ["+i+"] " + JSON.stringify(h)));
}
