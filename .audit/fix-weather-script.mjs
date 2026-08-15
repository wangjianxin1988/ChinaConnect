import fs from "node:fs";
const p = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const closeLayout = s.lastIndexOf("</BaseLayout>");
const scriptStart = s.indexOf("<script is:inline>");
if (scriptStart > closeLayout) {
  const scriptEnd = s.indexOf("</script>", scriptStart) + "</script>".length;
  const block = s.slice(scriptStart, scriptEnd);
  s = s.slice(0, scriptStart) + s.slice(scriptEnd);
  s = s.replace("</BaseLayout>", "</BaseLayout>\n" + block.trim() + "\n");
}
const tmp = p + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, p);
console.log("scriptStart:", s.indexOf("<script is:inline>"), "closeLayout:", s.lastIndexOf("</BaseLayout>"));
