import type { City } from "./types";

// City data files - Batch 1 (Original 6 cities)
import beijing from "@/data/cities/beijing.json";
import chengdu from "@/data/cities/chengdu.json";
import guangzhou from "@/data/cities/guangzhou.json";
import guilin from "@/data/cities/guilin.json";
import shanghai from "@/data/cities/shanghai.json";
import xian from "@/data/cities/xian.json";

// Batch 2 (Extended 6 cities)
import hangzhou from "@/data/cities/hangzhou.json";
import chongqing from "@/data/cities/chongqing.json";
import dali from "@/data/cities/dali.json";
import nanjing from "@/data/cities/nanjing.json";
import suzhou from "@/data/cities/suzhou.json";
import shenzhen from "@/data/cities/shenzhen.json";

// Batch 3 (New 8 cities)
import xiamen from "@/data/cities/xiamen.json";
import qingdao from "@/data/cities/qingdao.json";
import kunming from "@/data/cities/kunming.json";
import lijiang from "@/data/cities/lijiang.json";
import zhangjiajie from "@/data/cities/zhangjiajie.json";
import sanya from "@/data/cities/sanya.json";
import wuhan from "@/data/cities/wuhan.json";
import changsha from "@/data/cities/changsha.json";

// Batch 4 (Available cities)
import tianjin from "@/data/cities/tianjin.json";
import harbin from "@/data/cities/harbin.json";
import dalian from "@/data/cities/dalian.json";
import ningbo from "@/data/cities/ningbo.json";
import chengde from "@/data/cities/chengde.json";
import luoyang from "@/data/cities/luoyang.json";
import jinan from "@/data/cities/jinan.json";
import yantai from "@/data/cities/yantai.json";
import weihai from "@/data/cities/weihai.json";
import fuzhou from "@/data/cities/fuzhou.json";
import quanzhou from "@/data/cities/quanzhou.json";
import hulunbuir from "@/data/cities/hulunbuir.json";
import xining from "@/data/cities/xining.json";
import lanzhou from "@/data/cities/lanzhou.json";
import dunhuang from "@/data/cities/dunhuang.json";

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
  },
  {
    slug: "shanghai",
    name: "Shanghai",
    nameZh: "上海",
    description: "Modern metropolis where East meets West",
  },
  {
    slug: "guangzhou",
    name: "Guangzhou",
    nameZh: "广州",
    description: "Cantonese culture and world-class dim sum",
  },
  {
    slug: "xian",
    name: "Xi'an",
    nameZh: "西安",
    description: "Terracotta Warriors and Silk Road heritage",
  },
  {
    slug: "chengdu",
    name: "Chengdu",
    nameZh: "成都",
    description: "Giant pandas and spicy Sichuan cuisine",
  },
  {
    slug: "guilin",
    name: "Guilin",
    nameZh: "桂林",
    description: "Stunning karst landscapes and Li River",
  },
  // Batch 2
  {
    slug: "hangzhou",
    name: "Hangzhou",
    nameZh: "杭州",
    description: "West Lake UNESCO site and Longjing tea",
  },
  {
    slug: "chongqing",
    name: "Chongqing",
    nameZh: "重庆",
    description: "Mountain city, hot pot capital, Yangtze cruises",
  },
  {
    slug: "dali",
    name: "Dali",
    nameZh: "大理",
    description: "Bai minority culture, Erhai Lake cycling paradise",
  },
  {
    slug: "nanjing",
    name: "Nanjing",
    nameZh: "南京",
    description: "Ancient capital, Ming Xiaoling Tomb UNESCO site",
  },
  {
    slug: "suzhou",
    name: "Suzhou",
    nameZh: "苏州",
    description: "Venice of the East, UNESCO classical gardens",
  },
  {
    slug: "shenzhen",
    name: "Shenzhen",
    nameZh: "深圳",
    description: "China tech hub, theme parks, Hong Kong access",
  },
  // Batch 3
  {
    slug: "xiamen",
    name: "Xiamen",
    nameZh: "厦门",
    description: "Coastal city with Gulangyu Island UNESCO site",
  },
  {
    slug: "qingdao",
    name: "Qingdao",
    nameZh: "青岛",
    description: "German architecture,Tsingtao brewery, coastal beauty",
  },
  {
    slug: "kunming",
    name: "Kunming",
    nameZh: "昆明",
    description: "Spring city, Stone Forest UNESCO site",
  },
  {
    slug: "lijiang",
    name: "Lijiang",
    nameZh: "丽江",
    description: "Ancient Naxi kingdom, Jade Dragon Snow Mountain",
  },
  {
    slug: "zhangjiajie",
    name: "Zhangjiajie",
    nameZh: "张家界",
    description: "UNESCO forest parks, Avatar Hallelujah Mountains",
  },
  {
    slug: "sanya",
    name: "Sanya",
    nameZh: "三亚",
    description: "Tropical paradise, Wuzhizhou Island, beaches",
  },
  {
    slug: "wuhan",
    name: "Wuhan",
    nameZh: "武汉",
    description: "Central China hub, Yangtze River, Cherry blossoms",
  },
  {
    slug: "changsha",
    name: "Changsha",
    nameZh: "长沙",
    description: "Hunan culture, Orange Island, spicy cuisine",
  },
];
