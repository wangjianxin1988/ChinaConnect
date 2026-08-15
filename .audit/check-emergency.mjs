import fs from "node:fs";
import path from "node:path";
const dir = "src/data/cities-i18n/ja";
const nameEnSet = new Set(), addrSet = new Set(), notesSet = new Set();
let total = 0, corrupted = 0;
for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  for (const e of d.emergencyContacts || []) {
    total++;
    nameEnSet.add(e.nameEn); addrSet.add(e.address); notesSet.add(e.notes);
    if (e.nameEn && e.nameEn.includes("総領事館")) corrupted++;
  }
}
console.log("total contacts:", total, "| corrupted (contains 総領事館):", corrupted);
console.log("distinct nameEn:", nameEnSet.size, [...nameEnSet].slice(0, 10));
console.log("distinct address:", addrSet.size, [...addrSet].slice(0, 10));
console.log("distinct notes:", notesSet.size, [...notesSet].slice(0, 10));
