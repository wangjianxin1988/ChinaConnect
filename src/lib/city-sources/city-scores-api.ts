/**
 * City Scores API Client
 * Client-side service for fetching and displaying city scores
 */

import {
  type StoredCityScore,
  getCityScores as dbGetCityScores,
  getScoreUpdateLogs,
} from "./city-scores-db";
import { type ScoringSummary, cityScoringEngine } from "./index";

export interface CityScoreDisplay {
  slug: string;
  name: string;
  nameZh: string;
  compositeScore: number;
  economyScore: number;
  internationalScore: number;
  tourismScore: number;
  livabilityScore: number;
  tier: "S" | "A" | "B" | "C" | "D";
  rank: number | null;
  coverImage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface _CityMeta {
  slug: string;
  name: string;
  nameZh: string;
  coverImage?: string;
}

/**
 * Fetch city scores from database
 * Falls back to calculating scores from scrapers if database is empty (server-side only)
 */
export async function fetchCityScores(): Promise<CityScoreDisplay[]> {
  // Try to get scores from database first
  const storedScores = await dbGetCityScores();

  if (storedScores.length > 0) {
    // Enrich with city metadata
    return enrichScoresWithMeta(storedScores);
  }

  // Only fall back to scrapers in server-side environment (Node.js)
  // In browser, we just return empty array if no scores in DB
  if (typeof window === "undefined") {
    console.log("No stored scores found, calculating from scrapers...");
    try {
      const scoringSummary = await cityScoringEngine.calculateAllScores();
      return scoringSummary.results.map((result) => ({
        slug: result.citySlug,
        name: result.citySlug.charAt(0).toUpperCase() + result.citySlug.slice(1),
        nameZh: result.citySlug,
        compositeScore: result.scores.compositeScore,
        economyScore: result.scores.economyScore,
        internationalScore: result.scores.internationalScore,
        tourismScore: result.scores.tourismScore,
        livabilityScore: result.scores.livabilityScore,
        tier: result.scores.tier,
        rank: result.scores.overallRank ?? null,
      }));
    } catch (error) {
      console.error("Error calculating scores:", error);
    }
  } else {
    console.warn("No city scores in database and scrapers unavailable in browser");
  }

  return [];
}

/**
 * Enrich stored scores with city metadata
 */
function enrichScoresWithMeta(storedScores: StoredCityScore[]): CityScoreDisplay[] {
  return storedScores.map((score) => ({
    slug: score.citySlug,
    name: score.citySlug.charAt(0).toUpperCase() + score.citySlug.slice(1),
    nameZh: score.citySlug,
    compositeScore: score.compositeScore,
    economyScore: score.economyScore,
    internationalScore: score.internationalScore,
    tourismScore: score.tourismScore,
    livabilityScore: score.livabilityScore,
    tier: score.tier,
    rank: score.overallRank,
  }));
}

/**
 * Get city scores with full breakdown for detail page
 */
export async function getCityScoreDetail(slug: string): Promise<CityScoreDisplay | null> {
  const scores = await fetchCityScores();
  return scores.find((s) => s.slug === slug) || null;
}

/**
 * Get top cities by composite score
 */
export async function getTopCities(limit = 10): Promise<CityScoreDisplay[]> {
  const scores = await fetchCityScores();
  return scores.slice(0, limit);
}

/**
 * Get cities by tier
 */
export async function getCitiesByTier(
  tier: "S" | "A" | "B" | "C" | "D",
): Promise<CityScoreDisplay[]> {
  const scores = await fetchCityScores();
  return scores.filter((s) => s.tier === tier);
}

/**
 * Search cities by name
 */
export async function searchCities(query: string): Promise<CityScoreDisplay[]> {
  const scores = await fetchCityScores();
  const lowerQuery = query.toLowerCase();

  return scores.filter(
    (s) =>
      s.slug.toLowerCase().includes(lowerQuery) ||
      s.name.toLowerCase().includes(lowerQuery) ||
      s.nameZh.includes(query),
  );
}

/**
 * Get scoring update history
 */
export async function getScoringHistory(limit = 10) {
  return getScoreUpdateLogs(limit);
}

/**
 * Manually trigger score recalculation
 * Note: This should be called from a server-side context or with proper authorization
 */
export async function triggerScoreRecalculation(): Promise<ScoringSummary> {
  const summary = await cityScoringEngine.calculateAllScores();
  return summary;
}

/**
 * Get data source status
 */
export function getDataSourceStatus(): Array<{
  name: string;
  source: string;
  lastFetch?: Date;
  status: "active" | "inactive";
}> {
  return [
    {
      name: "第一财经·新一线研究所",
      source: "yicai",
      status: "active",
    },
    {
      name: "GaWC世界城市排名",
      source: "gawc",
      status: "active",
    },
    {
      name: "携程旅游",
      source: "ctrip",
      status: "active",
    },
    {
      name: "高德地图",
      source: "gaode",
      status: "active",
    },
    {
      name: "大众点评",
      source: "dazhong",
      status: "active",
    },
  ];
}
