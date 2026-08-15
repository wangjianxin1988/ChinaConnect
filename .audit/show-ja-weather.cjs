const fs = require("fs");
const lines = fs.readFileSync("src/i18n/translations.ts", "utf8").split(/\r?\n/);
for (let i = 4808; i < 4832; i++) console.log((i + 1) + ": " + lines[i]);
