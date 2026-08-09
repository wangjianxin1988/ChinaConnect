import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const LANGS = ['ja', 'ko', 'th', 'vi', 'ru', 'fr', 'de', 'ar', 'fa', 'zh-CN', 'zh-TW'];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.json')) out.push(p);
  }
  return out;
}

const srcDir = 'src/data/cities';
const outDir = 'src/data/cities-i18n';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const files = walk(srcDir).sort();

for (const lang of LANGS) {
  const trFile = 'content-' + lang + '.json';
  if (!existsSync(trFile)) { console.log('skip', lang, '(no translation file)'); continue; }
  const tr = JSON.parse(readFileSync(trFile, 'utf8'));
  const langDir = join(outDir, lang);
  if (!existsSync(langDir)) mkdirSync(langDir, { recursive: true });

  for (const f of files) {
    const d = JSON.parse(readFileSync(f, 'utf8'));
    const slug = d.slug;
    const merged = JSON.parse(JSON.stringify(d));

    // City-level
    if (merged.description) {
      const v = tr[`city.${slug}.description`];
      if (v) merged.description = v;
    }
    if (merged.culturalTips) {
      merged.culturalTips = merged.culturalTips.map((t, i) => {
        const translatedContent = tr[`city.${slug}.culturalTip.${i}`];
        if (translatedContent && typeof t === 'object') {
          return { ...t, content: translatedContent };
        }
        return t;
      });
    }
    if (merged.highlights) {
      merged.highlights = merged.highlights.map((t, i) => tr[`city.${slug}.highlight.${i}`] || t);
    }
    if (merged.climate) {
      if (merged.climate.tips) {
        const v = tr[`city.${slug}.climate.tips`];
        if (v) merged.climate.tips = v;
      }
      if (merged.climate.type) {
        const v = tr[`city.${slug}.climate.type`];
        if (v) merged.climate.type = v;
      }
    }
    if (merged.quickFacts) {
      for (const k of Object.keys(merged.quickFacts)) {
        if (typeof merged.quickFacts[k] === 'string') {
          const v = tr[`city.${slug}.fact.${k}`];
          if (v) merged.quickFacts[k] = v;
        }
      }
    }

    // Attractions
    if (merged.attractions) {
      merged.attractions = merged.attractions.map(a => {
        const m = { ...a };
        for (const k of ['nameEn', 'description', 'address', 'openingHours', 'ticketPrice', 'tips', 'recommendedVisitTime', 'name', 'category']) {
          if (m[k]) {
            const v = tr[`attr.${a.id}.${k}`];
            if (v) m[k] = v;
          }
        }
        if (m.highlights) {
          m.highlights = m.highlights.map((h, i) => tr[`attr.${a.id}.highlight.${i}`] || h);
        }
        return m;
      });
    }

    // Restaurants
    if (merged.restaurants) {
      merged.restaurants = merged.restaurants.map(r => {
        const m = { ...r };
        for (const k of ['nameEn', 'name', 'cuisine', 'address', 'hours', 'description', 'type']) {
          if (m[k]) {
            const v = tr[`rest.${r.id}.${k}`];
            if (v) m[k] = v;
          }
        }
        if (m.dishHighlights) {
          m.dishHighlights = m.dishHighlights.map((h, i) => tr[`rest.${r.id}.dish.${i}`] || h);
        }
        if (m.tags) {
          m.tags = m.tags.map((t, i) => tr[`rest.${r.id}.tag.${i}`] || t);
        }
        return m;
      });
    }

    // Emergency
    if (merged.emergencyContacts) {
      merged.emergencyContacts = merged.emergencyContacts.map(e => {
        const m = { ...e };
        const eid = e.name ? e.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : e.phone;
        for (const k of ['nameEn', 'address', 'notes', 'name']) {
          if (m[k]) {
            const v = tr[`emergency.${eid}.${k}`];
            if (v) m[k] = v;
          }
        }
        return m;
      });
    }

    const outFile = join(langDir, slug + '.json');
    writeFileSync(outFile, JSON.stringify(merged, null, 2), 'utf8');
  }
  console.log(lang + ' done');
}
console.log('all langs written to ' + outDir);
