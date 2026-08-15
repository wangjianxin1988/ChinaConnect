import fs from "node:fs";

const p = "src/pages/[lang]/city/[slug].astro";
let s = fs.readFileSync(p, "utf8");
const changes = [];

// 1. add formatTransportItem helper after getBadgeClass function
const anchor = "  return \"badge-local\";\n}";
const helper = anchor + `

// Render transport list items that may be strings, nested string arrays, or objects
function formatTransportItem(item: unknown): string {
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item.map((x) => formatTransportItem(x)).join(", ");
  if (item && typeof item === "object") {
    const parts = Object.values(item as Record<string, unknown>)
      .filter((v): v is string => typeof v === "string" && v.length > 0 && v !== "N/A")
      .map((v) => v.trim());
    return parts.join(" · ");
  }
  return String(item);
}`;
if (s.includes(anchor)) { s = s.replace(anchor, helper); changes.push("helper"); }
else console.error("NOT FOUND: getBadgeClass anchor");

// 2. flatten + format the four transport maps
for (const k of ["metro", "bus", "taxi", "bike"]) {
  const oldMap = `{(city.transport.local.${k} || []).map(item => (`;
  const newMap = `{(city.transport.local.${k} || []).flat(Infinity).map(item => (`;
  if (s.includes(oldMap)) { s = s.split(oldMap).join(newMap); changes.push(k + "Flat"); }
  else console.error("NOT FOUND: " + oldMap);
}

// 3. replace item rendering (4 occurrences)
const oldItem = "<span>{item}</span>";
const newItem = "<span>{formatTransportItem(item)}</span>";
if (s.includes(oldItem)) { s = s.split(oldItem).join(newItem); changes.push("itemRender"); }
else console.error("NOT FOUND: item span");

fs.writeFileSync(p + ".tmp", s);
fs.renameSync(p + ".tmp", p);
console.log("done:", changes.join(", "));
