import type { City } from "./types";

// City data files
import beijing from "@/data/cities/beijing.json";
import chengdu from "@/data/cities/chengdu.json";
import chongqing from "@/data/cities/chongqing.json";
import dali from "@/data/cities/dali.json";
import guangzhou from "@/data/cities/guangzhou.json";
import guilin from "@/data/cities/guilin.json";
import hangzhou from "@/data/cities/hangzhou.json";
import nanjing from "@/data/cities/nanjing.json";
import shanghai from "@/data/cities/shanghai.json";
import shenzhen from "@/data/cities/shenzhen.json";
import suzhou from "@/data/cities/suzhou.json";
import xian from "@/data/cities/xian.json";

export const cities: City[] = [
  beijing,
  shanghai,
  guangzhou,
  xian,
  chengdu,
  guilin,
  hangzhou,
  chongqing,
  dali,
  nanjing,
  suzhou,
  shenzhen,
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
];
