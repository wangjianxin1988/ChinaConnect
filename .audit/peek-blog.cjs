const fs = require("fs"), path = require("path");
const dir = "src/data/blog-i18n/ja";
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  console.log("ja blog files:", files.length);
  for (const f of files.slice(0, 5)) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    console.log("--- " + f + " ---");
    console.log("title:", (d.title || "").slice(0, 80));
    console.log("content len:", (d.content || "").length);
  }
} else console.log("no ja blog dir");
