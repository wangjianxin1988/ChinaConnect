const fs = require("fs");
const p = "src/components/city/CitiesListClient.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  "export function CitiesListClient({ citiesMeta, citiesData, lang = \"en\", i18n = {} }: CitiesListClientProps) {",
  'export function CitiesListClient({ citiesMeta, citiesData, lang = "en", i18n = {} }: CitiesListClientProps) {\n  const JA_REGIONS: Record<string, string> = { 华北: "華北", 长三角: "長江デルタ", 珠三角: "珠江デルタ", 西北: "西北", 西南: "西南", 华南: "華南", 云南: "雲南", 福建: "福建", 山东: "山東", 湖南: "湖南", 海南: "海南", 华中: "華中", 东北: "東北", 中原: "中原", 内蒙古: "内モンゴル", 青海: "青海", 华东: "華東" };\n  const regionName = (r: string) => (lang === "ja" ? JA_REGIONS[r] || r : r);'
);
s = s.replace("{city.region}", "{regionName(city.region)}");
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
