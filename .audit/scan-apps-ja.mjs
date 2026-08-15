import { APP_RECOMMENDATIONS } from "../src/data/apps/app-recommendations.ts";
const missing = APP_RECOMMENDATIONS.filter(a => !a.descriptionJa);
console.log("total apps:", APP_RECOMMENDATIONS.length, "| missing descriptionJa:", missing.length);
for (const a of missing) console.log(a.id + " | " + a.name + " | " + a.descriptionEn);
