import fs from "node:fs";
const s = fs.readFileSync("src/data/guide/visa.ts", "utf8");
const lines = s.split(/\r?\n/);
lines.forEach((l, i) => { if (/visaType|duration|processingTime|fee|notes|requirements|visaName|country/.test(l)) console.log((i + 1) + ": " + l.trim().slice(0, 140)); });
