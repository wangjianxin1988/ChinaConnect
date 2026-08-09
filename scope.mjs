import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

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

// Count strings to translate in city data
const files = walk('src/data/cities');
let totalStrings = 0;
let totalChars = 0;
const stringList = [];
for (const f of files) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  const slug = d.slug;
  // City-level
  for (const k of ['description', 'climate']) {
    if (d[k]) { totalStrings++; totalChars += d[k].length; stringList.push({ slug, type: 'city', key: k, text: d[k] }); }
  }
  if (d.highlights && Array.isArray(d.highlights)) {
    for (let i = 0; i < d.highlights.length; i++) {
      if (d.highlights[i]) { totalStrings++; totalChars += d.highlights[i].length; stringList.push({ slug, type: 'highlights', idx: i, text: d.highlights[i] }); }
    }
  }
  // Attractions
  for (const a of d.attractions || []) {
    for (const k of ['nameEn', 'description', 'address', 'openingHours', 'ticketPrice', 'tips', 'recommendedVisitTime']) {
      if (a[k]) { totalStrings++; totalChars += a[k].length; stringList.push({ slug, type: 'attr', id: a.id, key: k, text: a[k] }); }
    }
    if (a.highlights) for (const h of a.highlights) if (h) { totalStrings++; totalChars += h.length; stringList.push({ slug, type: 'attr-highlight', id: a.id, text: h }); }
  }
  // Restaurants
  for (const r of d.restaurants || []) {
    for (const k of ['nameEn', 'cuisine', 'address', 'hours', 'description']) {
      if (r[k]) { totalStrings++; totalChars += r[k].length; stringList.push({ slug, type: 'rest', id: r.id, key: k, text: r[k] }); }
    }
    if (r.dishHighlights) for (const h of r.dishHighlights) if (h) { totalStrings++; totalChars += h.length; stringList.push({ slug, type: 'dish', id: r.id, text: h }); }
    if (r.tags) for (const t of r.tags) if (t) { totalStrings++; totalChars += t.length; stringList.push({ slug, type: 'tag', id: r.id, text: t }); }
  }
  // Emergency contacts
  for (const e of d.emergencyContacts || []) {
    for (const k of ['nameEn', 'address', 'notes']) {
      if (e[k]) { totalStrings++; totalChars += e[k].length; stringList.push({ slug, type: 'emergency', id: e.name, key: k, text: e[k] }); }
    }
  }
  // Cultural tips
  if (d.culturalTips && Array.isArray(d.culturalTips)) {
    for (const t of d.culturalTips) if (t) { totalStrings++; totalChars += t.length; stringList.push({ slug, type: 'tip', text: t }); }
  }
  // Quick facts
  if (d.quickFacts && Array.isArray(d.quickFacts)) {
    for (const f2 of d.quickFacts) if (f2 && f2.label) { totalStrings++; totalChars += f2.label.length; stringList.push({ slug, type: 'fact-label', text: f2.label }); }
  }
}
console.log('total strings:', totalStrings);
console.log('total chars:', totalChars);
console.log('per language (12 langs):', totalChars * 11); // excluding en source
console.log('sample first 5:', JSON.stringify(stringList.slice(0, 5), null, 2));