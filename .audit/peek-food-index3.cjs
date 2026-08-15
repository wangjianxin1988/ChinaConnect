const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8");
const lines = s.split("\n");
// print the section where categories are rendered (search "label")
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("cfg.label") || lines[i].includes("config.label") || lines[i].includes(".labels[") || lines[i].includes("label:") ) console.log((i + 1) + ": " + lines[i].trim().slice(0, 150));
}
