import fs from "node:fs";
const path = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
// 1) add helper after transportLocal line
const anchor = "const transportLocal = transportData?.local || city.transport?.local;";
if (!s.includes(anchor)) { console.error("MISSING anchor"); process.exit(1); }
const helper = anchor + `
const fmtTransport = (item: unknown): string => {
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item.map((v) => fmtTransport(v)).filter(Boolean).join("、");
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    const line = typeof o.line === "string" ? o.line : "";
    const desc = typeof o.description === "string" ? o.description : "";
    const hours = typeof o.hours === "string" && o.hours !== "N/A" ? "（" + o.hours + "）" : "";
    return [line, desc, hours].filter(Boolean).join("：");
  }
  return String(item);
};`;
s = s.split(anchor).join(helper);
// 2) replace the four {item} renders (metro/bus/taxi/bike all use same pattern)
const oldPattern = "<span>{item}</span>";
if ((s.split(oldPattern).length - 1) !== 4) { console.error("expected 4 {item} spans, got", s.split(oldPattern).length - 1); process.exit(1); }
s = s.split(oldPattern).join("<span>{fmtTransport(item)}</span>");
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
console.log("patched", path);
