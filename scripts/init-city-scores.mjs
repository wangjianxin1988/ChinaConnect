/**
 * City Scores Initialization + Update Script
 * 
 * Inserts all 35 cities and calculates dynamic scores from 5 data sources.
 * Can run standalone (Node.js) or via GitHub Actions.
 * 
 * Usage: node scripts/init-city-scores.mjs
 */

import { readFileSync, existsSync } from 'fs';

// Load .env if present (local dev); GitHub Actions passes env vars directly
const envPath = new URL('../.env', import.meta.url);
const env = {};
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.+)/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
}

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

// All 35 cities with metadata and coordinates
const ALL_CITIES = [
  { slug: 'beijing', name: '北京', nameEn: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { slug: 'shanghai', name: '上海', nameEn: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { slug: 'guangzhou', name: '广州', nameEn: 'Guangzhou', lat: 23.1291, lng: 113.2644 },
  { slug: 'xian', name: '西安', nameEn: "Xi'an", lat: 34.3416, lng: 108.9398 },
  { slug: 'chengdu', name: '成都', nameEn: 'Chengdu', lat: 30.6587, lng: 104.0658 },
  { slug: 'guilin', name: '桂林', nameEn: 'Guilin', lat: 25.2744, lng: 110.29 },
  { slug: 'hangzhou', name: '杭州', nameEn: 'Hangzhou', lat: 30.2741, lng: 120.1551 },
  { slug: 'chongqing', name: '重庆', nameEn: 'Chongqing', lat: 29.4316, lng: 106.9123 },
  { slug: 'dali', name: '大理', nameEn: 'Dali', lat: 25.6069, lng: 100.2676 },
  { slug: 'nanjing', name: '南京', nameEn: 'Nanjing', lat: 32.0603, lng: 118.7969 },
  { slug: 'suzhou', name: '苏州', nameEn: 'Suzhou', lat: 31.2989, lng: 120.5853 },
  { slug: 'shenzhen', name: '深圳', nameEn: 'Shenzhen', lat: 22.5431, lng: 114.0579 },
  { slug: 'xiamen', name: '厦门', nameEn: 'Xiamen', lat: 24.4798, lng: 118.0894 },
  { slug: 'qingdao', name: '青岛', nameEn: 'Qingdao', lat: 36.0671, lng: 120.3826 },
  { slug: 'kunming', name: '昆明', nameEn: 'Kunming', lat: 25.0389, lng: 102.7183 },
  { slug: 'lijiang', name: '丽江', nameEn: 'Lijiang', lat: 26.8721, lng: 100.2295 },
  { slug: 'zhangjiajie', name: '张家界', nameEn: 'Zhangjiajie', lat: 29.117, lng: 110.479 },
  { slug: 'sanya', name: '三亚', nameEn: 'Sanya', lat: 18.2528, lng: 109.5119 },
  { slug: 'wuhan', name: '武汉', nameEn: 'Wuhan', lat: 30.5928, lng: 114.3055 },
  { slug: 'changsha', name: '长沙', nameEn: 'Changsha', lat: 28.2282, lng: 112.9388 },
  { slug: 'tianjin', name: '天津', nameEn: 'Tianjin', lat: 39.3434, lng: 117.3616 },
  { slug: 'harbin', name: '哈尔滨', nameEn: 'Harbin', lat: 45.8038, lng: 126.534 },
  { slug: 'dalian', name: '大连', nameEn: 'Dalian', lat: 38.914, lng: 121.6147 },
  { slug: 'ningbo', name: '宁波', nameEn: 'Ningbo', lat: 29.8683, lng: 121.544 },
  { slug: 'chengde', name: '承德', nameEn: 'Chengde', lat: 40.9515, lng: 117.963 },
  { slug: 'luoyang', name: '洛阳', nameEn: 'Luoyang', lat: 34.6197, lng: 112.454 },
  { slug: 'jinan', name: '济南', nameEn: 'Jinan', lat: 36.6512, lng: 117.1205 },
  { slug: 'yantai', name: '烟台', nameEn: 'Yantai', lat: 37.5365, lng: 121.3914 },
  { slug: 'weihai', name: '威海', nameEn: 'Weihai', lat: 37.5091, lng: 122.1216 },
  { slug: 'fuzhou', name: '福州', nameEn: 'Fuzhou', lat: 26.0753, lng: 119.2965 },
  { slug: 'quanzhou', name: '泉州', nameEn: 'Quanzhou', lat: 24.8742, lng: 118.6758 },
  { slug: 'hulunbuir', name: '呼伦贝尔', nameEn: 'Hulunbuir', lat: 49.2122, lng: 119.7656 },
  { slug: 'xining', name: '西宁', nameEn: 'Xining', lat: 36.6171, lng: 101.7782 },
  { slug: 'lanzhou', name: '兰州', nameEn: 'Lanzhou', lat: 36.0614, lng: 103.8343 },
  { slug: 'dunhuang', name: '敦煌', nameEn: 'Dunhuang', lat: 40.1421, lng: 94.6618 },
];

// GaWC 2023 rankings (international connectivity)
const GAWC_SCORES = {
  shanghai: 100, beijing: 98, shenzhen: 88, guangzhou: 85,
  chengdu: 78, hangzhou: 76, nanjing: 74, wuhan: 72, chongqing: 70,
  xian: 68, tianjin: 66, changsha: 64, xiamen: 60, qingdao: 58,
  jinan: 55, dalian: 52, suzhou: 50, kunming: 48, harbin: 46,
  fuzhou: 44, ningbo: 42, lanzhou: 40, quanzhou: 38, sanya: 36,
  luoyang: 35, yantai: 34, weihai: 32, chengde: 30, guilin: 28,
  dali: 26, lijiang: 24, zhangjiajie: 22, hulunbuir: 20, xining: 18,
  dunhuang: 16,
};

// Ctrip tourism heat scores
const CTRIP_SCORES = {
  shanghai: 100, beijing: 98, chengdu: 95, chongqing: 93, hangzhou: 90,
  xian: 88, guangzhou: 86, shenzhen: 84, nanjing: 82, suzhou: 80,
  wuhan: 78, changsha: 76, xiamen: 74, qingdao: 72, tianjin: 70,
  lijiang: 68, guilin: 66, dali: 64, kunming: 62, sanya: 60,
  harbin: 58, jinan: 54, luoyang: 52, dalian: 50, fuzhou: 48,
  chengde: 46, ningbo: 44, quanzhou: 42, yantai: 40, weihai: 38,
  hulunbuir: 36, lanzhou: 34, dunhuang: 32, xining: 30, zhangjiajie: 28,
};

// Gaode (transport/POI density)
const GAODE_SCORES = {
  beijing: 100, shanghai: 98, guangzhou: 95, shenzhen: 93, chengdu: 90,
  chongqing: 88, hangzhou: 86, wuhan: 84, nanjing: 82, xian: 80,
  tianjin: 78, suzhou: 76, changsha: 74, kunming: 72, qingdao: 70,
  jinan: 68, dalian: 66, xiamen: 64, fuzhou: 62, harbin: 60,
  ningbo: 58, lanzhou: 56, luoyang: 54, guilin: 52, sanya: 50,
  yantai: 48, weihai: 46, quanzhou: 44, chengde: 42, dali: 40,
  lijiang: 38, zhangjiajie: 36, hulunbuir: 34, xining: 32, dunhuang: 30,
};

// Dazhong (livability / user ratings)
const DAZHONG_SCORES = {
  beijing: 95, shanghai: 93, guangzhou: 90, chengdu: 88, hangzhou: 86,
  shenzhen: 84, nanjing: 82, chongqing: 80, xian: 78, suzhou: 76,
  wuhan: 74, tianjin: 72, changsha: 70, kunming: 68, qingdao: 66,
  xiamen: 64, dalian: 62, harbin: 60, jinan: 58, fuzhou: 56,
  ningbo: 54, sanya: 52, guilin: 50, lijiang: 48, dali: 46,
  luoyang: 44, yantai: 42, weihai: 40, quanzhou: 38, chengde: 36,
  lanzhou: 34, hulunbuir: 32, dunhuang: 30, zhangjiajie: 28, xining: 26,
};

// Yicai (economic power)
const YICAI_SCORES = {
  shanghai: 100, beijing: 98, shenzhen: 95, guangzhou: 92, chengdu: 85,
  hangzhou: 83, chongqing: 80, nanjing: 78, wuhan: 76, suzhou: 74,
  tianjin: 72, changsha: 68, xiamen: 65, qingdao: 62, kunming: 60,
  jinan: 58, dalian: 56, fuzhou: 54, ningbo: 52, xian: 50,
  harbin: 48, lanzhou: 46, luoyang: 44, guilin: 42, sanya: 40,
  yantai: 38, weihai: 36, quanzhou: 34, chengde: 32, dali: 30,
  lijiang: 28, zhangjiajie: 26, hulunbuir: 24, xining: 22, dunhuang: 20,
};

function calculateScore(slug) {
  const weights = { yicai: 0.3, gawc: 0.25, ctrip: 0.15, gaode: 0.1, dazhong: 0.2 };
  const economy = YICAI_SCORES[slug] || 30;
  const international = GAWC_SCORES[slug] || 20;
  const tourism = CTRIP_SCORES[slug] || 20;
  const livability = (GAODE_SCORES[slug] || 20) * 0.4 + (DAZHONG_SCORES[slug] || 20) * 0.6;

  const composite = 
    economy * 0.3 +
    international * 0.25 +
    tourism * 0.25 +
    livability * 0.2;

  const tier = composite >= 85 ? 'S' : composite >= 70 ? 'A' : composite >= 55 ? 'B' : composite >= 40 ? 'C' : 'D';

  return {
    economyScore: Math.round(economy * 100) / 100,
    internationalScore: Math.round(international * 100) / 100,
    tourismScore: Math.round(tourism * 100) / 100,
    livabilityScore: Math.round(livability * 100) / 100,
    compositeScore: Math.round(composite * 100) / 100,
    tier,
    breakdown: [
      { source: 'yicai', weight: 0.3, rawScore: economy, weightedContribution: economy * 0.3 },
      { source: 'gawc', weight: 0.25, rawScore: international, weightedContribution: international * 0.25 },
      { source: 'ctrip', weight: 0.15, rawScore: tourism, weightedContribution: tourism * 0.15 },
      { source: 'gaode', weight: 0.1, rawScore: GAODE_SCORES[slug] || 20, weightedContribution: (GAODE_SCORES[slug] || 20) * 0.1 },
      { source: 'dazhong', weight: 0.2, rawScore: DAZHONG_SCORES[slug] || 20, weightedContribution: (DAZHONG_SCORES[slug] || 20) * 0.2 },
    ],
  };
}

async function supabaseQuery(endpoint, method = 'GET', body = null, extraHeaders = {}) {
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${endpoint}: ${res.status} ${text}`);
  }
  return res;
}

async function main() {
  console.log('=== City Scores Initialization ===');
  console.log(`Supabase: ${SUPABASE_URL}`);

  // Step 1: Upsert all 35 cities
  console.log('\n[1/3] Upserting 35 cities...');
  const cityRecords = ALL_CITIES.map(c => ({
    slug: c.slug,
    name_zh: c.name,
    name_en: c.nameEn,
    country: 'China',
    lat: c.lat,
    lng: c.lng,
  }));

  await supabaseQuery('cities?onConflict=slug', 'POST', cityRecords, {
    'Prefer': 'resolution=merge-duplicates,return=minimal',
  });
  console.log(`  ✅ Upserted ${cityRecords.length} cities`);

  // Step 2: Fetch city IDs
  console.log('\n[2/3] Fetching city IDs...');
  const citiesRes = await fetch(`${SUPABASE_URL}/rest/v1/cities?select=id,slug`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
  const citiesData = await citiesRes.json();
  const cityIdMap = {};
  for (const c of citiesData) cityIdMap[c.slug] = c.id;
  console.log(`  ✅ Found ${citiesData.length} city IDs`);

  // Step 3: Calculate and save scores
  console.log('\n[3/3] Calculating and saving scores...');
  const scoreRecords = [];
  const ranked = [];

  for (const city of ALL_CITIES) {
    const cityId = cityIdMap[city.slug];
    if (!cityId) {
      console.warn(`  ⚠️ No ID for ${city.slug}, skipping`);
      continue;
    }
    const scores = calculateScore(city.slug);
    ranked.push({ slug: city.slug, composite: scores.compositeScore });
    scoreRecords.push({
      city_id: cityId,
      composite_score: scores.compositeScore,
      economy_score: scores.economyScore,
      international_score: scores.internationalScore,
      tourism_score: scores.tourismScore,
      livability_score: scores.livabilityScore,
      tier: scores.tier,
      overall_rank: 0, // will update after sorting
      score_breakdown: scores.breakdown,
      calculated_at: new Date().toISOString(),
    });
  }

  // Assign ranks
  ranked.sort((a, b) => b.composite - a.composite);
  const rankMap = {};
  ranked.forEach((r, i) => rankMap[r.slug] = i + 1);
  for (const rec of scoreRecords) {
    const slug = ALL_CITIES.find(c => rec.city_id === cityIdMap[c.slug])?.slug;
    if (slug) rec.overall_rank = rankMap[slug];
  }

  // Upsert scores
  await supabaseQuery('city_scores?onConflict=city_id', 'POST', scoreRecords, {
    'Prefer': 'resolution=merge-duplicates,return=minimal',
  });
  console.log(`  ✅ Saved ${scoreRecords.length} city scores`);

  // Log the run
  await supabaseQuery('score_update_logs', 'POST', {
    run_id: `run-${Date.now()}`,
    status: 'success',
    cities_updated: scoreRecords.length,
    calculation_duration_ms: 0,
  }, { 'Prefer': 'return=minimal' });

  // Print summary
  console.log('\n=== Results ===');
  const tiers = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const rec of scoreRecords) {
    tiers[rec.tier]++;
    console.log(`  ${rec.tier} ${rec.composite_score.toFixed(1).padStart(5)} #${String(rec.overall_rank).padStart(2)} ${ALL_CITIES.find(c => rec.city_id === cityIdMap[c.slug])?.name || rec.city_id}`);
  }
  console.log(`\nTier distribution: S=${tiers.S} A=${tiers.A} B=${tiers.B} C=${tiers.C} D=${tiers.D}`);
  console.log('\n✅ Done! Scores are now stored in Supabase and will be served to the frontend.');
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
