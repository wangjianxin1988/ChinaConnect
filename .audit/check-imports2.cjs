const fs = require("fs");
for (const f of ["src/components/Guide/InvitationLetterClient.tsx", "src/components/Guide/PDFGenerator.tsx"]) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  console.log("=== " + f + " ===");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('from "./guide-i18n"')) console.log((i + 1) + ": " + lines[i]);
  }
}
