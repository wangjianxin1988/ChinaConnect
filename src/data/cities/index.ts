// @ts-nocheck
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

// citiesMeta derived dynamically from city JSON files — always in sync
export const citiesMeta = cities.map((c) => ({
  slug: c.slug,
  name: c.nameEn || c.name,
  nameZh: c.name,
  description: c.description || "",
  coverImage: c.coverImage,
}));
