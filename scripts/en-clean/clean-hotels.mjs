// Clean Chinese from src/data/hotels/*-hotels.ts (district/address/highlights) -> English.
import fs from 'node:fs';
import path from 'node:path';

const HOTELS_DIR = 'src/data/hotels';
const map = JSON.parse(fs.readFileSync('scripts/en-clean/hotel-map.json', 'utf8'));
const districts = map.districts;
const highlights = map.highlights;
const CJK = /[\u3400-\u9fff]/;

const cityMap = {};
for (const f of fs.readdirSync('src/data/cities').filter((x) => x.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join('src/data/cities', f), 'utf8'));
  if (d.name && d.nameEn) cityMap[d.name] = d.nameEn;
}

const STREET = { '\u8def': 'Road', '\u8857': 'Street', '\u5927\u9053': 'Avenue', '\u9053': 'Road', '\u5df7': 'Lane' };

function translateAddress(addr) {
  const m = addr.match(/^(.+?)(\d+)\u53f7$/);
  if (!m) {
    if (districts[addr]) return districts[addr];
    return addr;
  }
  const phrase = m[1];
  const num = m[2];
  if (districts[phrase]) return 'No. ' + num + ', ' + districts[phrase];
  const sm = phrase.match(/^(.+?)(\u8def|\u8857|\u5927\u9053|\u9053|\u5df7)$/);
  if (sm) {
    const cityEn = cityMap[sm[1]] || sm[1];
    return 'No. ' + num + ', ' + cityEn + ' ' + STREET[sm[2]];
  }
  return 'No. ' + num + ', ' + phrase;
}

let filesChanged = 0;
let fieldsChanged = 0;
let remainingCJK = 0;
for (const f of fs.readdirSync(HOTELS_DIR).filter((x) => x.endsWith('-hotels.ts'))) {
  const file = path.join(HOTELS_DIR, f);
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  let fc = 0;
  s = s.replace(/district: "([^"]*)"/g, (whole, v) => {
    if (!CJK.test(v)) return whole;
    const t = districts[v];
    if (!t || t === v) return whole;
    fc++;
    return 'district: "' + t + '"';
  });
  s = s.replace(/address: "([^"]*)"/g, (whole, v) => {
    if (!CJK.test(v)) return whole;
    const t = translateAddress(v);
    if (!t || t === v) return whole;
    fc++;
    return 'address: "' + t + '"';
  });
  s = s.replace(/highlights: \[([\s\S]*?)\]/g, (whole, body) => {
    let changed = false;
    const rebuilt = body.replace(/"([^"]*)"/g, (q, v) => {
      if (!CJK.test(v)) return q;
      const t = highlights[v];
      if (!t || t === v) return q;
      changed = true;
      return '"' + t + '"';
    });
    if (!changed) return whole;
    fc++;
    return 'highlights: [' + rebuilt + ']';
  });
  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    filesChanged++;
    fieldsChanged += fc;
  }
  const remain = s.match(/[\u3400-\u9fff]/g);
  if (remain) {
    remainingCJK += remain.length;
    console.log('REMAINING CJK in', f, ':', remain.length);
  }
}
console.log('files changed:', filesChanged, 'fields changed:', fieldsChanged, 'remaining CJK chars:', remainingCJK);
