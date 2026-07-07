// Retry failed entries with longer delays
const PEXELS_KEY = 'REDACTED_PEXELS_KEY';

async function searchPexels(query, perPage = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  const resp = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!resp.ok) return { error: `Pexels ${resp.status}` };
  const data = await resp.json();
  if (!data.photos || data.photos.length === 0) return { error: 'no_photos' };
  return { url: data.photos[0].src.large };
}

async function fetchWithRetry(query, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const r = await searchPexels(query);
    if (r.url) return r.url;
    if (!r.error || !r.error.includes('429')) break;
    await new Promise(r => setTimeout(r, 3000 + i * 1500));
  }
  return null;
}

const fs = await import('fs');
const cities = ['chengdu', 'guangzhou'];

for (const city of cities) {
  console.log(`\n=== ${city} (retry) ===`);
  const data = JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`, 'utf8'));
  let updated = 0, failed = 0;

  for (const r of data.restaurants) {
    if (r.image && r.image.includes('pexels')) continue; // already done
    const q = `${city} ${r.nameEn} food`;
    process.stdout.write(`  rest "${r.nameEn}"... `);
    const url = await fetchWithRetry(q);
    if (url) {
      r.image = url;
      updated++;
      console.log('OK');
    } else {
      failed++;
      console.log('FAIL');
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`  Updated ${updated}, failed ${failed}`);
  fs.writeFileSync(`src/data/cities/${city}.json`, JSON.stringify(data, null, 2));
}
console.log('\nRetry done.');
