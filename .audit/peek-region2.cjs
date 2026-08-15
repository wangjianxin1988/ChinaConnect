const fs = require("fs");
const s = fs.readFileSync("src/components/city/CitiesListClient.tsx", "utf8");
const lines = s.split("\n");
lines.forEach((l, i) => {
  if (l.includes("region")) console.log((i + 1) + ": " + l.trim().slice(0, 140));
});
