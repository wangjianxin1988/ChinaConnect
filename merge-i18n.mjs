// Merge JSON translations into src/i18n/translations.ts
// Preserves the existing nested structure of each lang block (taken from en).
import fs from 'fs';
const TS_FILE = "src/i18n/translations.ts";
const LANGS = ["en", "ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const JSON_FILES = {
  "en": "en-translations.json",
  "ja": "ja-translations.json", "ko": "ko-translations.json",
  "th": "th-translations.json", "vi": "vi-translations.json",
  "ru": "ru-translations.json", "fr": "fr-translations.json",
  "de": "de-translations.json", "ar": "ar-translations.json",
  "fa": "fa-translations.json",
  "zh-CN": "zh-CN-translations.json", "zh-TW": "zh-TW-translations.json",
};

const src = fs.readFileSync(TS_FILE, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const lines = src.split("\n");

const translations = { en: null };
for (const [lang, file] of Object.entries(JSON_FILES)) {
  if (file && fs.existsSync(file)) {
    translations[lang] = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log("loaded " + lang + ": " + Object.keys(translations[lang]).length + " keys");
  } else if (file) {
    console.warn("WARN: " + file + " missing");
    translations[lang] = {};
  }
}

function findStart(lang) {
  const re = new RegExp("^  (\"?" + lang.replace("-", "\\-") + "\"?):\\s*\\{?$");
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i]) && (lines[i].endsWith("{") || (lines[i+1] && lines[i+1].trim() === "{"))) return i;
  }
  throw new Error("not found: " + lang);
}

function findEnd(startLine) {
  let d = 0; let inBlock = false;
  for (let i = startLine; i < lines.length; i++) {
    for (const c of lines[i]) {
      if (c === "{") { d++; if (!inBlock) inBlock = true; }
      else if (c === "}") { d--; if (inBlock && d === 0) return i; }
    }
  }
  return lines.length - 1;
}

function parseBlock(openLine) {
  function walk(idx, depth) {
    const exp = (depth + 1) * 2;
    const node = { type: 'ns', children: [], srcStart: idx };
    while (idx < lines.length) {
      const line = lines[idx];
      if (!line.trim()) { idx++; continue; }
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch[1].length;
      if (indent < exp) break;
      if (indent > exp) { idx++; continue; }
      const km = line.match(/^\s+([a-zA-Z][a-zA-Z0-9]*):\s*(.*)$/);
      if (!km) { idx++; continue; }
      const name = km[1];
      const rest = km[2];
      if (rest.trim() === '{' || rest === '{') {
        const child = walk(idx + 1, depth + 1);
        child.name = name;
        node.children.push(child);
        idx = child.srcEnd + 1;
      } else if (rest.startsWith('"') || rest.startsWith('`')) {
        const v = rest.match(/^"((?:[^"\\]|\\.)*)"/);
        node.children.push({ type: 'leaf', name, value: v ? v[1] : '', srcLine: idx });
        idx++;
      } else {
        idx++;
      }
    }
    node.srcEnd = idx - 1;
    return node;
  }
  return walk(openLine + 1, 1);
}

function flattenTree(node, prefix) {
  const result = {};
  for (const c of node.children) {
    const k = prefix ? prefix + '.' + c.name : c.name;
    if (c.type === 'ns') Object.assign(result, flattenTree(c, k));
    else result[k] = c.value;
  }
  return result;
}

function escapeTS(v) {
  return String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function getValue(lang, key) {
  if (translations[lang] && translations[lang][key] !== undefined) return translations[lang][key];
  if (lang !== 'en' && translations['en'] && translations['en'][key] !== undefined) return translations['en'][key];
  if (key in enFlat) return enFlat[key];
  return key;
}

function renderLang(lang, tree) {
  const out = [];
  function render(node, depth, prefix) {
    // depth=0 -> first level inside lang block -> indent 4 spaces
    // depth=1 -> second level -> indent 6 spaces
    const indent = '  '.repeat(depth + 2);
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      const fullKey = prefix ? prefix + '.' + c.name : c.name;
      if (c.type === 'ns') {
        out.push(indent + c.name + ': {');
        render(c, depth + 1, fullKey);
        out.push(indent + '}' + (i < node.children.length - 1 ? ',' : ''));
      } else {
        const v = getValue(lang, fullKey);
        out.push(indent + c.name + ': \"' + escapeTS(v) + '\"' + (i < node.children.length - 1 ? ',' : ''));
      }
    }
  }
  render(tree, 0, '');
  return out;
}

const enStart = findStart('en');
const enTree = parseBlock(enStart);
const enFlat = flattenTree(enTree, '');

const extraFlat = {};
for (const lang of Object.keys(translations)) {
  if (translations[lang]) for (const k of Object.keys(translations[lang])) extraFlat[k] = true;
}
function extendTree(node, prefix) {
  const childKeys = new Set();
  for (const k of Object.keys(extraFlat)) {
    if (prefix) {
      if (!k.startsWith(prefix + '.')) continue;
      const rest = k.substring(prefix.length + 1);
      const firstPart = rest.split('.')[0];
      if (firstPart) childKeys.add(firstPart);
    } else {
      if (!k.includes('.')) childKeys.add(k);
      else childKeys.add(k.split('.')[0]);
    }
  }
  for (const ck of childKeys) {
    if (!ck) continue;
    const fullKey = prefix ? prefix + '.' + ck : ck;
    const existing = node.children.find(c => c.name === ck);
    const isLeaf = extraFlat.hasOwnProperty(fullKey);
    if (!existing) {
      if (isLeaf) {
        const placeholder = translations.en && translations.en[fullKey] !== undefined ? translations.en[fullKey] : fullKey;
        node.children.push({ type: 'leaf', name: ck, value: placeholder });
      } else {
        const child = { type: 'ns', name: ck, children: [] };
        node.children.push(child);
        extendTree(child, fullKey);
      }
    } else if (existing.type === 'ns') {
      extendTree(existing, fullKey);
    }
  }
  node.children.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}
extendTree(enTree, '');




// Build a union of all keys from JSON files (used to extend enTree for keys not in en block)

console.log('en flat keys:', Object.keys(enFlat).length);

const langStarts = {};
for (const lang of LANGS) langStarts[lang] = findStart(lang);
const langEnds = {};
for (const lang of LANGS) langEnds[lang] = findEnd(langStarts[lang]);

const firstStart = Math.min(...Object.values(langStarts));
const lastEnd = Math.max(...Object.values(langEnds));
const head = lines.slice(0, firstStart);
const tail = lines.slice(lastEnd + 1);

const newBlocks = [];
for (const lang of LANGS) {
  const openStr = (lang === 'zh-CN' || lang === 'zh-TW') ? '  "' + lang + '": {' : '  ' + lang + ': {';
  const blockLines = renderLang(lang, enTree);
  newBlocks.push(openStr + '\n' + blockLines.join('\n') + '\n  }');
}

const newContent = head.join('\n') + '\n' + newBlocks.join(',\n') + ',\n' + tail.join('\n');
fs.writeFileSync(TS_FILE, newContent.replace(/\r\n/g, "\n"), { encoding: "utf8" });
console.log('Wrote ' + TS_FILE + ': ' + newContent.length + ' bytes, ' + newContent.split('\n').length + ' lines');