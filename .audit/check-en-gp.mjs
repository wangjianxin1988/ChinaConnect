import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("en-translations.json", "utf8"));
const need = ["indexTitle", "visaTitle", "visaDescription", "accommodationTitle", "accommodationDescription", "communicationTitle", "communicationDescription", "departureTitle", "departureDescription", "diningTitle", "diningDescription", "emergencyTitle", "emergencyDescription", "paymentTitle", "paymentDescription", "scamPreventionTitle", "scamPreventionDescription", "transparencyTitle", "transparencyDescription", "transportTitle", "transportDescription", "attractionsTitle", "attractionsDescription", "culturalWarningsTitle", "culturalWarningsDescription"];
for (const k of need) console.log("guidePage." + k, "=>", JSON.stringify(en["guidePage." + k] ?? "(missing)").slice(0, 80));
