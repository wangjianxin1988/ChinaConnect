import type { City } from "./types";

// City data files - Batch 1 (Original 6 cities)
import beijing from "@/data/cities/beijing.json";
import chengdu from "@/data/cities/chengdu.json";
import guangzhou from "@/data/cities/guangzhou.json";
import guilin from "@/data/cities/guilin.json";
import shanghai from "@/data/cities/shanghai.json";
import xian from "@/data/cities/xian.json";

import chongqing from "@/data/cities/chongqing.json";
import dali from "@/data/cities/dali.json";
// Batch 2 (Extended 6 cities)
import hangzhou from "@/data/cities/hangzhou.json";
import nanjing from "@/data/cities/nanjing.json";
import shenzhen from "@/data/cities/shenzhen.json";
import suzhou from "@/data/cities/suzhou.json";

import changsha from "@/data/cities/changsha.json";
import kunming from "@/data/cities/kunming.json";
import lijiang from "@/data/cities/lijiang.json";
import qingdao from "@/data/cities/qingdao.json";
import sanya from "@/data/cities/sanya.json";
import wuhan from "@/data/cities/wuhan.json";
// Batch 3 (New 8 cities)
import xiamen from "@/data/cities/xiamen.json";
import zhangjiajie from "@/data/cities/zhangjiajie.json";

import chengde from "@/data/cities/chengde.json";
import dalian from "@/data/cities/dalian.json";
import dunhuang from "@/data/cities/dunhuang.json";
import fuzhou from "@/data/cities/fuzhou.json";
import harbin from "@/data/cities/harbin.json";
import hulunbuir from "@/data/cities/hulunbuir.json";
import jinan from "@/data/cities/jinan.json";
import lanzhou from "@/data/cities/lanzhou.json";
import luoyang from "@/data/cities/luoyang.json";
import ningbo from "@/data/cities/ningbo.json";
import quanzhou from "@/data/cities/quanzhou.json";
// Batch 4 (Available cities)
import tianjin from "@/data/cities/tianjin.json";
import weihai from "@/data/cities/weihai.json";
import xining from "@/data/cities/xining.json";
import yantai from "@/data/cities/yantai.json";

export const cities: City[] = [
  // Batch 1 - Original MVP cities
  beijing,
  shanghai,
  guangzhou,
  xian,
  chengdu,
  guilin,
  // Batch 2 - Extended cities
  hangzhou,
  chongqing,
  dali,
  nanjing,
  suzhou,
  shenzhen,
  // Batch 3 - Newly added cities
  xiamen,
  qingdao,
  kunming,
  lijiang,
  zhangjiajie,
  sanya,
  wuhan,
  changsha,
  // Batch 4 - Additional major cities (only those with data files)
  tianjin,
  harbin,
  dalian,
  ningbo,
  chengde,
  luoyang,
  jinan,
  yantai,
  weihai,
  fuzhou,
  quanzhou,
  hulunbuir,
  xining,
  lanzhou,
  dunhuang,
];

export const citySlugs = cities.map((c) => c.slug);

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

export function getAdjacentCities(slug: string): { prev: City | null; next: City | null } {
  const index = cities.findIndex((c) => c.slug === slug);
  return {
    prev: index > 0 ? cities[index - 1] : null,
    next: index < cities.length - 1 ? cities[index + 1] : null,
  };
}

export const citiesMeta = [
  // Batch 1
  {
    slug: "beijing",
    name: "Beijing",
    nameZh: "北京",
    description: "Ancient capital with the Forbidden City and Great Wall",
    coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200",
  },
  {
    slug: "shanghai",
    name: "Shanghai",
    nameZh: "上海",
    description: "Modern metropolis where East meets West",
    coverImage: "https://images.unsplash.com/photo-1557903719-73feb061b957?w=1200&q=80",
  },
  {
    slug: "guangzhou",
    name: "Guangzhou",
    nameZh: "广州",
    description: "Cantonese culture and world-class dim sum",
    coverImage: "https://images.unsplash.com/photo-1549576492-b40f6a0b4e5c?w=1200",
  },
  {
    slug: "xian",
    name: "Xi'an",
    nameZh: "西安",
    description: "Terracotta Warriors and Silk Road heritage",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "chengdu",
    name: "Chengdu",
    nameZh: "成都",
    description: "Giant pandas and spicy Sichuan cuisine",
    coverImage: "https://images.unsplash.com/photo-1584634731339-252e581abfc5?w=1200",
  },
  {
    slug: "guilin",
    name: "Guilin",
    nameZh: "桂林",
    description: "Stunning karst landscapes and Li River",
    coverImage: "https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=1200",
  },
  // Batch 2
  {
    slug: "hangzhou",
    name: "Hangzhou",
    nameZh: "杭州",
    description: "West Lake UNESCO site and Longjing tea",
    coverImage: "https://images.unsplash.com/photo-1598001725608-9c77cf5fd730?w=1200",
  },
  {
    slug: "chongqing",
    name: "Chongqing",
    nameZh: "重庆",
    description: "Mountain city, hot pot capital, Yangtze cruises",
    coverImage: "https://images.unsplash.com/photo-1588414593468-5a47b9c4d70b?w=1200",
  },
  {
    slug: "dali",
    name: "Dali",
    nameZh: "大理",
    description: "Bai minority culture, Erhai Lake cycling paradise",
    coverImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200",
  },
  {
    slug: "nanjing",
    name: "Nanjing",
    nameZh: "南京",
    description: "Ancient capital, Ming Xiaoling Tomb UNESCO site",
    coverImage: "https://images.unsplash.com/photo-1598001725608-9c77cf5fd730?w=1200",
  },
  {
    slug: "suzhou",
    name: "Suzhou",
    nameZh: "苏州",
    description: "Venice of the East, UNESCO classical gardens",
    coverImage: "https://images.unsplash.com/photo-1537531383496-f4749bce9441?w=1200",
  },
  {
    slug: "shenzhen",
    name: "Shenzhen",
    nameZh: "深圳",
    description: "China tech hub, theme parks, Hong Kong access",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
  },
  // Batch 3
  {
    slug: "xiamen",
    name: "Xiamen",
    nameZh: "厦门",
    description: "Coastal city with Gulangyu Island UNESCO site",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
  },
  {
    slug: "qingdao",
    name: "Qingdao",
    nameZh: "青岛",
    description: "German architecture,Tsingtao brewery, coastal beauty",
    coverImage: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200",
  },
  {
    slug: "kunming",
    name: "Kunming",
    nameZh: "昆明",
    description: "Spring city, Stone Forest UNESCO site",
    coverImage: "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=1200",
  },
  {
    slug: "lijiang",
    name: "Lijiang",
    nameZh: "丽江",
    description: "Ancient Naxi kingdom, Jade Dragon Snow Mountain",
    coverImage: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200",
  },
  {
    slug: "zhangjiajie",
    name: "Zhangjiajie",
    nameZh: "张家界",
    description: "UNESCO forest parks, Avatar Hallelujah Mountains",
    coverImage: "https://images.unsplash.com/photo-1529921879218-f99546d83c28?w=1200",
  },
  {
    slug: "sanya",
    name: "Sanya",
    nameZh: "三亚",
    description: "Tropical paradise, Wuzhizhou Island, beaches",
    coverImage: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=1200",
  },
  {
    slug: "wuhan",
    name: "Wuhan",
    nameZh: "武汉",
    description: "Central China hub, Yangtze River, Cherry blossoms",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
  },
  {
    slug: "changsha",
    name: "Changsha",
    nameZh: "长沙",
    description: "Hunan culture, Orange Island, spicy cuisine",
    coverImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200",
  },
  // Batch 4
  {
    slug: "tianjin",
    name: "Tianjin",
    nameZh: "天津",
    description: "Port city with European architecture and Beijing's nearby cousin",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "harbin",
    name: "Harbin",
    nameZh: "哈尔滨",
    description: "Ice city, Russian architecture, world-famous ice festival",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "dalian",
    name: "Dalian",
    nameZh: "大连",
    description: "Coastal resort city with Russian and Japanese heritage",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "ningbo",
    name: "Ningbo",
    nameZh: "宁波",
    description: "Ancient port city, Putuo mountains, seafood paradise",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "chengde",
    name: "Chengde",
    nameZh: "承德",
    description: "Mountain resort with Imperial summer palace complexes",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "luoyang",
    name: "Luoyang",
    nameZh: "洛阳",
    description: "Ancient capital, Longmen Grottoes UNESCO, peony flowers",
    coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200",
  },
  {
    slug: "jinan",
    name: "Jinan",
    nameZh: "济南",
    description: "City of springs, Confucius heritage, nearby Mount Tai",
    coverImage: "https://images.unsplash.com/photo-1598600236050-8b2f4a16f1e2?w=1200",
  },
  {
    slug: "yantai",
    name: "Yantai",
    nameZh: "烟台",
    description: "Coastal wine city, beautiful beaches, apples and seafood",
    coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200",
  },
  {
    slug: "weihai",
    name: "Weihai",
    nameZh: "威海",
    description: "Clean coastal city, nearby Korean culture, beach resorts",
    coverImage: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=1200",
  },
  {
    slug: "fuzhou",
    name: "Fuzhou",
    nameZh: "福州",
    description: "Capital of Fujian, ancient temples,茉莉花茶产地",
    coverImage: "https://images.unsplash.com/photo-1583753075968-1236ccb83c66?w=1200",
  },
  {
    slug: "quanzhou",
    name: "Quanzhou",
    nameZh: "泉州",
    description: "Maritime Silk Road hub, UNESCO ancient architecture",
    coverImage: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200",
  },
  {
    slug: "hulunbuir",
    name: "Hulunbuir",
    nameZh: "呼伦贝尔",
    description: "Vast grassland, nomadic culture, Russian border town",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
  },
  {
    slug: "xining",
    name: "Xining",
    nameZh: "西宁",
    description: "Gateway to Qinghai Lake, Tibetan culture, yak butter tea",
    coverImage: "https://images.unsplash.com/photo-1701913997562-fa30f5c75afd?w=1200&q=80",
  },
  {
    slug: "lanzhou",
    name: "Lanzhou",
    nameZh: "兰州",
    description: "Yellow River city, famous beef noodles, Silk Road gateway",
    coverImage: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200",
  },
  {
    slug: "dunhuang",
    name: "Dunhuang",
    nameZh: "敦煌",
    description: "Mogao Caves UNESCO, Singing Sand Dunes, Silk Road oasis",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200",
  },
];
