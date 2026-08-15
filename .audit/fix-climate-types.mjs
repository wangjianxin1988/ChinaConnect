import fs from "node:fs";

const fixes = {
  "src/data/cities-i18n/ja/dali.json": ["Subtropical highland", "亜熱帯高地気候"],
  "src/data/cities-i18n/ja/dalian.json": ["Temperate oceanic climate", "温帯海洋性気候"],
};

for (const [p, [from, to]] of Object.entries(fixes)) {
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  if (j.climate?.type === from) {
    j.climate.type = to;
    fs.writeFileSync(p + ".tmp", JSON.stringify(j, null, 2), "utf8");
    fs.renameSync(p + ".tmp", p);
    console.log("fixed", p);
  } else {
    console.log("SKIP (already translated or missing):", p, JSON.stringify(j.climate?.type));
  }
}
