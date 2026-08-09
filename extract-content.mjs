import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
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

const files = walk('src/data/cities').sort();
const out = {};
let count = 0;
for (const f of files) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  const slug = d.slug;
  // City-level strings (always string)
  if (d.description) { out[`city.${slug}.description`] = d.description; count++; }
  // Climate is an object - keep English-only for sub-fields (temps, months)
  // Cultural tips
  if (d.culturalTips) for (let i = 0; i < d.culturalTips.length; i++) if (d.culturalTips[i]) { const tipContent = d.culturalTips[i].content || d.culturalTips[i]; out[`city.${slug}.culturalTip.${i}`] = typeof tipContent === "string" ? tipContent : JSON.stringify(tipContent); count++; }
  // Highlights
  if (d.highlights) for (let i = 0; i < d.highlights.length; i++) if (d.highlights[i]) { out[`city.${slug}.highlight.${i}`] = d.highlights[i]; count++; }
  // Quick facts (label only)
  if (d.quickFacts && Array.isArray(d.quickFacts)) for (const f2 of d.quickFacts) if (f2 && f2.label) { out[`city.${slug}.fact.${f2.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`] = f2.label + "|" + (f2.value || ""); count++; }
  // Attractions
  for (const a of d.attractions || []) {
    const aid = a.id;
    for (const k of ['nameEn', 'description', 'address', 'openingHours', 'ticketPrice', 'tips', 'recommendedVisitTime']) {
      if (a[k] && typeof a[k] === 'string') { out[`attr.${aid}.${k}`] = a[k]; count++; }
    }
    if (a.highlights) for (let i = 0; i < a.highlights.length; i++) if (a.highlights[i]) { out[`attr.${aid}.highlight.${i}`] = a.highlights[i]; count++; }
  }
  // Restaurants
  for (const r of d.restaurants || []) {
    const rid = r.id;
    for (const k of ['nameEn', 'cuisine', 'address', 'hours', 'description']) {
      if (r[k] && typeof r[k] === 'string') { out[`rest.${rid}.${k}`] = r[k]; count++; }
    }
    if (r.dishHighlights) for (let i = 0; i < r.dishHighlights.length; i++) if (r.dishHighlights[i]) { out[`rest.${rid}.dish.${i}`] = r.dishHighlights[i]; count++; }
    if (r.tags) for (let i = 0; i < r.tags.length; i++) if (r.tags[i]) { out[`rest.${rid}.tag.${i}`] = r.tags[i]; count++; }
  }
  // Emergency
  for (const e of d.emergencyContacts || []) {
    const eid = e.name ? e.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : e.phone;
    for (const k of ['nameEn', 'address', 'notes']) {
      if (e[k] && typeof e[k] === 'string') { out[`emergency.${eid}.${k}`] = e[k]; count++; }
    }
  }
  // Hotels
  for (const h of d.hotels || []) {
    const hid = h.id || h.nameEn;
    for (const k of ['nameEn', 'description', 'address']) {
      if (h[k] && typeof h[k] === 'string') { out[`hotel.${hid}.${k}`] = h[k]; count++; }
    }
  }
}
console.log('extracted', count, 'strings from', files.length, 'cities');
writeFileSync('content-en.json', JSON.stringify(out, null, 2), 'utf8');
console.log('wrote content-en.json,', Object.keys(out).length, 'keys');