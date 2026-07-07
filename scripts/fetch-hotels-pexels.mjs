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
const path = await import('path');
const files = fs.readdirSync('src/data/hotels').filter(f => f.endsWith('-hotels.ts'));

for (const file of files) {
  console.log(`\n=== ${file} ===`);
  const fp = `src/data/hotels/${file}`;
  const content = fs.readFileSync(fp, 'utf8');
  // crude parse - find image: lines
  const lines = content.split('\n');
  let city = file.replace('-hotels.ts', '');
  let updated = 0, failed = 0;
  let hotelName = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) hotelName = nameMatch[1];
    const imgMatch = line.match(/image:\s*['"]([^'"]+)['"]/);
    if (imgMatch && imgMatch[1].includes('pexels')) continue;
    if (imgMatch && !imgMatch[1].includes('pexels')) {
      // Replace this line
      const q = `${city} ${hotelName} hotel interior`;
      const url = await fetchWithRetry(q);
      if (url) {
        lines[i] = line.replace(imgMatch[0], `image: "${url}"`);
        updated++;
      } else {
        failed++;
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  fs.writeFileSync(fp, lines.join('\n'));
  console.log(`  Updated ${updated}, failed ${failed}`);
}
console.log('\nDone.');
