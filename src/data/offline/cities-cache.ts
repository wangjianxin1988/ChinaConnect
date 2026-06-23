// @ts-nocheck
// Offline city data cache for ChinaConnect PWA

import type { City } from "@/data/cities/types";

export interface CachedCityData {
  slug: string;
  data: City;
  cachedAt: number;
  version: string;
}

export interface CitiesCacheMetadata {
  totalCities: number;
  cachedCities: string[];
  lastSync: number;
  version: string;
}

// Default cache version - bump this to invalidate all cached data
const CACHE_VERSION = "1.0.0";

// Cities to cache by default (S-tier and A-tier cities)
const PRIORITY_CITIES = [
  "beijing",
  "shanghai",
  "guangzhou",
  "xian",
  "chengdu",
  "hangzhou",
  "chongqing",
  "guilin",
  "nanjing",
  "suzhou",
  "shenzhen",
  "xiamen",
  "qingdao",
  "kunming",
];

// Storage keys
const STORAGE_KEYS = {
  CITIES_INDEX: "chinaconnect_cities_index",
  CITY_PREFIX: "chinaconnect_city_",
  METADATA: "chinaconnect_cities_metadata",
} as const;

// Get metadata for cached cities
export async function getCitiesCacheMetadata(): Promise<CitiesCacheMetadata> {
  try {
    const metadata = localStorage.getItem(STORAGE_KEYS.METADATA);
    if (metadata) {
      const parsed = JSON.parse(metadata);
      return {
        ...parsed,
        cachedCities: parsed.cachedCities || [],
      };
    }
  } catch (error) {
    console.error("[CitiesCache] Failed to get metadata:", error);
  }

  return {
    totalCities: PRIORITY_CITIES.length,
    cachedCities: [],
    lastSync: 0,
    version: CACHE_VERSION,
  };
}

// Check if a city is cached and valid
export async function isCityCached(slug: string): Promise<boolean> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CITY_PREFIX + slug);
    if (!data) return false;

    const parsed: CachedCityData = JSON.parse(data);
    return parsed.version === CACHE_VERSION && parsed.cachedAt > 0;
  } catch {
    return false;
  }
}

// Get cached city data
export async function getCachedCity(slug: string): Promise<City | null> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CITY_PREFIX + slug);
    if (!data) return null;

    const parsed: CachedCityData = JSON.parse(data);

    // Check version
    if (parsed.version !== CACHE_VERSION) {
      console.log("[CitiesCache] City cache outdated:", slug);
      return null;
    }

    // Check if not too old (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.cachedAt > maxAge) {
      console.log("[CitiesCache] City cache expired:", slug);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("[CitiesCache] Failed to get cached city:", error);
    return null;
  }
}

// Get all cached cities
export async function getAllCachedCities(): Promise<City[]> {
  const cities: City[] = [];

  for (const slug of PRIORITY_CITIES) {
    const city = await getCachedCity(slug);
    if (city) {
      cities.push(city);
    }
  }

  return cities;
}

// Cache a single city
export async function cacheCity(slug: string, cityData: City): Promise<void> {
  try {
    const cacheEntry: CachedCityData = {
      slug,
      data: cityData,
      cachedAt: Date.now(),
      version: CACHE_VERSION,
    };

    localStorage.setItem(STORAGE_KEYS.CITY_PREFIX + slug, JSON.stringify(cacheEntry));

    // Update metadata
    await updateCacheMetadata((metadata) => {
      if (!metadata.cachedCities.includes(slug)) {
        metadata.cachedCities.push(slug);
      }
      metadata.lastSync = Date.now();
      return metadata;
    });

    console.log("[CitiesCache] Cached city:", slug);
  } catch (error) {
    console.error("[CitiesCache] Failed to cache city:", error);

    // If quota exceeded, clear old entries
    if ((error as Error).name === "QuotaExceededError") {
      await clearOldestCities(5);
      // Retry once
      await cacheCity(slug, cityData);
    }
  }
}

// Cache multiple cities
export async function cacheCities(cities: City[]): Promise<void> {
  for (const city of cities) {
    await cacheCity(city.slug, city);
  }
}

// Clear all cached cities
export async function clearCitiesCache(): Promise<void> {
  try {
    // Clear all city entries
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.CITY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    // Clear metadata
    localStorage.removeItem(STORAGE_KEYS.METADATA);

    console.log("[CitiesCache] Cleared all city caches");
  } catch (error) {
    console.error("[CitiesCache] Failed to clear cache:", error);
  }
}

// Clear oldest cached cities to free space
async function clearOldestCities(count: number): Promise<void> {
  try {
    const metadata = await getCitiesCacheMetadata();
    const citiesWithAge = metadata.cachedCities.map((slug) => ({
      slug,
      cachedAt: Number.parseInt(
        localStorage.getItem(STORAGE_KEYS.CITY_PREFIX + slug)?.match(/"cachedAt":(\d+)/)?.[1] ||
          "0",
        10,
      ),
    }));

    // Sort by cachedAt, oldest first
    citiesWithAge.sort((a, b) => a.cachedAt - b.cachedAt);

    // Remove oldest
    const toRemove = citiesWithAge.slice(0, count);
    for (const { slug } of toRemove) {
      localStorage.removeItem(STORAGE_KEYS.CITY_PREFIX + slug);
      metadata.cachedCities = metadata.cachedCities.filter((s) => s !== slug);
    }

    await updateCacheMetadata(() => metadata);
    console.log(
      "[CitiesCache] Cleared oldest cities:",
      toRemove.map((c) => c.slug),
    );
  } catch (error) {
    console.error("[CitiesCache] Failed to clear oldest cities:", error);
  }
}

// Update cache metadata
async function updateCacheMetadata(
  updater: (metadata: CitiesCacheMetadata) => CitiesCacheMetadata,
): Promise<void> {
  try {
    const current = await getCitiesCacheMetadata();
    const updated = updater(current);
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(updated));
  } catch (error) {
    console.error("[CitiesCache] Failed to update metadata:", error);
  }
}

// Preload cities from the app's data
export async function preloadCitiesCache(cities: City[]): Promise<void> {
  const cityMap = new Map(cities.map((c) => [c.slug, c]));

  for (const slug of PRIORITY_CITIES) {
    const city = cityMap.get(slug);
    if (city) {
      const cached = await getCachedCity(slug);
      if (!cached) {
        await cacheCity(slug, city);
      }
    }
  }
}

// Calculate total cache size
export async function getCacheSize(): Promise<number> {
  try {
    let totalSize = 0;

    // Cities
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("chinaconnect_")) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }

    return totalSize;
  } catch {
    return 0;
  }
}

// Export cache info for debugging
export async function getCacheInfo(): Promise<{
  metadata: CitiesCacheMetadata;
  size: number;
  sizeFormatted: string;
}> {
  const metadata = await getCitiesCacheMetadata();
  const size = await getCacheSize();

  // Format size
  let sizeFormatted: string;
  if (size < 1024) {
    sizeFormatted = `${size} B`;
  } else if (size < 1024 * 1024) {
    sizeFormatted = `${(size / 1024).toFixed(1)} KB`;
  } else {
    sizeFormatted = `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return { metadata, size, sizeFormatted };
}

// Send cache command to Service Worker
export function notifySWOfCacheUpdate(slug?: string): void {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_CITY",
      payload: slug ? { slug } : { all: true },
    });
  }
}

export default {
  getCitiesCacheMetadata,
  isCityCached,
  getCachedCity,
  getAllCachedCities,
  cacheCity,
  cacheCities,
  clearCitiesCache,
  preloadCitiesCache,
  getCacheSize,
  getCacheInfo,
  notifySWOfCacheUpdate,
};
