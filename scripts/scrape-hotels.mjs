#!/usr/bin/env node
/**
 * Hotel Data Scraper Script
 * 酒店数据抓取脚本
 * 
 * Usage:
 *   node scripts/scrape-hotels.mjs [city] [category] [count]
 * 
 * Examples:
 *   node scripts/scrape-hotels.mjs beijing              # Scrape all categories for Beijing
 *   node scripts/scrape-hotels.mjs shanghai luxury 10   # Scrape 10 luxury hotels for Shanghai
 *   node scripts/scrape-hotels.mjs --all                # Scrape all cities
 */

import { scrapeCityHotels, saveHotelsToFile } from "../src/lib/hotel-scraper.js";

// 35 Chinese cities
const CITIES = [
  { slug: "beijing", name: "北京" },
  { slug: "shanghai", name: "上海" },
  { slug: "guangzhou", name: "广州" },
  { slug: "shenzhen", name: "深圳" },
  { slug: "chengdu", name: "成都" },
  { slug: "hangzhou", name: "杭州" },
  { slug: "wuhan", name: "武汉" },
  { slug: "xian", name: "西安" },
  { slug: "chongqing", name: "重庆" },
  { slug: "nanjing", name: "南京" },
  { slug: "changsha", name: "长沙" },
  { slug: "tianjin", name: "天津" },
  { slug: "suzhou", name: "苏州" },
  { slug: "zhengzhou", name: "郑州" },
  { slug: "dalian", name: "大连" },
  { slug: "qingdao", name: "青岛" },
  { slug: "kunming", name: "昆明" },
  { slug: "xiamen", name: "厦门" },
  { slug: "harbin", name: "哈尔滨" },
  { slug: "hefei", name: "合肥" },
  { slug: "fuzhou", name: "福州" },
  { slug: "jinan", name: "济南" },
  { slug: "ningbo", name: "宁波" },
  { slug: "wuxi", name: "无锡" },
  { slug: "dalian", name: "大连" },
  { slug: "changchun", name: "长春" },
  { slug: "nanning", name: "南宁" },
  { slug: "guiyang", name: "贵阳" },
  { slug: "haikou", name: "海口" },
  { slug: "lanzhou", name: "兰州" },
  { slug: "yinchuan", name: "银川" },
  { slug: "xining", name: "西宁" },
  { slug: "urumqi", name: "乌鲁木齐" },
  { slug: "lhasa", name: "拉萨" },
  { slug: "hohhot", name: "呼和浩特" },
];

const CATEGORIES = [
  "luxury",
  "mid_range",
  "budget",
  "hostel",
  "love_hotel",
  "esports_hotel",
];

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(`
Hotel Data Scraper - 酒店数据抓取工具

Usage:
  node scripts/scrape-hotels.mjs [city] [category] [count]
  node scripts/scrape-hotels.mjs --all [count]

Examples:
  node scripts/scrape-hotels.mjs beijing                    # Scrape all categories for Beijing
  node scripts/scrape-hotels.mjs shanghai luxury 10         # Scrape 10 luxury hotels for Shanghai
  node scripts/scrape-hotels.mjs --all 5                    # Scrape 5 hotels per category for all cities

Categories: ${CATEGORIES.join(", ")}
Cities: ${CITIES.map(c => c.slug).join(", ")}
    `);
    return;
  }

  const scrapeAll = args[0] === "--all";
  const count = parseInt(args[scrapeAll ? 1 : 2]) || 5;

  if (scrapeAll) {
    console.log(`Scraping ${count} hotels per category for all ${CITIES.length} cities...`);

    for (const city of CITIES) {
      console.log(`\n=== ${city.name} (${city.slug}) ===`);
      try {
        const hotels = await scrapeCityHotels(city.slug, city.name, count);
        await saveHotelsToFile(city.slug, hotels);
        console.log(`✅ ${city.name}: ${hotels.length} hotels scraped`);
      } catch (error) {
        console.error(`❌ ${city.name}: Failed -`, error);
      }

      // Rate limiting between cities
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } else {
    const citySlug = args[0];
    const category = args[1];

    const city = CITIES.find(c => c.slug === citySlug);
    if (!city) {
      console.error(`City not found: ${citySlug}`);
      console.log(`Available cities: ${CITIES.map(c => c.slug).join(", ")}`);
      return;
    }

    if (category && !CATEGORIES.includes(category)) {
      console.error(`Invalid category: ${category}`);
      console.log(`Available categories: ${CATEGORIES.join(", ")}`);
      return;
    }

    console.log(`Scraping hotels for ${city.name} (${city.slug})...`);

    const hotels = await scrapeCityHotels(city.slug, city.name, count);

    if (category) {
      // Filter by category
      const filtered = hotels.filter(h => h.category === category);
      console.log(`Found ${filtered.length} ${category} hotels`);
      await saveHotelsToFile(city.slug, filtered);
    } else {
      await saveHotelsToFile(city.slug, hotels);
    }

    console.log(`✅ Done! ${hotels.length} hotels scraped`);
  }
}

main().catch(console.error);
