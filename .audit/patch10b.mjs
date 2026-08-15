import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 120))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/components/Guide/ExpoCalendarClient.tsx", [
  ['                {m.label}\n                <span className="ml-1 opacity-70 text-xs">{jaText(m.labelCn, lang)}</span>',
   '                {lang === "ja" ? jaText(m.labelCn, lang) : <>{m.label} <span className="ml-1 opacity-70 text-xs">{jaText(m.labelCn, lang)}</span></>}'],
  ['                        {month?.label}\n                      </span>',
   '                        {lang === "ja" ? jaText(month?.labelCn || "", lang) : month?.label}\n                      </span>'],
]);
