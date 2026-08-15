// Auto-translate new content to all 11 non-English languages.
// Triggered automatically before build to ensure no content gaps.
// Usage:
//   node scripts/auto-translate-content.mjs              # translate any new content
//   node scripts/auto-translate-content.mjs --force      # re-translate all
//   node scripts/auto-translate-content.mjs --lang=ja   # only one language
import fs from 'fs';
import path from 'path';
import { getMiniMaxConfig } from './lib/minimax-config.mjs';

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";
const BATCH = 30;

const LANGS = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const TARGETS = {
  ja: "Japanese. Polite tourism style. Keep URL/AI/Wi-Fi as-is.",
  ko: "Korean. Polite tourism style. Keep URL/AI/Wi-Fi as-is.",
  "zh-CN": "Simplified Chinese. Concise, marketing-friendly.",
  "zh-TW": "Traditional Chinese (Taiwan). Polite tourism style.",
  th: "Thai (Thailand visitors). Polite Thai for tourism.",
  vi: "Vietnamese (Vietnam visitors). Friendly, clear Vietnamese.",
  ru: "Russian (Russian-speaking visitors). Modern Russian for tourism.",
  fr: "French (France/Canada-compatible). Standard French for tourism.",
  de: "German. Modern German tourism style.",
  ar: "Modern Standard Arabic (MSA), formal, RTL-aware UI.",
  fa: "Modern Persian (Farsi), formal, RTL-aware UI.",
};

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const LANG_ARG = args.find(a => a.startsWith('--lang='));
const ONLY_LANG = LANG_ARG ? LANG_ARG.split('=')[1] : null;
const TARGETS_FINAL = ONLY_LANG ? [ONLY_LANG] : LANGS;

function escape(s) { return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n'); }

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 6000 };
  const res = await fetch(HOST + '/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 200));
  const j = await res.json();
  return j.choices?.[0]?.message?.content;
}

function extractJson(content) {
  let c = content.trim();
  c = c.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/, '');
  const start = c.indexOf('{');
  const end = c.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in response');
  c = c.slice(start, end + 1);
  return JSON.parse(c);
}

function isTranslated(value, originalEn) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  if (v.toLowerCase() === String(originalEn || '').trim().toLowerCase()) return false;
  return true;
}

async function translateBatch(lang, batch, sourceMap) {
  const lines = batch.map(k => k + ' = "' + escape(sourceMap[k]) + '"').join('\n');
  const prompt = 'You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\nTranslate the following English strings into ' + TARGETS[lang] + '.\nRules:\n- Output ONLY a single JSON object with EXACTLY these ' + batch.length + ' keys.\n- No markdown, no commentary, no extra keys.\n- Translate EVERY value into ' + lang + '. Do NOT keep English text.\n- Keep numbers, prices, times, units, brand names unchanged.\n- Keep proper nouns recognizable.\n\n' + lines + '\n';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await callChat(prompt);
      const obj = extractJson(content);
      const result = {};
      let ok = 0;
      for (const k of batch) {
        if (isTranslated(obj[k], sourceMap[k])) {
          result[k] = obj[k];
          ok++;
        }
      }
      if (ok >= Math.max(1, Math.floor(batch.length * 0.3))) return result;
    } catch (e) { /* retry */ }
    await new Promise(r => setTimeout(r, 1500));
  }
  return {};
}

async function run() {
  const sourceFile = 'content-en.json';
  if (!fs.existsSync(sourceFile)) {
    console.log('No ' + sourceFile + ' found, nothing to translate.');
    return;
  }
  const en = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const allKeys = Object.keys(en);

  for (const lang of TARGETS_FINAL) {
    const outFile = 'content-' + lang + '.json';
    let out = {};
    if (fs.existsSync(outFile)) {
      try { out = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch (e) {}
    }
    const todo = FORCE ? allKeys : allKeys.filter(k => !out[k] || !isTranslated(out[k], en[k]));
    if (todo.length === 0) {
      console.log('[' + lang + '] up to date (' + Object.keys(out).length + ' keys)');
      continue;
    }
    console.log('[' + lang + '] translating ' + todo.length + ' new keys');
    let translated = 0;
    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      const result = await translateBatch(lang, batch, en);
      for (const [k, v] of Object.entries(result)) {
        out[k] = v;
        translated++;
      }
      if ((i / BATCH) % 20 === 0) {
        console.log('[' + lang + ' ' + i + '/' + todo.length + '] +' + translated);
        fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
      }
      await new Promise(r => setTimeout(r, 300));
    }
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
    console.log('[' + lang + '] done: ' + Object.keys(out).length + ' total keys');
  }
  console.log('ALL DONE');
}

run().catch(e => { console.error(e); process.exit(1); });
