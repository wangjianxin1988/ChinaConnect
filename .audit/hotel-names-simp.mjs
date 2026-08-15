import fs from "node:fs";
import path from "node:path";
// supplementary simplified chars commonly missed
const EXTRA = "书乐习乡云买乱争于亚产亲人从众传伟伤体余修们价众优伙会传伤体余你便保信修们价优伟伤体余修们价优会传伤体余修们价优伤体余修们价优";
const SIMP = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const all = new Set([...SIMP, ...EXTRA]);
const re = new RegExp("[" + [...all].join("") + "]");
const files = [];
function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith(".json")) files.push(p); } }
walk("src/data/cities-i18n/ja");
const found = new Map();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  if (Array.isArray(data.hotels)) {
    data.hotels.forEach((h) => {
      if (typeof h.name === "string" && re.test(h.name)) {
        if (!found.has(h.name)) found.set(h.name, path.basename(f));
      }
    });
  }
}
console.log("hotel names with simplified chars:", found.size);
for (const [n, f] of found) console.log(f, "::", n);
