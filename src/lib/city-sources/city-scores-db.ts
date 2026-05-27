/**
 * City Scores Database Operations
 * Store and retrieve city scoring data from Supabase
 */

import { supabase } from "@/services/supabase";
import type { CityScoreInput } from "./types";

interface DataSourceConfig {
  id: string;
  source_name: string;
  source_type: string;
  base_url: string | null;
  api_key: string | null;
  last_fetch_at: string | null;
  fetch_interval_hours: number;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StoredCityScore {
  id: string;
  cityId: string;
  citySlug: string;
  compositeScore: number;
  economyScore: number;
  internationalScore: number;
  tourismScore: number;
  livabilityScore: number;
  tier: "S" | "A" | "B" | "C" | "D";
  overallRank: number | null;
  scoreBreakdown: CityScoreInput["breakdown"];
  calculatedAt: string;
}

export interface StoredCityImage {
  cityId: string;
  imageUrl: string;
  imageType: "cover" | "hero" | "gallery" | "attraction";
  isPrimary: boolean;
}

/**
 * Save city scores to database
 */
export async function saveCityScores(
  scores: CityScoreInput[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get city IDs from slug
    const cityIds = await getCityIdsFromSlugs(scores.map((s) => s.citySlug));
    if (!cityIds) {
      return { success: false, error: "Failed to get city IDs" };
    }

    // Upsert scores
    const scoreRecords = scores
      .filter((score) => cityIds[score.citySlug])
      .map((score) => ({
        city_id: cityIds[score.citySlug],
        composite_score: score.compositeScore,
        economy_score: score.economyScore,
        international_score: score.internationalScore,
        tourism_score: score.tourismScore,
        livability_score: score.livabilityScore,
        tier: score.tier,
        overall_rank: score.overallRank,
        score_breakdown: score.breakdown as unknown as Record<string, unknown>,
        calculated_at: score.calculatedAt.toISOString(),
      }));

    const { error } = await supabase.from("city_scores").upsert(scoreRecords as never[], {
      onConflict: "city_id",
    });

    if (error) {
      console.error("Error saving city scores:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in saveCityScores:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get city IDs from slugs
 */
async function getCityIdsFromSlugs(slugs: string[]): Promise<Record<string, string> | null> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  const { data, error } = await (supabase as any)
    .from("cities")
    .select("id, slug")
    .in("slug", slugs);

  if (error || !data) {
    console.error("Error fetching city IDs:", error);
    return null;
  }

  return data.reduce(
    (acc: Record<string, string>, city: { slug: string; id: string }) => {
      acc[city.slug] = city.id;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Get city scores with city information
 */
export async function getCityScores(): Promise<StoredCityScore[]> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase complex join typing requires any
  const { data, error } = await (supabase as any)
    .from("city_scores")
    .select(
      `
      id,
      city_id,
      composite_score,
      economy_score,
      international_score,
      tourism_score,
      livability_score,
      tier,
      overall_rank,
      score_breakdown,
      calculated_at,
      cities!inner(slug)
    `,
    )
    .order("composite_score", { ascending: false });

  if (error) {
    console.error("Error fetching city scores:", error);
    return [];
  }

  return (
    data?.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      cityId: row.city_id as string,
      citySlug: (row.cities as unknown as { slug: string }).slug,
      compositeScore: row.composite_score as number,
      economyScore: row.economy_score as number,
      internationalScore: row.international_score as number,
      tourismScore: row.tourism_score as number,
      livabilityScore: row.livability_score as number,
      tier: row.tier as "S" | "A" | "B" | "C" | "D",
      overallRank: row.overall_rank as number | null,
      scoreBreakdown: row.score_breakdown as CityScoreInput["breakdown"],
      calculatedAt: row.calculated_at as string,
    })) || []
  );
}

/**
 * Get data source configurations
 */
export async function getDataSourceConfigs(): Promise<DataSourceConfig[]> {
  const { data, error } = await supabase
    .from("data_source_configs")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching data source configs:", error);
    return [];
  }

  return (data as unknown as DataSourceConfig[]) || [];
}

/**
 * Update data source last fetch time
 */
export async function updateDataSourceFetchTime(sourceName: string): Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  await (supabase as any)
    .from("data_source_configs")
    .update({ last_fetch_at: new Date().toISOString() })
    .eq("source_name", sourceName);
}

/**
 * Save city score history for tracking changes over time
 */
export async function saveCityScoreHistory(
  scores: CityScoreInput[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const cityIds = await getCityIdsFromSlugs(scores.map((s) => s.citySlug));
    if (!cityIds) {
      return { success: false, error: "Failed to get city IDs" };
    }

    const historyRecords = scores
      .filter((score) => cityIds[score.citySlug])
      .map((score) => ({
        city_id: cityIds[score.citySlug],
        composite_score: score.compositeScore,
        economy_score: score.economyScore,
        international_score: score.internationalScore,
        tourism_score: score.tourismScore,
        livability_score: score.livabilityScore,
        tier: score.tier,
        recorded_at: new Date().toISOString().split("T")[0],
      }));

    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
    const { error } = await (supabase as any).from("city_score_history").upsert(historyRecords, {
      onConflict: "city_id,recorded_at",
    });

    if (error) {
      console.error("Error saving city score history:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get city images for a city
 */
export async function getCityImages(citySlug: string): Promise<StoredCityImage[]> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  const { data, error } = await (supabase as any)
    .from("city_images")
    .select("city_id, image_url, image_type, is_primary")
    .eq("cities.slug", citySlug);

  if (error) {
    console.error("Error fetching city images:", error);
    return [];
  }

  return (
    data?.map(
      (row: { city_id: string; image_url: string; image_type: string; is_primary: boolean }) => ({
        cityId: row.city_id,
        imageUrl: row.image_url,
        imageType: row.image_type,
        isPrimary: row.is_primary,
      }),
    ) || []
  );
}

/**
 * Get score update logs
 */
export async function getScoreUpdateLogs(limit = 10) {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  const { data, error } = await (supabase as any)
    .from("score_update_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching score update logs:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new score update log entry
 */
export async function createScoreUpdateLog(runId: string): Promise<string> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  const { data, error } = await (supabase as any)
    .from("score_update_logs")
    .insert({ run_id: runId, status: "running" })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating score update log:", error);
    throw error;
  }

  return data.id;
}

/**
 * Update score update log entry
 */
export async function updateScoreUpdateLog(
  logId: string,
  updates: {
    status?: "success" | "failed" | "partial";
    cities_updated?: number;
    calculation_duration_ms?: number;
    error_message?: string;
    completed_at?: string;
  },
): Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
  await (supabase as any)
    .from("score_update_logs")
    .update({
      ...updates,
      completed_at: updates.completed_at || new Date().toISOString(),
    })
    .eq("id", logId);
}
