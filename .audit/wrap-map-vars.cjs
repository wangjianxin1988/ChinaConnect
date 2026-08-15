const fs = require("fs");
const plan = {
  "src/components/Guide/AccommodationGuideClient.tsx": ["f", "detail"],
  "src/components/Guide/CommunicationGuideClient.tsx": ["p", "step", "item"],
  "src/components/Guide/DepartureGuideClient.tsx": ["step", "tip"],
  "src/components/Guide/DiningGuideClient.tsx": ["dish", "tip"],
  "src/components/Guide/EmergencyGuideClient.tsx": ["action", "tip", "phrase"],
  "src/components/Guide/PaymentGuideClient.tsx": ["step"],
  "src/components/Guide/ScamPreventionClient.tsx": ["sign", "tip", "action"],
  "src/components/Guide/TranslationServiceClient.tsx": ["feat"],
  "src/components/Guide/TransportGuideClient.tsx": ["detail", "step", "tip"],
  "src/components/Guide/VisaGuideClient.tsx": ["tip"],
};
for (const [f, vars] of Object.entries(plan)) {
  let s = fs.readFileSync(f, "utf8");
  const orig = s;
  for (const v of vars) {
    // wrap bare {v} but not {v.prop}, not {jaText(v, ...}, not {v, ...}
    const re = new RegExp("\\{" + v + "\\}(?!\\.|,|\\})", "g");
    s = s.replace(re, "{jaText(" + v + ", lang)}");
  }
  if (s !== orig) fs.writeFileSync(f, s);
  console.log(f.split("/").pop() + ": " + (s !== orig ? "wrapped" : "no change"));
}
