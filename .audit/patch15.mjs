import fs from "node:fs";
const f = "src/components/Guide/DiningGuideClient.tsx";
let s = fs.readFileSync(f, "utf8");
const pairs = [
  ["tg.budgetGuideHeading", "tg.budgetHeading"],
  ["tg.streetFoodLabel", "tg.streetFood"],
  ["tg.casualRestaurantLabel", "tg.casual"],
  ["tg.diningEtiquetteHeading", "tg.diningEtiquette"],
  ["tg.orderingPhrasesHeading", "tg.orderingPhrases"],
  ["tg.dietaryRestrictionsHeading", "tg.dietary"],
  ["tg.chinesePhrasesLabel", "tg.chinesePhrases"],
  ["tg.commonAllergiesLabel", "tg.commonAllergies"],
  ["tg.faqHeading", "tg.faqsHeading"],
  ["tg.safeOptionsLabel", "tg.safeOptions"],
  ["tg.popularCategoriesHeading", "tg.categoriesHeading"],
  ["tg.allergyInfoHeading", "tg.importantAllergyInfo"],
  ["tg.allergenCardHeading", "tg.allergenCard"],
  ["tg.proTipsLabel", "tg.proTips"],
];
for (const [a, b] of pairs) {
  const n = s.split(a).length - 1;
  if (n === 0) { console.error("NOT FOUND: " + a); process.exit(1); }
  s = s.split(a).join(b);
  console.log(a + " -> " + b + " (" + n + "x)");
}
fs.writeFileSync(f, s, "utf8");
console.log("done");
