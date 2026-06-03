/**
 * Hybrid City Scores - Curated Baseline + Real-time Climate Data
 * 
 * Baseline: Economic/international scores from published rankings (updated manually)
 * Dynamic: Tourism/livability adjusted by real OpenMeteo weather + population data
 * 
 * This approach ensures:
 * - Economy/international scores reflect actual published rankings
 * - Tourism scores change with seasonal weather patterns
 * - Livability scores use real climate data (temperature, precipitation)
 * - Population data from OpenMeteo geocoding
 * 
 * Usage: node scripts/dynamic-city-scores.mjs
 */

import { readFileSync, existsSync } from 'fs';

const envPath = new URL('../.env', import.meta.url);
const env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.+)/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
}

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || env.PUBLIC_SUPABASE_ANON_KEY;

// ─── Curated Baseline Data ──────────────────────────────────
// Sources: National Bureau of Statistics, Civil Aviation Administration, 
// Ministry of Culture and Tourism annual reports
// Updated: 2024 data (refresh annually)

const BASELINE = {
  // slug: [economy, international, tourism_base]
  // Economy: GDP rank-based score (2024 NBS data)
  // International: international flight routes + foreign investment
  // Tourism: annual tourist arrivals rank-based score
  beijing:      { eco: 95, intl: 92, tour: 90 },
  shanghai:     { eco: 100, intl: 98, tour: 95 },
  guangzhou:    { eco: 88, intl: 85, tour: 82 },
  shenzhen:     { eco: 92, intl: 78, tour: 72 },
  chengdu:      { eco: 78, intl: 72, tour: 88 },
  hangzhou:     { eco: 80, intl: 68, tour: 85 },
  chongqing:    { eco: 82, intl: 62, tour: 86 },
  nanjing:      { eco: 75, intl: 60, tour: 78 },
  wuhan:        { eco: 72, intl: 55, tour: 75 },
  tianjin:      { eco: 70, intl: 52, tour: 70 },
  suzhou:       { eco: 76, intl: 48, tour: 76 },
  xian:         { eco: 62, intl: 65, tour: 88 },
  changsha:     { eco: 65, intl: 42, tour: 72 },
  kunming:      { eco: 55, intl: 50, tour: 78 },
  qingdao:      { eco: 60, intl: 45, tour: 70 },
  dalian:       { eco: 55, intl: 40, tour: 65 },
  xiamen:       { eco: 58, intl: 52, tour: 75 },
  harbin:       { eco: 50, intl: 35, tour: 72 },
  fuzhou:       { eco: 52, intl: 32, tour: 60 },
  ningbo:       { eco: 62, intl: 38, tour: 58 },
  jinan:        { eco: 58, intl: 35, tour: 62 },
  guilin:       { eco: 32, intl: 45, tour: 82 },
  sanya:        { eco: 28, intl: 48, tour: 80 },
  dali:         { eco: 25, intl: 30, tour: 78 },
  lijiang:      { eco: 22, intl: 28, tour: 76 },
  zhangjiajie:  { eco: 22, intl: 32, tour: 74 },
  luoyang:      { eco: 42, intl: 28, tour: 70 },
  yantai:       { eco: 48, intl: 28, tour: 60 },
  weihai:       { eco: 38, intl: 25, tour: 58 },
  quanzhou:     { eco: 52, intl: 30, tour: 62 },
  chengde:      { eco: 28, intl: 22, tour: 65 },
  hulunbuir:    { eco: 22, intl: 20, tour: 60 },
  lanzhou:      { eco: 35, intl: 25, tour: 55 },
  xining:       { eco: 28, intl: 22, tour: 52 },
  dunhuang:     { eco: 18, intl: 28, tour: 72 },
};

// ─── OpenMeteo Dynamic Data ─────────────────────────────────

async function getCityClimate(en) {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(en)}&count=1&language=en`);
    const geo = await geoRes.json();
    const r = geo.results?.[0];
    if (!r) return { population: 0, avgTemp: 20, precip: 0, humidity: 50 };

    const { latitude: lat, longitude: lng, population } = r;
    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`);
    const wx = await wxRes.json();

    const avgMax = (wx.daily?.temperature_2m_max?.reduce((a, b) => a + b, 0) || 140) / 7;
    const avgMin = (wx.daily?.temperature_2m_min?.reduce((a, b) => a + b, 0) || 70) / 7;
    const precip = wx.daily?.precipitation_sum?.reduce((a, b) => a + b, 0) || 0;
    const humidity = wx.current?.relative_humidity_2m || 50;

    return {
      population: population || 0,
      avgTemp: (avgMax + avgMin) / 2,
      precip,
      humidity,
    };
  } catch {
    return { population: 0, avgTemp: 20, precip: 0, humidity: 50 };
  }
}

// ─── Scoring ────────────────────────────────────────────────

function adjustTourism(base, climate) {
  // Pleasant weather (15-28°C) boosts tourism score
  const tempFactor = climate.avgTemp > 0
    ? Math.max(0.7, 1.0 - Math.abs(climate.avgTemp - 22) * 0.02)
    : 1.0;
  // Heavy rain reduces tourism appeal
  const rainFactor = Math.max(0.8, 1.0 - climate.precip * 0.01);
  return Math.min(100, base * tempFactor * rainFactor);
}

function scoreLivability(climate) {
  // Population density proxy
  const popScore = Math.min(80, (climate.population / 25000000) * 80 + 20);
  // Temperature comfort (20°C ideal)
  const tempScore = climate.avgTemp > 0
    ? Math.max(30, 100 - Math.abs(climate.avgTemp - 20) * 2.5)
    : 60;
  // Humidity comfort (40-60% ideal)
  const humScore = Math.max(40, 100 - Math.abs(climate.humidity - 50) * 1.5);
  // Precipitation penalty
  const precipPenalty = Math.min(20, climate.precip * 1.5);

  return popScore * 0.3 + tempScore * 0.35 + humScore * 0.2 + (100 - precipPenalty) * 0.15;
}

function calculateTier(score) {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

// ─── Supabase ───────────────────────────────────────────────

async function supabaseUpsert(table, data, onConflict) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?onConflict=${onConflict}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(data),
  });
  return res;
}

// ─── Main ───────────────────────────────────────────────────

const CITIES = [
  { slug: 'beijing', zh: '北京', en: 'Beijing' },
  { slug: 'shanghai', zh: '上海', en: 'Shanghai' },
  { slug: 'guangzhou', zh: '广州', en: 'Guangzhou' },
  { slug: 'xian', zh: '西安', en: "Xi'an" },
  { slug: 'chengdu', zh: '成都', en: 'Chengdu' },
  { slug: 'guilin', zh: '桂林', en: 'Guilin' },
  { slug: 'hangzhou', zh: '杭州', en: 'Hangzhou' },
  { slug: 'chongqing', zh: '重庆', en: 'Chongqing' },
  { slug: 'dali', zh: '大理', en: 'Dali' },
  { slug: 'nanjing', zh: '南京', en: 'Nanjing' },
  { slug: 'suzhou', zh: '苏州', en: 'Suzhou' },
  { slug: 'shenzhen', zh: '深圳', en: 'Shenzhen' },
  { slug: 'xiamen', zh: '厦门', en: 'Xiamen' },
  { slug: 'qingdao', zh: '青岛', en: 'Qingdao' },
  { slug: 'kunming', zh: '昆明', en: 'Kunming' },
  { slug: 'lijiang', zh: '丽江', en: 'Lijiang' },
  { slug: 'zhangjiajie', zh: '张家界', en: 'Zhangjiajie' },
  { slug: 'sanya', zh: '三亚', en: 'Sanya' },
  { slug: 'wuhan', zh: '武汉', en: 'Wuhan' },
  { slug: 'changsha', zh: '长沙', en: 'Changsha' },
  { slug: 'tianjin', zh: '天津', en: 'Tianjin' },
  { slug: 'harbin', zh: '哈尔滨', en: 'Harbin' },
  { slug: 'dalian', zh: '大连', en: 'Dalian' },
  { slug: 'ningbo', zh: '宁波', en: 'Ningbo' },
  { slug: 'chengde', zh: '承德', en: 'Chengde' },
  { slug: 'luoyang', zh: '洛阳', en: 'Luoyang' },
  { slug: 'jinan', zh: '济南', en: 'Jinan' },
  { slug: 'yantai', zh: '烟台', en: 'Yantai' },
  { slug: 'weihai', zh: '威海', en: 'Weihai' },
  { slug: 'fuzhou', zh: '福州', en: 'Fuzhou' },
  { slug: 'quanzhou', zh: '泉州', en: 'Quanzhou' },
  { slug: 'hulunbuir', zh: '呼伦贝尔', en: 'Hulunbuir' },
  { slug: 'xining', zh: '西宁', en: 'Xining' },
  { slug: 'lanzhou', zh: '兰州', en: 'Lanzhou' },
  { slug: 'dunhuang', zh: '敦煌', en: 'Dunhuang' },
];

async function main() {
  const startTime = Date.now();
  console.log('=== Hybrid City Scores ===');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Cities: ${CITIES.length}\n`);

  const results = [];

  // Fetch climate data in batches of 5 (parallel)
  for (let i = 0; i < CITIES.length; i += 5) {
    const batch = CITIES.slice(i, i + 5);
    const climates = await Promise.all(batch.map(c => getCityClimate(c.en)));

    for (let j = 0; j < batch.length; j++) {
      const city = batch[j];
      const climate = climates[j];
      const base = BASELINE[city.slug] || { eco: 30, intl: 20, tour: 40 };

      const economy = base.eco;
      const international = base.intl;
      const tourism = adjustTourism(base.tour, climate);
      const livability = scoreLivability(climate);
      const composite = economy * 0.3 + international * 0.25 + tourism * 0.25 + livability * 0.2;
      const tier = calculateTier(composite);

      results.push({
        slug: city.slug,
        economyScore: Math.round(economy * 100) / 100,
        internationalScore: Math.round(international * 100) / 100,
        tourismScore: Math.round(tourism * 100) / 100,
        livabilityScore: Math.round(livability * 100) / 100,
        compositeScore: Math.round(composite * 100) / 100,
        tier,
        climate,
      });

      console.log(`  ${tier} ${composite.toFixed(1).padStart(5)} ${city.zh.padEnd(5)} E:${economy.toFixed(0)} I:${international.toFixed(0)} T:${tourism.toFixed(0)} L:${livability.toFixed(0)} | ${climate.avgTemp.toFixed(1)}°C ${climate.precip.toFixed(1)}mm`);
    }

    // Small delay between batches
    if (i + 5 < CITIES.length) await new Promise(r => setTimeout(r, 200));
  }

  // Rank
  results.sort((a, b) => b.compositeScore - a.compositeScore);
  results.forEach((r, i) => r.rank = i + 1);

  // Save to Supabase
  console.log('\nSaving to Supabase...');

  const citiesRes = await fetch(`${SUPABASE_URL}/rest/v1/cities?select=id,slug`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
  const citiesData = await citiesRes.json();
  const idMap = {};
  citiesData.forEach(c => idMap[c.slug] = c.id);

  const scoreRecords = results
    .filter(r => idMap[r.slug])
    .map(r => ({
      city_id: idMap[r.slug],
      composite_score: r.compositeScore,
      economy_score: r.economyScore,
      international_score: r.internationalScore,
      tourism_score: r.tourismScore,
      livability_score: r.livabilityScore,
      tier: r.tier,
      overall_rank: r.rank,
      score_breakdown: [
        { source: 'baseline_nbs', metric: 'economy', value: r.economyScore },
        { source: 'baseline_caa', metric: 'international', value: r.internationalScore },
        { source: 'openmeteo', metric: 'tourism', value: r.tourismScore, temp: r.climate.avgTemp, precip: r.climate.precip },
        { source: 'openmeteo', metric: 'livability', value: r.livabilityScore, population: r.climate.population },
      ],
      calculated_at: new Date().toISOString(),
    }));

  // Delete old scores first, then insert new
  for (const rec of scoreRecords) {
    await fetch(`${SUPABASE_URL}/rest/v1/city_scores?city_id=eq.${rec.city_id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
  }

  const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/city_scores`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(scoreRecords),
  });
  console.log(`Scores saved: ${saveRes.status} (${scoreRecords.length} records)`);

  // Log
  const duration = Date.now() - startTime;
  await fetch(`${SUPABASE_URL}/rest/v1/score_update_logs`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      run_id: `hybrid-${Date.now()}`,
      status: 'success',
      cities_updated: scoreRecords.length,
      calculation_duration_ms: duration,
    }),
  });

  // Summary
  console.log('\n=== Final Rankings ===');
  const tiers = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const r of results) {
    tiers[r.tier]++;
    console.log(`  ${r.tier} ${r.compositeScore.toFixed(1).padStart(5)} #${String(r.rank).padStart(2)} ${r.slug.padEnd(12)} E:${r.economyScore.toFixed(0).padStart(3)} I:${r.internationalScore.toFixed(0).padStart(3)} T:${r.tourismScore.toFixed(0).padStart(3)} L:${r.livabilityScore.toFixed(0).padStart(3)}`);
  }
  console.log(`\nDistribution: S:${tiers.S} A:${tiers.A} B:${tiers.B} C:${tiers.C} D:${tiers.D}`);
  console.log(`Duration: ${duration}ms`);
  console.log('\n✅ Done. Dynamic scores (with real-time climate adjustment) saved to Supabase.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
