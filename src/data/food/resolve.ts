// @ts-nocheck
/**
 * Unified restaurant resolver.
 *
 * Covers both the legacy hand-curated list (src/data/food/restaurants.ts) and
 * the full per-city datasets (src/data/cities/*.json) so that every restaurant
 * card across the site resolves to a working detail page.
 */
import { restaurants as legacyRestaurants } from "./restaurants";
import { cities } from "@/data/cities/index";
import { getCityData } from "@/data/cities-i18n";
import { translations } from "@/i18n/translations";

export interface ResolvedRestaurant {
  id: string;
  source: "legacy" | "city";
  citySlug: string;
  cityName: string;
  cityNameEn: string;
  name: string;
  nameEn: string;
  type: string;
  star?: number;
  diamond?: number;
  cuisine: string;
  avgPrice: number;
  rating?: number;
  address: string;
  addressEn?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  hours?: string;
  tags: string[];
  imageUrl?: string;
  description: string;
  descriptionEn?: string;
  bloggerName?: string;
  dishHighlights?: string[];
}

const CJK_LANGS = new Set(["zh-CN", "zh-TW", "ja"]);

export function getAllRestaurantIds(): string[] {
  const ids = new Set<string>(legacyRestaurants.map((r) => r.id));
  for (const city of cities) {
    for (const r of city.restaurants || []) {
      ids.add(r.id);
    }
  }
  return Array.from(ids);
}

function cityNameFor(citySlug: string, lang: string): string {
  return (
    translations[lang]?.[`city.${citySlug}.name`] ||
    translations.en?.[`city.${citySlug}.name`] ||
    citySlug
  );
}

export function resolveRestaurant(id: string, lang: string): ResolvedRestaurant | null {
  const legacy = legacyRestaurants.find((r) => r.id === id);
  if (legacy) {
    return {
      id: legacy.id,
      source: "legacy",
      citySlug: legacy.city,
      cityName: cityNameFor(legacy.city, lang),
      cityNameEn: legacy.cityZh || legacy.city,
      // CJK pages keep the native (usually Chinese) name; other languages
      // show the localized English/transliterated name instead.
      name: CJK_LANGS.has(lang) ? legacy.name || legacy.nameEn : legacy.nameEn || legacy.name,
      nameEn: legacy.nameEn || legacy.name,
      type: legacy.type,
      star: legacy.star,
      diamond: legacy.diamond,
      cuisine: legacy.cuisine,
      avgPrice: legacy.avgPrice,
      rating: legacy.rating,
      address: legacy.address,
      addressEn: legacy.addressEn,
      lat: legacy.lat,
      lng: legacy.lng,
      phone: legacy.phone,
      hours: legacy.hours,
      tags: legacy.tags || [],
      imageUrl: legacy.imageUrl,
      description: legacy.description || "",
      descriptionEn: legacy.descriptionEn,
      bloggerName: legacy.bloggerName,
      dishHighlights: legacy.dishHighlights,
    };
  }

  const city = cities.find((c) => (c.restaurants || []).some((r) => r.id === id));
  if (!city) return null;

  const enRest = (city.restaurants || []).find((r) => r.id === id);
  if (!enRest) return null;

  let localized;
  try {
    const ci = getCityData(city.slug, lang);
    localized = ci && (ci.restaurants || []).find((r) => r.id === id);
  } catch {
    localized = undefined;
  }
  const l = localized || enRest;

  return {
    id: enRest.id,
    source: "city",
    citySlug: city.slug,
    cityName: cityNameFor(city.slug, lang),
    cityNameEn: city.nameEn,
    // Localized display name: i18n `name` is the original (usually Chinese),
    // `nameEn` is the per-language rendering. CJK pages use the native name,
    // other languages use the localized nameEn so no Chinese leaks through.
    name: CJK_LANGS.has(lang)
      ? l.name || l.nameEn || enRest.name
      : l.nameEn || l.name || enRest.nameEn || enRest.name,
    nameEn: enRest.nameEn || enRest.name,
    type: enRest.type,
    star: enRest.star,
    diamond: enRest.diamond,
    cuisine: l.cuisine || enRest.cuisine,
    avgPrice: enRest.avgPrice,
    rating: enRest.rating,
    address: l.address || enRest.address || "",
    addressEn: enRest.address,
    lat: enRest.coordinates?.lat,
    lng: enRest.coordinates?.lng,
    phone: enRest.phone,
    hours: enRest.hours,
    tags: l.tags || enRest.tags || [],
    imageUrl: enRest.imageUrl,
    description: l.description || enRest.description || "",
    descriptionEn: enRest.description,
    bloggerName: undefined,
    dishHighlights: l.dishHighlights || enRest.dishHighlights,
  };
}

export function getSameCityRestaurants(
  id: string,
  lang: string,
  limit = 4
): ResolvedRestaurant[] {
  const current = resolveRestaurant(id, lang);
  if (!current) return [];

  if (current.source === "legacy") {
    return legacyRestaurants
      .filter((r) => r.city === current.citySlug && r.id !== id)
      .slice(0, limit)
      .map((r) => resolveRestaurant(r.id, lang))
      .filter(Boolean) as ResolvedRestaurant[];
  }

  const city = cities.find((c) => c.slug === current.citySlug);
  if (!city) return [];
  return (city.restaurants || [])
    .filter((r) => r.id !== id)
    .slice(0, limit)
    .map((r) => resolveRestaurant(r.id, lang))
    .filter(Boolean) as ResolvedRestaurant[];
}
