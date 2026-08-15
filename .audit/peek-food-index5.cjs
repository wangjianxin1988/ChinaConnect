const fs = require("fs");
const s = fs.readFileSync("src/pages/[lang]/food/index.astro", "utf8");
const lines = s.split("\n");
// find <script and print until </script>
const start = lines.findIndex((l) => l.includes("<script"));
const end = lines.findIndex((l, i) => i > start && l.includes("</script>"));
console.log("script block:", start + 1, "to", end + 1);
for (let i = start; i < Math.min(start + 120, end); i++) console.log((i + 1) + ": " + lines[i].slice(0, 150));
