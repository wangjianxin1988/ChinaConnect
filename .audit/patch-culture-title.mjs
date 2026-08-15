import fs from "node:fs";
const p1 = "src/components/city/CulturalSection.tsx";
let s1 = fs.readFileSync(p1, "utf8").replace(/\r\n/g, "\n");
const oldFn = `function getImportanceStyles(importance: CulturalTip["importance"], lang: string) {
  switch (importance) {
    case "high":
      return {
        bg: "bg-red-100 text-red-700",
        label: ct(lang, "pri_high", "High Priority"),
      };
    case "medium":
      return {
        bg: "bg-amber-100 text-amber-700",
        label: ct(lang, "pri_medium", "Medium Priority"),
      };
    case "low":
      return {
        bg: "bg-gray-100 text-gray-700",
        label: ct(lang, "pri_low", "Low Priority"),
      };
  }
}`;
const newFn = `function normalizeImportance(importance: string | undefined): CulturalTip["importance"] {
  const map: Record<string, CulturalTip["importance"]> = {
    high: "high",
    medium: "medium",
    low: "low",
    高: "high",
    中: "medium",
    中程度: "medium",
    低: "low",
  };
  return map[String(importance || "").toLowerCase()] || "medium";
}

function getImportanceStyles(importance: CulturalTip["importance"], lang: string) {
  switch (normalizeImportance(importance)) {
    case "high":
      return {
        bg: "bg-red-100 text-red-700",
        label: ct(lang, "pri_high", "High Priority"),
      };
    case "medium":
      return {
        bg: "bg-amber-100 text-amber-700",
        label: ct(lang, "pri_medium", "Medium Priority"),
      };
    case "low":
      return {
        bg: "bg-gray-100 text-gray-700",
        label: ct(lang, "pri_low", "Low Priority"),
      };
  }
  return {
    bg: "bg-gray-100 text-gray-700",
    label: ct(lang, "pri_medium", "Medium Priority"),
  };
}`;
if (!s1.includes(oldFn)) { console.error("CulturalSection pattern not found"); process.exit(1); }
s1 = s1.split(oldFn).join(newFn);
const tmp1 = p1 + ".tmp";
fs.writeFileSync(tmp1, s1);
fs.renameSync(tmp1, p1);
console.log("patched", p1);

const p2 = "src/pages/[lang]/city/[slug].astro";
let s2 = fs.readFileSync(p2, "utf8").replace(/\r\n/g, "\n");
const oldTitle = 'const pageTitle = (translations[lang] || translations.en).cityPage?.pageTitle?.replace("{city}", localCityName) ?? `${localCityName} ${(translations.en.cityPage?.pageTitleSuffix ?? "Travel Guide - ChinaConnect")}`;\nconst pageDescription = (translations[lang] || translations.en).cityPage?.citySubtitle?.replace("{city}", localCityName) ?? `Complete travel guide for ${localCityName}, ${city.name}.`;';
const newTitle = 'const cityPageT = (translations[lang] || translations.en).cityPage || translations.en.cityPage;\nconst pageTitle = cityPageT.pageTitle?.replace("{city}", localCityName) ?? `${localCityName} ${(cityPageT.pageTitleSuffix ?? "Travel Guide - ChinaConnect")}`;\nconst pageDescription = cityPageT.citySubtitle?.replace("{city}", localCityName) ?? `Complete travel guide for ${localCityName}, ${city.name}.`;';
if (!s2.includes(oldTitle)) { console.error("city title pattern not found"); process.exit(1); }
s2 = s2.split(oldTitle).join(newTitle);
const tmp2 = p2 + ".tmp";
fs.writeFileSync(tmp2, s2);
fs.renameSync(tmp2, p2);
console.log("patched", p2);
