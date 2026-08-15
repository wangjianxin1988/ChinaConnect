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

// Deep merge: existing (per-language file) wins over base for fields it has;
// base supplies new/added fields. Arrays are merged positionally; when both
// sides have objects with matching "id", they are merged recursively.
function deepMerge(base, existing) {
  if (Array.isArray(base) && Array.isArray(existing)) {
    return existing.map((ev, i) => {
      const bv = base[i];
      if (ev && bv && typeof ev === 'object' && typeof bv === 'object') {
        if (ev.id !== undefined && bv.id !== undefined && ev.id !== bv.id) return ev;
        return deepMerge(bv, ev);
      }
      return ev !== undefined ? ev : bv;
    });
  }
  if (base && existing && typeof base === 'object' && typeof existing === 'object') {
    const out = {};
    for (const k of new Set([...Object.keys(base), ...Object.keys(existing)])) {
      if (k in base && k in existing && base[k] && existing[k] && typeof base[k] === 'object' && typeof existing[k] === 'object') {
        out[k] = deepMerge(base[k], existing[k]);
      } else if (k in existing) {
        out[k] = existing[k];
      } else {
        out[k] = base[k];
      }
    }
    return out;
  }
  return existing !== undefined ? existing : base;
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
    // Preserve existing per-language translations: merge base onto the current
    // lang file so already-translated values are never reverted to the base
    // (Chinese/English) source by a rebuild.
    const existingFile = join(langDir, slug + '.json');
    let base = d;
    if (existsSync(existingFile)) {
      try { base = JSON.parse(readFileSync(existingFile, 'utf8')); } catch {}
    }
    const merged = deepMerge(d, base);

    // City-level — tr values only fill fields still holding the base value.
    if (merged.description && merged.description === d.description) {
      const v = tr['city.' + slug + '.description'];
      if (v) merged.description = v;
    }
    if (merged.culturalTips) {
      merged.culturalTips = merged.culturalTips.map((t, i) => {
        const m = { ...t };
        const b = d.culturalTips ? d.culturalTips[i] : undefined;
        const translatedContent = tr['city.' + slug + '.culturalTip.' + i];
        if (translatedContent && m.content === (b ? b.content : undefined)) m.content = translatedContent;
        const translatedTitle = tr['city.' + slug + '.culturalTip.' + i + '.title'];
        if (translatedTitle && m.title === (b ? b.title : undefined)) m.title = translatedTitle;
        return m;
      });
    }
    if (merged.highlights) {
      merged.highlights = merged.highlights.map((t, i) => (t === d.highlights[i] ? (tr['city.' + slug + '.highlight.' + i] || t) : t));
    }
    if (merged.climate) {
      if (merged.climate.tips && merged.climate.tips === d.climate.tips) {
        const v = tr['city.' + slug + '.climate.tips'];
        if (v) merged.climate.tips = v;
      }
      if (merged.climate.type && merged.climate.type === d.climate.type) {
        const v = tr['city.' + slug + '.climate.type'];
        if (v) merged.climate.type = v;
      }
      if (Array.isArray(merged.climate.bestMonths)) {
        merged.climate.bestMonths = merged.climate.bestMonths.map((t, i) => (t === d.climate.bestMonths[i] ? (tr['city.' + slug + '.climate.bestMonths.' + i] || t) : t));
      }
    }
    if (merged.population && merged.population === d.population) {
      const v = tr['city.' + slug + '.population'];
      if (v) merged.population = v;
    }
    if (merged.quickFacts) {
      for (const k of Object.keys(merged.quickFacts)) {
        if (typeof merged.quickFacts[k] === 'string' && merged.quickFacts[k] === (d.quickFacts ? d.quickFacts[k] : undefined)) {
          const v = tr['city.' + slug + '.fact.' + k];
          if (v) merged.quickFacts[k] = v;
        }
      }
    }

    // Attractions
    if (merged.attractions) {
      merged.attractions = merged.attractions.map(a => {
        const m = { ...a };
        const baseAttr = (d.attractions || []).find((x) => x.id === a.id);
        for (const k of ['nameEn', 'description', 'address', 'openingHours', 'ticketPrice', 'tips', 'recommendedVisitTime', 'name', 'category']) {
          if (m[k] && (!baseAttr || m[k] === baseAttr[k])) {
            const v = tr['attr.' + a.id + '.' + k];
            if (v) m[k] = v;
          }
        }
        if (m.highlights && baseAttr) {
          const baseHighlights = baseAttr.highlights || baseAttr.highopts || [];
          m.highlights = m.highlights.map((h, i) => (h === baseHighlights[i] ? (tr['attr.' + a.id + '.highlight.' + i] || h) : h));
        }
        return m;
      });
    }

    // Restaurants
    if (merged.restaurants) {
      merged.restaurants = merged.restaurants.map(r => {
        const m = { ...r };
        const baseRest = (d.restaurants || []).find((x) => x.id === r.id);
        for (const k of ['nameEn', 'name', 'cuisine', 'address', 'hours', 'description', 'type']) {
          if (m[k] && (!baseRest || m[k] === baseRest[k])) {
            const v = tr['rest.' + r.id + '.' + k];
            if (v) m[k] = v;
          }
        }
        if (m.dishHighlights && baseRest) {
          m.dishHighlights = m.dishHighlights.map((h, i) => (h === baseRest.dishHighlights[i] ? (tr['rest.' + r.id + '.dish.' + i] || h) : h));
        }
        if (m.tags && baseRest) {
          m.tags = m.tags.map((t, i) => (t === baseRest.tags[i] ? (tr['rest.' + r.id + '.tag.' + i] || t) : t));
        }
        return m;
      });
    }

    // Emergency
    if (merged.emergencyContacts) {
      merged.emergencyContacts = merged.emergencyContacts.map(e => {
        const m = { ...e };
        const eid = e.name ? e.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : e.phone;
        const baseEmer = (d.emergencyContacts || []).find((x) => (x.name ? x.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : x.phone) === eid);
        for (const k of ['nameEn', 'address', 'notes', 'name']) {
          if (m[k] && (!baseEmer || m[k] === baseEmer[k])) {
            const v = tr['emergency.' + eid + '.' + k];
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
