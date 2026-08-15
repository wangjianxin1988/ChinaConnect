import fs from "node:fs";
const j = JSON.parse(fs.readFileSync("ja-translations.json", "utf8"));
const need = ["indexTitle", "visaTitle", "visaDescription", "accommodationTitle", "accommodationDescription", "communicationTitle", "communicationDescription", "departureTitle", "departureDescription", "diningTitle", "diningDescription", "emergencyTitle", "emergencyDescription", "paymentTitle", "paymentDescription", "scamPreventionTitle", "scamPreventionDescription", "transparencyTitle", "transparencyDescription", "transportTitle", "transportDescription", "attractionsTitle", "attractionsDescription", "culturalWarningsTitle", "culturalWarningsDescription"];
for (const k of need) {
  const full = "guidePage." + k;
  console.log(full.padEnd(40), JSON.stringify(j[full] ?? "(missing)").slice(0, 70));
}
