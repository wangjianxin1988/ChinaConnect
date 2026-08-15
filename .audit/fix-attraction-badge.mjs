import fs from "node:fs";
const p = "src/pages/[lang]/city/[slug]/attractions.astro";
let s = fs.readFileSync(p, "utf8");
const oldBadge = "                  {attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1)}";
const newBadge = "                  {(CAT_LABELS[attraction.category] && CAT_LABELS[attraction.category][lang]) || (CAT_LABELS[attraction.category] && CAT_LABELS[attraction.category].en) || attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1)}";
if (s.includes(oldBadge)) { s = s.split(oldBadge).join(newBadge); console.log("badge localized"); }
else console.error("NOT FOUND: badge");
fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
