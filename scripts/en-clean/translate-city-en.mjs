// Translate all Chinese text in EN source src/data/cities/*.json to English.
// - name fields are KEPT (used by CJK language pages)
// - nameEn fields with CJK are translated (EN pages display nameEn)
// - all other fields with CJK are translated to English
// Usage: node scripts/en-clean/translate-city-en.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_FILE = path.join(ROOT, '.audit', 'en-city-cache.json');
const MAPPING_FILE = path.join(ROOT, 'scripts', 'en-clean', 'mapping-en.json');
const CITIES_DIR = path.join(ROOT, 'src', 'data', 'cities');
const CONCURRENCY = 3;
const BATCH = 20;
const CJK = /[\u3400-\u9fff]/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- collect ----------
function walk(o, slug, pathArr, out) {
  if (Array.isArray(o)) {
    o.forEach((v, i) => walk(v, slug, pathArr.concat([String(i)]), out));
  } else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) walk(v, slug, pathArr.concat([k]), out);
  } else if (typeof o === 'string' && CJK.test(o)) {
    out.push({ slug, path: pathArr, value: o });
  }
}

function collectAll() {
  const entries = [];
  for (const f of fs.readdirSync(CITIES_DIR).filter((x) => x.endsWith('.json'))) {
    const slug = f.replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(CITIES_DIR, f), 'utf8'));
    walk(data, slug, [], entries);
  }
  return entries;
}

// ---------- translate via DeepSeek ----------
async function translateBatch(strings) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY required');
  const list = strings.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You translate Chinese travel content to natural, professional English. ' +
            'If a string mixes English and Chinese, keep the English part and translate only the Chinese part. ' +
            'Preserve numbers, prices (¥, yuan), times, dates, URLs, and punctuation. ' +
            'For restaurant/cuisine names translate or romanize sensibly so English readers understand what the dish is. ' +
            'Return ONLY a JSON object: {"translations":["translation1","translation2",...]} with exactly the same number of items and in the same order.',
        },
        { role: 'user', content: list },
      ],
      max_tokens: 3000,
      temperature: 0.2,
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${err.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no JSON in response: ' + content.slice(0, 200));
  const parsed = JSON.parse(m[0]);
  const arr = parsed.translations;
  if (!Array.isArray(arr) || arr.length !== strings.length) {
    throw new Error(`bad array length ${arr?.length} vs ${strings.length}: ${content.slice(0, 300)}`);
  }
  return arr;
}

async function translateAll(uniqueValues) {
  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};
  const todo = uniqueValues.filter((v) => !(v in cache));
  console.log('unique values:', uniqueValues.length, 'cached:', uniqueValues.length - todo.length, 'todo:', todo.length);
  const results = {};
  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH * CONCURRENCY) {
    const chunks = [];
    for (let j = 0; j < CONCURRENCY; j++) {
      const slice = todo.slice(i + j * BATCH, i + (j + 1) * BATCH);
      if (slice.length) chunks.push(slice);
    }
    const settled = await Promise.allSettled(
      chunks.map(async (chunk) => {
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            const arr = await translateBatch(chunk);
            chunk.forEach((v, idx) => (results[v] = arr[idx]));
            return;
          } catch (e) {
            if (attempt === 3) throw e;
            await sleep(3000 * (attempt + 1));
          }
        }
      }),
    );
    for (const s of settled) if (s.status === 'rejected') console.error('batch failed:', s.reason);
    done += chunks.reduce((a, c) => a + c.length, 0);
    Object.assign(cache, results);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1), 'utf8');
    if (i % (BATCH * CONCURRENCY * 5) === 0 || done === todo.length) {
      console.log('progress:', done, '/', todo.length);
    }
    await sleep(600);
  }
  return { cache, results };
}

// ---------- apply ----------
function applyToFiles(entries, cache, mapping) {
  const bySlug = new Map();
  for (const e of entries) {
    if (!bySlug.has(e.slug)) bySlug.set(e.slug, []);
    bySlug.get(e.slug).push(e);
  }
  let changed = 0;
  for (const [slug, list] of bySlug) {
    const file = path.join(CITIES_DIR, slug + '.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let touched = 0;
    for (const e of list) {
      const lastField = e.path[e.path.length - 1];
      const isName = lastField === 'name' && !e.path.includes('nameEn');
      if (isName) continue; // keep Chinese name for CJK pages
      if (lastField === 'id') continue; // technical anchor ids
      const target = mapping[e.value] || cache[e.value];
      if (!target || target === e.value) continue;
      // navigate & set
      let cur = data;
      for (let i = 0; i < e.path.length - 1; i++) cur = cur[e.path[i]];
      const last = e.path[e.path.length - 1];
      if (cur[last] === e.value) {
        cur[last] = target;
        touched++;
      }
    }
    if (touched) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      changed += touched;
    }
  }
  return changed;
}

async function main() {
  const entries = collectAll();
  const unique = [...new Set(entries.filter((e) => {
    const last = e.path[e.path.length - 1];
    if (last === 'name' && !e.path.includes('nameEn')) return false;
    if (last === 'id') return false; // technical anchor ids, not visible text
    return true;
  }).map((e) => e.value))];
  const { cache } = await translateAll(unique);
  const mapping = fs.existsSync(MAPPING_FILE) ? JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8')) : {};
  const changed = applyToFiles(entries, cache, mapping);
  console.log('changed fields:', changed);
}

main().catch((e) => { console.error(e); process.exit(1); });
