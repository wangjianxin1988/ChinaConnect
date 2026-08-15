const fs = require("fs");
const p = "src/components/city/CityMap.tsx";
let src = fs.readFileSync(p, "utf8");

// add lang prop
let r = src.replace('interface CityMapProps {\n  city: City;\n  activeTab?: "overview" | "attractions" | "food" | "emergency";\n  height?: string;\n  showControls?: boolean;\n}', 'interface CityMapProps {\n  city: City;\n  activeTab?: "overview" | "attractions" | "food" | "emergency";\n  height?: string;\n  showControls?: boolean;\n  lang?: string;\n}');
src = r;
r = src.replace('export function CityMap({\n  city,\n  activeTab = "overview",\n  height = "350px",\n  showControls = true,\n}: CityMapProps) {', 'export function CityMap({\n  city,\n  activeTab = "overview",\n  height = "350px",\n  showControls = true,\n  lang = "en",\n}: CityMapProps) {');
src = r;

// localize legend labels
const L = (en, ja) => `{lang === "ja" ? "${ja}" : "${en}"}`;
r = src.replace('<span className="font-medium">Legend:</span>', `<span className="font-medium">{lang === "ja" ? "凡例：" : "Legend:"}</span>`);
src = r;
r = src.replace('<span>Attractions</span>', `<span>${L("Attractions", "観光スポット")}</span>`);
src = r;
r = src.replace('<span>Restaurants</span>', `<span>${L("Restaurants", "レストラン")}</span>`);
src = r;
r = src.replace('<span>Transport</span>', `<span>${L("Transport", "交通")}</span>`);
src = r;
r = src.replace('<span>Emergency</span>', `<span>${L("Emergency", "緊急")}</span>`);
src = r;

fs.writeFileSync(p, src);
console.log("CityMap patched:", src.includes('lang = "en"'), src.includes('凡例'));
