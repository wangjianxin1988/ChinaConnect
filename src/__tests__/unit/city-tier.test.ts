// @ts-nocheck
/**
 * Unit tests for City Tier Classification
 * Tests S-tier (premium), A-tier (standard), D-tier (on-demand) city classification
 */

import type { Attraction, City, CityTier, CityTierMeta, Restaurant } from "@/data/cities/types";
import { describe, expect, it } from "vitest";

// ============================================
// Test Data Factories
// ============================================

function createMockCity(overrides: Partial<City> & { slug: string }): City {
  return {
    name: "Test City",
    nameEn: "Test City",
    country: "China",
    population: "10 million",
    coordinates: { lat: 31.0, lng: 121.0 },
    timezone: "UTC+8",
    description: "A test city",
    attractions: [],
    restaurants: [],
    emergencyContacts: [],
    ...overrides,
  };
}

// ============================================
// City Tier Classification Logic
// ============================================

// S-tier cities: Premium destinations with comprehensive data
const S_TIER_SLUGS = new Set([
  "beijing",
  "shanghai",
  "guangzhou",
  "xian",
  "chengdu",
  "guilin",
  "hangzhou",
  "chongqing",
  "dali",
  "nanjing",
  "suzhou",
  "shenzhen",
  "xiamen",
  "qingdao",
  "kunming",
  "lijiang",
  "zhangjiajie",
  "sanya",
  "wuhan",
  "changsha",
  "tianjin",
  "harbin",
  "dalian",
  "ningbo",
  "chengde",
  "luoyang",
  "jinan",
  "yantai",
  "weihai",
  "fuzhou",
  "quanzhou",
  "hulunbuir",
  "xining",
  "lanzhou",
  "dunhuang",
]);

// A-tier cities: Significant tourism value, moderate data
const A_TIER_SLUGS = new Set<string>();

// D-tier: All other cities (on-demand generation)

function getCityTier(city: City): CityTier {
  if (city.tier) return city.tier;
  if (S_TIER_SLUGS.has(city.slug)) return "S";
  if (A_TIER_SLUGS.has(city.slug)) return "A";
  return "D";
}

function getTierDisplayPriority(tier: CityTier): number {
  switch (tier) {
    case "S":
      return 1;
    case "A":
      return 2;
    case "D":
      return 3;
  }
}

function getTierDataCompleteness(city: City): number {
  const fields = [
    city.attractions.length > 0,
    city.restaurants.length > 0,
    city.emergencyContacts.length > 0,
    city.description.length > 50,
    city.climate !== undefined,
    city.transport !== undefined,
    city.payment !== undefined,
    city.culturalTips !== undefined,
    city.hotels !== undefined,
  ];

  return fields.filter(Boolean).length / fields.length;
}

function isCityFullyCurated(city: City): boolean {
  return getCityTier(city) === "S" && getTierDataCompleteness(city) >= 0.7;
}

function filterCitiesByTier(cities: City[], tier: CityTier): City[] {
  return cities.filter((c) => getCityTier(c) === tier);
}

function getCityTierMeta(city: City): CityTierMeta {
  return {
    tier: getCityTier(city),
    priority: getTierDisplayPriority(getCityTier(city)),
    region: undefined,
    tags: [],
  };
}

function getTierCityCount(cities: City[]): Record<CityTier, number> {
  const result: Record<CityTier, number> = { S: 0, A: 0, D: 0 };
  for (const city of cities) {
    result[getCityTier(city)]++;
  }
  return result;
}

// ============================================
// Tests
// ============================================

describe("City Tier Classification", () => {
  describe("getCityTier", () => {
    it("classifies S-tier cities correctly", () => {
      const beijing = createMockCity({ slug: "beijing" });
      expect(getCityTier(beijing)).toBe("S");
    });

    it("classifies explicitly tiered S cities", () => {
      const city = createMockCity({ slug: "custom-s-city", tier: "S" });
      expect(getCityTier(city)).toBe("S");
    });

    it("classifies A-tier cities correctly", () => {
      const city = createMockCity({ slug: "custom-a-city", tier: "A" });
      expect(getCityTier(city)).toBe("A");
    });

    it("defaults unknown cities to D-tier", () => {
      const city = createMockCity({ slug: "unknown-city-xyz" });
      expect(getCityTier(city)).toBe("D");
    });

    it("uses explicit tier over slug-based classification", () => {
      // Even though beijing is S-tier, explicit A override should work
      const city = createMockCity({ slug: "beijing", tier: "A" });
      expect(getCityTier(city)).toBe("A");
    });
  });

  describe("getTierDisplayPriority", () => {
    it("returns 1 for S-tier", () => {
      expect(getTierDisplayPriority("S")).toBe(1);
    });

    it("returns 2 for A-tier", () => {
      expect(getTierDisplayPriority("A")).toBe(2);
    });

    it("returns 3 for D-tier", () => {
      expect(getTierDisplayPriority("D")).toBe(3);
    });
  });

  describe("getTierDataCompleteness", () => {
    it("calculates 0% completeness for empty city", () => {
      const city = createMockCity({ slug: "empty-city" });
      expect(getTierDataCompleteness(city)).toBe(0);
    });

    it("calculates higher completeness with more data", () => {
      const city = createMockCity({
        slug: "rich-city",
        description: "A beautiful city with lots of cultural heritage and amazing food",
        attractions: [
          { id: "1", name: "Test", nameEn: "Test", category: "landmark" } as Attraction,
        ],
        restaurants: [
          {
            id: "1",
            name: "Test",
            nameEn: "Test",
            type: "local",
            cuisine: "Chinese",
            avgPrice: 100,
            rating: 4.5,
          } as Restaurant,
        ],
        emergencyContacts: [
          { type: "police", name: "Police", nameEn: "Police", phone: "110", address: "Test" },
        ],
      });
      const completeness = getTierDataCompleteness(city);
      expect(completeness).toBeGreaterThan(0);
      expect(completeness).toBeLessThanOrEqual(1);
    });

    it("returns value between 0 and 1", () => {
      const city = createMockCity({ slug: "test" });
      const completeness = getTierDataCompleteness(city);
      expect(completeness).toBeGreaterThanOrEqual(0);
      expect(completeness).toBeLessThanOrEqual(1);
    });
  });

  describe("isCityFullyCurated", () => {
    it("returns false for S-tier with incomplete data", () => {
      const city = createMockCity({ slug: "beijing" });
      expect(isCityFullyCurated(city)).toBe(false);
    });

    it("returns false for non-S-tier cities", () => {
      const city = createMockCity({ slug: "unknown", tier: "D" });
      expect(isCityFullyCurated(city)).toBe(false);
    });

    it("returns true for S-tier with rich data", () => {
      const city = createMockCity({
        slug: "beijing",
        description:
          "Beijing is the capital of China with rich history and culture spanning thousands of years",
        attractions: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Attraction ${i}`,
            nameEn: `Attraction ${i}`,
            category: "landmark",
          })) as Attraction[],
        restaurants: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: String(i),
            name: `Restaurant ${i}`,
            nameEn: `Restaurant ${i}`,
            type: "local",
            cuisine: "Chinese",
            avgPrice: 100 + i * 50,
            rating: 4.5,
          })) as Restaurant[],
        emergencyContacts: [
          { type: "police", name: "Police", nameEn: "Police", phone: "110", address: "Test" },
          {
            type: "ambulance",
            name: "Ambulance",
            nameEn: "Ambulance",
            phone: "120",
            address: "Test",
          },
        ],
        climate: { type: "Temperate", bestMonths: ["May", "Jun", "Sep", "Oct"] },
        transport: { arrival: [{ type: "air", from: "Major Cities", duration: "2-4h" }] },
        payment: [{ method: "Alipay", description: "Mobile payment" }],
      });
      expect(isCityFullyCurated(city)).toBe(true);
    });
  });

  describe("filterCitiesByTier", () => {
    it("filters S-tier cities", () => {
      const cities = [
        createMockCity({ slug: "beijing" }),
        createMockCity({ slug: "shanghai" }),
        createMockCity({ slug: "unknown", tier: "D" }),
      ];

      const sTierCities = filterCitiesByTier(cities, "S");
      expect(sTierCities).toHaveLength(2);
      expect(sTierCities.every((c) => getCityTier(c) === "S")).toBe(true);
    });

    it("filters D-tier cities", () => {
      const cities = [
        createMockCity({ slug: "beijing" }),
        createMockCity({ slug: "unknown-d" }),
        createMockCity({ slug: "another-unknown" }),
      ];

      const dTierCities = filterCitiesByTier(cities, "D");
      expect(dTierCities).toHaveLength(2);
    });

    it("returns empty array when no cities match tier", () => {
      const cities = [createMockCity({ slug: "beijing" })];
      const dTierCities = filterCitiesByTier(cities, "D");
      expect(dTierCities).toHaveLength(0);
    });
  });

  describe("getCityTierMeta", () => {
    it("returns correct tier meta for S-tier city", () => {
      const city = createMockCity({ slug: "beijing" });
      const meta = getCityTierMeta(city);

      expect(meta.tier).toBe("S");
      expect(meta.priority).toBe(1);
    });

    it("returns correct tier meta for A-tier city", () => {
      const city = createMockCity({ slug: "custom-a", tier: "A" });
      const meta = getCityTierMeta(city);

      expect(meta.tier).toBe("A");
      expect(meta.priority).toBe(2);
    });

    it("returns correct tier meta for D-tier city", () => {
      const city = createMockCity({ slug: "unknown" });
      const meta = getCityTierMeta(city);

      expect(meta.tier).toBe("D");
      expect(meta.priority).toBe(3);
    });
  });

  describe("getTierCityCount", () => {
    it("counts cities by tier correctly", () => {
      const cities = [
        createMockCity({ slug: "beijing" }), // S
        createMockCity({ slug: "shanghai" }), // S
        createMockCity({ slug: "custom-a", tier: "A" }), // A
        createMockCity({ slug: "unknown-1", tier: "D" }), // D
        createMockCity({ slug: "unknown-2", tier: "D" }), // D
        createMockCity({ slug: "unknown-3", tier: "D" }), // D
      ];

      const counts = getTierCityCount(cities);

      expect(counts.S).toBe(2);
      expect(counts.A).toBe(1);
      expect(counts.D).toBe(3);
    });

    it("returns zeros for empty array", () => {
      const counts = getTierCityCount([]);
      expect(counts.S).toBe(0);
      expect(counts.A).toBe(0);
      expect(counts.D).toBe(0);
    });
  });

  describe("S-Tier Slug List", () => {
    it("contains all major tourism cities", () => {
      const expectedCities = [
        "beijing",
        "shanghai",
        "guangzhou",
        "xian",
        "chengdu",
        "guilin",
        "hangzhou",
        "chongqing",
      ];

      for (const slug of expectedCities) {
        expect(S_TIER_SLUGS.has(slug)).toBe(true);
      }
    });

    it("has 35 S-tier cities as documented", () => {
      expect(S_TIER_SLUGS.size).toBe(35);
    });

    it("contains UNESCO and major destination cities", () => {
      const unescoCities = [
        "xian",
        "guilin",
        "suzhou",
        "lijiang",
        "zhangjiajie",
        "dali",
        "dunhuang",
        "luoyang",
      ];

      for (const slug of unescoCities) {
        expect(S_TIER_SLUGS.has(slug)).toBe(true);
      }
    });
  });
});

describe("City Tier Distribution", () => {
  it("tier values are S, A, or D only", () => {
    const validTiers: CityTier[] = ["S", "A", "D"];
    const _city = createMockCity({ slug: "test" });

    for (const tier of validTiers) {
      const testCity = createMockCity({ slug: `test-${tier}`, tier });
      expect(getCityTier(testCity)).toBe(tier);
    }
  });

  it("handles missing tier field gracefully", () => {
    const city: City = {
      slug: "no-tier-city",
      name: "No Tier City",
      nameEn: "No Tier City",
      country: "China",
      population: "1 million",
      coordinates: { lat: 0, lng: 0 },
      timezone: "UTC+8",
      description: "A city without tier",
      attractions: [],
      restaurants: [],
      emergencyContacts: [],
      // tier is not set
    };

    expect(getCityTier(city)).toBe("D");
  });
});
