const fs = require("fs");
const p = "src/components/city/CityTierBadge.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  "{showLabel && <span className=\"hidden sm:inline\">{currentLang === \"en\" ? config.label : config.labelZh}</span>}",
  '{showLabel && <span className="hidden sm:inline">{currentLang === "ja" ? config.labelJa : currentLang === "en" ? config.label : config.labelZh}</span>}'
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
