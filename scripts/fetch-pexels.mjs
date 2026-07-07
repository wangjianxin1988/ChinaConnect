// Fetch precise Pexels images for each city card
const PEXELS_KEY = 'REDACTED_PEXELS_KEY';

async function searchPexels(query, perPage = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  const resp = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!resp.ok) throw new Error(`Pexels ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  if (!data.photos || data.photos.length === 0) return null;
  return data.photos[0].src.large;
}

async function fetchWithRetry(query, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const url = await searchPexels(query, 1);
      if (url) return url;
    } catch (e) {
      console.error(`  attempt ${i+1} failed: ${e.message.slice(0,80)}`);
    }
    await new Promise(r => setTimeout(r, 800));
  }
  return null;
}

const fs = await import('fs');
const path = await import('path');

const cities = ['beijing', 'shanghai', 'chengdu', 'guangzhou'];
const results = {};

for (const city of cities) {
  console.log(`\n=== ${city} ===`);
  const data = JSON.parse(fs.readFileSync(`src/data/cities/${city}.json`, 'utf8'));
  results[city] = { attractions: [], restaurants: [] };

  // Attractions
  for (const a of data.attractions) {
    const q = `${city} ${a.nameEn}`;
    process.stdout.write(`  attr "${a.nameEn}"... `);
    const url = await fetchWithRetry(q);
    if (url) {
      a.image = url;
      results[city].attractions.push({ name: a.nameEn, url });
      console.log('OK');
    } else {
      console.log('FAIL');
    }
    await new Promise(r => setTimeout(r, 350));
  }

  // Restaurants
  for (const r of data.restaurants) {
    const q = `${city} ${r.nameEn} restaurant food`;
    process.stdout.write(`  rest "${r.nameEn}"... `);
    const url = await fetchWithRetry(q);
    if (url) {
      r.image = url;
      results[city].restaurants.push({ name: r.nameEn, url });
      console.log('OK');
    } else {
      console.log('FAIL');
    }
    await new Promise(r => setTimeout(r, 350));
  }

  // Save updated city JSON
  fs.writeFileSync(`src/data/cities/${city}.json`, JSON.stringify(data, null, 2));
  console.log(`Saved ${city}.json`);
}

fs.writeFileSync('scripts/pexels-results.json', JSON.stringify(results, null, 2));
console.log('\nDone.');
