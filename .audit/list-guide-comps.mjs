import fs from "node:fs";
const files = [
  "src/components/Guide/ExpoCalendarClient.tsx",
  "src/components/Guide/CompanyRegistrationClient.tsx",
  "src/components/Guide/TranslationServiceClient.tsx",
  "src/components/Guide/EtiquetteClient.tsx",
  "src/components/Guide/ScamPreventionClient.tsx",
  "src/components/Guide/CulturalWarningsClient.tsx",
  "src/components/Guide/AttractionsGuideClient.tsx",
  "src/components/Guide/PriceTransparencyClient.tsx",
];
for (const f of files) {
  if (!fs.existsSync(f)) { console.log("MISSING", f); continue; }
  const s = fs.readFileSync(f, "utf8");
  console.log("=====", f, "lines:", s.split("\n").length);
}
