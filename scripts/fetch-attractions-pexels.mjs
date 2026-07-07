const PEXELS_KEY = 'REDACTED_PEXELS_KEY';

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const resp = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data.photos || data.photos.length === 0) return null;
  return data.photos[0].src.large;
}

async function fetchWithRetry(query, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const r = await searchPexels(query);
    if (r) return r;
    await new Promise(r => setTimeout(r, 3000 + i * 1500));
  }
  return null;
}

const fs = await import('fs');
const cities = ['chengdu', 'guangzhou'];

for (const city of cities) {
  console.log(`\n=== ${city} attractions retry ===`);
  const data = JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`, 'utf8'));
  let updated = 0, failed = 0;

  for (const a of data.attractions) {
    if (a.image && a.image.includes('pexels')) continue;
    const q = `${city} ${a.nameEn}`;
    process.stdout.write(`  attr "${a.nameEn}"... `);
    const url = await fetchWithRetry(q);
    if (url) {
      a.image = url;
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
