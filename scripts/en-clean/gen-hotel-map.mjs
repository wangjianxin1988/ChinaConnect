// Generate hotel district/highlight/street translation maps via DeepSeek.
import fs from 'node:fs';
import path from 'node:path';
import glob from 'node:fs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const files = fs.readdirSync('src/data/hotels').filter((f) => f.endsWith('-hotels.ts'));
const dists = new Set();
const hls = new Set();
for (const f of files) {
  const d = fs.readFileSync(path.join('src/data/hotels', f), 'utf8');
  for (const m of d.matchAll(/district: "([^"]*)"/g)) dists.add(m[1]);
  for (const m of d.matchAll(/highlights: \[(.*?)\]/gs)) {
    for (const h of m[1].matchAll(/"([^"]*)"/g)) hls.add(h[1]);
  }
}
const distList = [...dists];
const hlList = [...hls];

async function translate(list, kind) {
  const out = {};
  for (let i = 0; i < list.length; i += 40) {
    const chunk = list.slice(i, i + 40);
    const numbered = chunk.map((s, j) => j + 1 + '. ' + s).join('\n');
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.DEEPSEEK_API_KEY },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Translate Chinese travel/hotel terms to natural English. Return ONLY a JSON object {"translations":[...]}, same count and order. For Chinese district names keep the official pinyin + " District" style (e.g. 朝阳区 -> Chaoyang District).' },
          { role: 'user', content: numbered },
        ],
        max_tokens: 3000,
        temperature: 0.2,
      }),
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200));
    const data = await resp.json();
    const content = data.choices[0].message.content;
    const arr = JSON.parse(content.match(/\{[\s\S]*\}/)[0]).translations.map((x) => typeof x === 'string' ? x : x.translation);
    chunk.forEach((s, j) => (out[s] = arr[j]));
    console.log(kind, 'progress', Math.min(i + 40, list.length), '/', list.length);
    await sleep(500);
  }
  return out;
}

const map = {
  districts: await translate(distList, 'district'),
  highlights: await translate(hlList, 'highlight'),
};
fs.writeFileSync('scripts/en-clean/hotel-map.json', JSON.stringify(map, null, 2), 'utf8');
console.log('districts:', distList.length, 'highlights:', hlList.length);
