#!/usr/bin/env node
/**
 * Generate Sample Hotel Data for All Cities
 * 为所有城市生成示例酒店数据
 * 
 * Usage:
 *   node scripts/generate-hotel-data.mjs
 */

import fs from "fs/promises";
import path from "path";

// 35 Chinese cities
const CITIES = [
  { slug: "beijing", name: "北京", nameEn: "Beijing" },
  { slug: "shanghai", name: "上海", nameEn: "Shanghai" },
  { slug: "guangzhou", name: "广州", nameEn: "Guangzhou" },
  { slug: "shenzhen", name: "深圳", nameEn: "Shenzhen" },
  { slug: "chengdu", name: "成都", nameEn: "Chengdu" },
  { slug: "hangzhou", name: "杭州", nameEn: "Hangzhou" },
  { slug: "wuhan", name: "武汉", nameEn: "Wuhan" },
  { slug: "xian", name: "西安", nameEn: "Xi'an" },
  { slug: "chongqing", name: "重庆", nameEn: "Chongqing" },
  { slug: "nanjing", name: "南京", nameEn: "Nanjing" },
  { slug: "changsha", name: "长沙", nameEn: "Changsha" },
  { slug: "tianjin", name: "天津", nameEn: "Tianjin" },
  { slug: "suzhou", name: "苏州", nameEn: "Suzhou" },
  { slug: "zhengzhou", name: "郑州", nameEn: "Zhengzhou" },
  { slug: "dalian", name: "大连", nameEn: "Dalian" },
  { slug: "qingdao", name: "青岛", nameEn: "Qingdao" },
  { slug: "kunming", name: "昆明", nameEn: "Kunming" },
  { slug: "xiamen", name: "厦门", nameEn: "Xiamen" },
  { slug: "harbin", name: "哈尔滨", nameEn: "Harbin" },
  { slug: "hefei", name: "合肥", nameEn: "Hefei" },
  { slug: "fuzhou", name: "福州", nameEn: "Fuzhou" },
  { slug: "jinan", name: "济南", nameEn: "Jinan" },
  { slug: "ningbo", name: "宁波", nameEn: "Ningbo" },
  { slug: "wuxi", name: "无锡", nameEn: "Wuxi" },
  { slug: "changchun", name: "长春", nameEn: "Changchun" },
  { slug: "nanning", name: "南宁", nameEn: "Nanning" },
  { slug: "guiyang", name: "贵阳", nameEn: "Guiyang" },
  { slug: "haikou", name: "海口", nameEn: "Haikou" },
  { slug: "lanzhou", name: "兰州", nameEn: "Lanzhou" },
  { slug: "yinchuan", name: "银川", nameEn: "Yinchuan" },
  { slug: "xining", name: "西宁", nameEn: "Xining" },
  { slug: "urumqi", name: "乌鲁木齐", nameEn: "Urumqi" },
  { slug: "lhasa", name: "拉萨", nameEn: "Lhasa" },
  { slug: "hohhot", name: "呼和浩特", nameEn: "Hohhot" },
  { slug: "chengde", name: "承德", nameEn: "Chengde" },
];

// Hotel templates by category
const HOTEL_TEMPLATES = {
  luxury: {
    names: [
      { zh: "万达文华酒店", en: "Wanda Vista Hotel" },
      { zh: "香格里拉大酒店", en: "Shangri-La Hotel" },
      { zh: "希尔顿酒店", en: "Hilton Hotel" },
      { zh: "万豪酒店", en: "Marriott Hotel" },
      { zh: "洲际酒店", en: "InterContinental Hotel" },
    ],
    priceRange: [1500, 5000],
    highlights: ["五星级服务", "豪华设施", "商务首选", "行政酒廊", "水疗中心"],
  },
  mid_range: {
    names: [
      { zh: "亚朵酒店", en: "Atour Hotel" },
      { zh: "全季酒店", en: "Ji Hotel" },
      { zh: "维也纳酒店", en: "Vienna Hotel" },
      { zh: "桔子水晶酒店", en: "Crystal Orange Hotel" },
      { zh: "美居酒店", en: "Mercure Hotel" },
    ],
    priceRange: [400, 1200],
    highlights: ["商务出差", "交通便利", "含早餐", "免费WiFi", "地铁直达"],
  },
  budget: {
    names: [
      { zh: "如家酒店", en: "Home Inn" },
      { zh: "汉庭酒店", en: "Hanting Hotel" },
      { zh: "7天连锁酒店", en: "7 Days Inn" },
      { zh: "锦江之星", en: "Jinjiang Inn" },
      { zh: "格林豪泰", en: "GreenTree Inn" },
    ],
    priceRange: [150, 400],
    highlights: ["经济实惠", "干净整洁", "24小时热水", "免费WiFi", "连锁品牌"],
  },
  hostel: {
    names: [
      { zh: "青年旅舍", en: "Youth Hostel" },
      { zh: "背包客旅馆", en: "Backpacker Inn" },
      { zh: "国际青年旅舍", en: "International Youth Hostel" },
      { zh: "太空舱青旅", en: "Capsule Hostel" },
      { zh: "胡同青旅", en: "Hutong Hostel" },
    ],
    priceRange: [50, 200],
    highlights: ["背包客首选", "公共厨房", "社交氛围", "多语言服务", "行李寄存"],
  },
  love_hotel: {
    names: [
      { zh: "万爱酒店", en: "Wanai Hotel" },
      { zh: "主题酒店", en: "Theme Hotel" },
      { zh: "浪漫满屋", en: "Romance Hotel" },
      { zh: "情侣酒店", en: "Couples Hotel" },
      { zh: "蜜月酒店", en: "Honeymoon Hotel" },
    ],
    priceRange: [200, 800],
    highlights: ["主题房间", "情侣专属", "私密空间", "浪漫氛围", "特色装修"],
  },
  esports_hotel: {
    names: [
      { zh: "爱电竞酒店", en: "iEsports Hotel" },
      { zh: "网鱼电竞酒店", en: "Netmarble Esports Hotel" },
      { zh: "竞迹电竞酒店", en: "Jingji Esports Hotel" },
      { zh: "游戏人生酒店", en: "Game Life Hotel" },
      { zh: "超神电竞酒店", en: "Super God Esports Hotel" },
    ],
    priceRange: [200, 600],
    highlights: ["高端配置", "电竞设备", "24小时营业", "多人开黑", "游戏主题"],
  },
};

// Image URLs by category
const HOTEL_IMAGES = {
  luxury: [
    "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  mid_range: [
    "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  budget: [
    "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  hostel: [
    "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  love_hotel: [
    "https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  esports_hotel: [
    "https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPrice(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function generateHotelsForCity(city, hotelsPerCategory = 5) {
  const hotels = [];
  const categories = Object.keys(HOTEL_TEMPLATES);

  for (const category of categories) {
    const template = HOTEL_TEMPLATES[category];
    const images = HOTEL_IMAGES[category];

    for (let i = 0; i < hotelsPerCategory; i++) {
      const nameTemplate = template.names[i % template.names.length];
      const image = images[i % images.length];

      hotels.push({
        id: `${city.slug}-${category}-${String(i + 1).padStart(3, "0")}`,
        name: `${city.name}${nameTemplate.zh}`,
        nameEn: `${nameTemplate.en} ${city.nameEn}`,
        category,
        priceMin: getRandomPrice(template.priceRange[0], template.priceRange[1] * 0.7),
        priceMax: getRandomPrice(template.priceRange[1] * 0.7, template.priceRange[1]),
        city: city.slug,
        cityZh: city.name,
        district: getRandomItem(["市中心", "火车站", "商业区", "景区附近"]),
        address: `${city.name}${getRandomItem(["路", "街", "大道"])}${Math.floor(Math.random() * 200) + 1}号`,
        rating: (4 + Math.random() * 0.8).toFixed(1),
        image,
        phone: `+86 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
        highlights: template.highlights.slice(0, 3 + Math.floor(Math.random() * 3)),
      });
    }
  }

  return hotels;
}

async function main() {
  console.log("Generating hotel data for all cities...\n");

  const outputDir = path.join(process.cwd(), "src", "data", "hotels");

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  for (const city of CITIES) {
    const hotels = generateHotelsForCity(city, 5);
    const filePath = path.join(outputDir, `${city.slug}-hotels.ts`);

    const content = `/**
 * ${city.nameEn} Hotel Data - Auto-generated
 * Last updated: ${new Date().toISOString()}
 * Total: ${hotels.length} hotels (6 categories × 5 hotels)
 */

import type { HotelItem } from "@/types/accommodation";

export const ${city.slug}Hotels: HotelItem[] = ${JSON.stringify(hotels, null, 2)};
`;

    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✅ ${city.nameEn}: ${hotels.length} hotels → ${filePath}`);
  }

  // Update index.ts to import all cities
  const indexContent = `/**
 * Unified Hotel Data Index - Auto-generated
 * Last updated: ${new Date().toISOString()}
 * Total: ${CITIES.length} cities
 */

import type { HotelItem, HotelCategory } from "@/types/accommodation";

${CITIES.map(c => `import { ${c.slug}Hotels } from "./${c.slug}-hotels";`).join("\n")}

// City hotel data registry
const cityHotelData: Record<string, HotelItem[]> = {
${CITIES.map(c => `  ${c.slug}: ${c.slug}Hotels,`).join("\n")}
};

// Dynamic hotel data cache
const dynamicHotelCache: Map<string, HotelItem[]> = new Map();

export function getHotelsByCity(citySlug: string): HotelItem[] {
  if (cityHotelData[citySlug]) {
    return cityHotelData[citySlug];
  }
  if (dynamicHotelCache.has(citySlug)) {
    return dynamicHotelCache.get(citySlug) || [];
  }
  return [];
}

export function getHotelsByCityAndCategory(
  citySlug: string,
  category: HotelCategory
): HotelItem[] {
  return getHotelsByCity(citySlug).filter(h => h.category === category);
}

export function getHotelCategoryCounts(
  citySlug: string
): Record<HotelCategory, number> {
  const hotels = getHotelsByCity(citySlug);
  const counts: Record<string, number> = {};
  const categories: HotelCategory[] = [
    "luxury", "mid_range", "budget", "hostel", "love_hotel", "esports_hotel"
  ];
  for (const cat of categories) counts[cat] = 0;
  for (const h of hotels) counts[h.category] = (counts[h.category] || 0) + 1;
  return counts as Record<HotelCategory, number>;
}

export function getHotelCount(citySlug: string): number {
  return getHotelsByCity(citySlug).length;
}

export function getAvailableCategories(citySlug: string): HotelCategory[] {
  return [...new Set(getHotelsByCity(citySlug).map(h => h.category))] as HotelCategory[];
}

export function registerHotelData(citySlug: string, hotels: HotelItem[]): void {
  dynamicHotelCache.set(citySlug, hotels);
}

export function getCitiesWithHotels(): string[] {
  return [...new Set([...Object.keys(cityHotelData), ...Array.from(dynamicHotelCache.keys())])];
}
`;

  await fs.writeFile(path.join(outputDir, "index.ts"), indexContent, "utf-8");
  console.log(`\n✅ Updated index.ts with ${CITIES.length} cities`);
  console.log(`\nDone! Generated hotel data for ${CITIES.length} cities.`);
}

main().catch(console.error);
