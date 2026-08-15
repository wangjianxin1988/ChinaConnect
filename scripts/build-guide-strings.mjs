// Collect all translatable strings from guide data modules (excluding ja-overrides).
import fs from "node:fs";
import path from "node:path";

const DIR = "src/data/guide";
const EXCLUDE = /^(https?:\/\/|tel:|mailto:|\/img\/|\/icons\/|data:image|\{|\}|<[^>]+>)/i;
const NON_TEXT = /^[\d\s.,¥$€£₩₹₽+\-():/%×·•&'"]+$/;
const EMOJI_ONLY = /^[\p{Extended_Pictographic}\u200d\ufe0f\s]+$/u;

function walk(value, out) {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key === "icon" || key === "emoji") continue;
      walk(value[key], out);
    }
    return;
  }
}

function isTranslatable(s) {
  if (!s || s.trim().length === 0) return false;
  if (EXCLUDE.test(s)) return false;
  if (NON_TEXT.test(s)) return false;
  if (EMOJI_ONLY.test(s)) return false;
  return true;
}

const files = [];
for (const name of fs.readdirSync(DIR)) {
  if (!name.endsWith(".ts") || name === "ja-overrides.ts" || name === "_meta.ts") continue;
  files.push(path.join(DIR, name));
}
const bizDir = path.join(DIR, "business");
if (fs.existsSync(bizDir)) {
  for (const name of fs.readdirSync(bizDir)) {
    if (!name.endsWith(".ts") || name === "ja-overrides.ts") continue;
    files.push(path.join(bizDir, name));
  }
}

const all = [];
for (const file of files) {
  const mod = await import(new URL(`../${file}`, import.meta.url).href);
  for (const key of Object.keys(mod)) {
    walk(mod[key], all);
  }
}
const unique = [...new Set(all.filter(isTranslatable))];
console.log("files:", files.length, "total strings:", all.length, "unique translatable:", unique.length);
fs.writeFileSync(".audit/guide-strings.json", JSON.stringify({ files, strings: unique }, null, 1), "utf8");
