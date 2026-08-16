// Quality gate for override dictionaries: output JSON {bad, cont, total}.
// bad = identity values that are not keepable tokens (for zh-CN/zh-TW, CJK keys are legal identity).
// cont = values containing scripts not belonging to the target language.
import fs from "node:fs";
import { isKeepableToken } from "../scripts/lib/translation-accept.mjs";

const lang = process.argv[2];
const kind = process.argv[3] || "guide"; // guide | apps | emergency
const paths = {
  guide: [`src/data/guide/overrides-${lang}.ts`],
  apps: [`src/data/apps/overrides-${lang}.ts`, `src/data/emergency/overrides-${lang}.ts`],
  emergency: [`src/data/emergency/overrides-${lang}.ts`],
}[kind];
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
function parse(f) {
  const map = new Map();
  if (!fs.existsSync(f)) return map;
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(re)) {
    const un = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
    map.set(un(m[1]), un(m[2]));
  }
  return map;
}
const DISALLOWED = {
  ja: /[\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  ko: /[\u3400-\u9fff\u3040-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  "zh-CN": /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  "zh-TW": /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  th: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff]/,
  vi: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  ru: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0600-\u06ff\u0e00-\u0e7f]/,
  fr: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  de: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/,
  ar: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0e00-\u0e7f]/,
  fa: /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0e00-\u0e7f]/,
};
const disallow = DISALLOWED[lang];
const hasCJK = (s) => /[\u3400-\u9fff]/.test(s);
let bad = 0, cont = 0, total = 0;
for (const p of paths) {
  for (const [k, v] of parse(p)) {
    total++;
    if (v === k) {
      const legalZhIdentity = (lang === "zh-CN" || lang === "zh-TW") && hasCJK(k);
      if (!legalZhIdentity && !isKeepableToken(k)) bad++;
    } else if (disallow && disallow.test(v)) {
      cont++;
    }
  }
}
console.log(JSON.stringify({ lang, kind, total, bad, cont }));
