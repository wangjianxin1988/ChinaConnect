const fs = require("fs");
const out = `// Auto-generated ja override dictionary for food data Cn strings.
// Key: original Simplified-Chinese string → natural Japanese.
// Populated by .audit/gen-food-ja-overrides.mjs
export const JA_FOOD_OVERRIDES: Record<string, string> = {};
`;
fs.writeFileSync("src/data/food/ja-food-overrides.ts", out);
console.log("placeholder written");
