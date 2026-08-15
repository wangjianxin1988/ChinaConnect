// Strict follow-up: remove ALL Chinese characters from remaining embedded fields.
import fs from 'node:fs';
import path from 'node:path';

const CJK = /[\u3400-\u9fff]/;
const CITIES_DIR = 'src/data/cities';

// collect remaining non-name CJK fields
function walk(o, slug, pathArr, out) {
  if (Array.isArray(o)) o.forEach((v, i) => walk(v, slug, pathArr.concat([String(i)]), out));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, slug, pathArr.concat([k]), out);
  else if (typeof o === 'string' && CJK.test(o)) {
    const last = pathArr[pathArr.length - 1];
    if (last !== 'name') out.push({ slug, path: pathArr, value: o });
  }
}

const entries = [];
for (const f of fs.readdirSync(CITIES_DIR).filter((x) => x.endsWith('.json'))) {
  const slug = f.replace(/\.json$/, '');
  walk(JSON.parse(fs.readFileSync(path.join(CITIES_DIR, f), 'utf8')), slug, [], entries);
}
console.log('remaining non-name fields:', entries.length);

const unique = [...new Set(entries.map((e) => e.value))];
const key = process.env.DEEPSEEK_API_KEY;
const map = {};
for (let i = 0; i < unique.length; i += 20) {
  const chunk = unique.slice(i, i + 20);
  const numbered = chunk.map((s, j) => j + 1 + '. ' + s).join('\n');
  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Rewrite each string so it contains ZERO Chinese characters. Keep English text as-is; romanize any Chinese terms to pinyin; translate parenthetical Chinese annotations into English or pinyin in parentheses. Preserve numbers/prices/punctuation. Return a JSON object {"translations":["...",...]} same count and order.' },
        { role: 'user', content: numbered },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }),
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200));
  const data = await resp.json();
  let arr = JSON.parse(data.choices[0].message.content.match(/\{[\s\S]*\}/)[0]).translations;
  arr = arr.map((x) => (typeof x === 'string' ? x : x.translation));
  chunk.forEach((v, j) => (map[v] = arr[j]));
  console.log('progress', Math.min(i + 20, unique.length), '/', unique.length);
  await new Promise((r) => setTimeout(r, 400));
}

// apply
let changed = 0;
const bySlug = new Map();
for (const e of entries) {
  if (!bySlug.has(e.slug)) bySlug.set(e.slug, []);
  bySlug.get(e.slug).push(e);
}
for (const [slug, list] of bySlug) {
  const file = path.join(CITIES_DIR, slug + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let touched = 0;
  for (const e of list) {
    const target = map[e.value];
    if (!target || target === e.value || CJK.test(target)) continue;
    let cur = data;
    for (let i = 0; i < e.path.length - 1; i++) cur = cur[e.path[i]];
    const last = e.path[e.path.length - 1];
    if (cur[last] === e.value) { cur[last] = target; touched++; }
  }
  if (touched) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    changed += touched;
  }
}
console.log('changed fields:', changed);
