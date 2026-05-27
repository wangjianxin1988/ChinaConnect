/**
 * City Scoring Engine
 * Calculates composite scores from multiple data sources
 *
 * Weights:
 * - Economy: 30%
 * - International: 25%
 * - Tourism: 25%
 * - Livability: 20%
 */

import type { ScrapeResult } from "./base-scraper";
import { ctripScraper, dazhongScraper, gaodeScraper, gawcScraper, yicaiScraper } from "./index";
import type { CityScoreInput, CitySourceMetric, SourceType } from "./types";
import { DIMENSION_WEIGHTS, TIER_THRESHOLDS } from "./types";

export interface ScoringResult {
  citySlug: string;
  scores: CityScoreInput;
  sourceResults: ScrapeResult[];
}

export interface ScoringSummary {
  totalCities: number;
  successfulSources: number;
  failedSources: number;
  calculatedAt: Date;
  results: ScoringResult[];
}

/**
 * Calculate tier based on composite score
 */
export function calculateTier(score: number): "S" | "A" | "B" | "C" | "D" {
  if (score >= TIER_THRESHOLDS.S) return "S";
  if (score >= TIER_THRESHOLDS.A) return "A";
  if (score >= TIER_THRESHOLDS.B) return "B";
  if (score >= TIER_THRESHOLDS.C) return "C";
  return "D";
}

/**
 * City Scoring Engine
 * Aggregates metrics from all sources and calculates composite scores
 */
export class CityScoringEngine {
  private sourceWeights: Record<SourceType, number>;
  private dimensionWeights = DIMENSION_WEIGHTS;

  constructor() {
    this.sourceWeights = {
      yicai: 0.3,
      gawc: 0.25,
      ctrip: 0.15,
      gaode: 0.1,
      dazhong: 0.2,
    };
  }

  /**
   * Run all scrapers and calculate scores for all cities
   */
  async calculateAllScores(): Promise<ScoringSummary> {
    const scrapeResults: ScrapeResult[] = [];
    const scoringResults: ScoringResult[] = [];

    // Scrape all sources in parallel
    const scrapePromises = [
      yicaiScraper.scrape(),
      gawcScraper.scrape(),
      ctripScraper.scrape(),
      gaodeScraper.scrape(),
      dazhongScraper.scrape(),
    ];

    const results = await Promise.allSettled(scrapePromises);

    // Process results
    let successfulSources = 0;
    let failedSources = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        scrapeResults.push(result.value);
        if (result.value.success) successfulSources++;
        else failedSources++;
      } else {
        failedSources++;
      }
    }

    // Group metrics by city
    const cityMetrics = this.groupMetricsByCity(scrapeResults);

    // Calculate scores for each city
    for (const [citySlug, metrics] of Object.entries(cityMetrics)) {
      const scores = this.calculateCityScores(citySlug, metrics);
      scoringResults.push({
        citySlug,
        scores,
        sourceResults: scrapeResults.filter((r) => r.metrics.some((m) => m.citySlug === citySlug)),
      });
    }

    // Sort by composite score descending
    scoringResults.sort((a, b) => b.scores.compositeScore - a.scores.compositeScore);

    // Assign ranks
    scoringResults.forEach((_result, index) => {
      const existingResult = scoringResults[index];
      if (existingResult) {
        existingResult.scores.overallRank = index + 1;
      }
    });

    return {
      totalCities: scoringResults.length,
      successfulSources,
      failedSources,
      calculatedAt: new Date(),
      results: scoringResults,
    };
  }

  /**
   * Group all metrics by city slug
   */
  private groupMetricsByCity(scrapeResults: ScrapeResult[]): Record<string, CitySourceMetric[]> {
    const cityMetrics: Record<string, CitySourceMetric[]> = {};

    for (const result of scrapeResults) {
      if (!result.success) continue;

      for (const metric of result.metrics) {
        if (!cityMetrics[metric.citySlug]) {
          cityMetrics[metric.citySlug] = [];
        }
        cityMetrics[metric.citySlug].push(metric);
      }
    }

    return cityMetrics;
  }

  /**
   * Calculate composite scores for a single city
   */
  private calculateCityScores(citySlug: string, metrics: CitySourceMetric[]): CityScoreInput {
    // Calculate dimension scores by weighted average across sources
    const dimensionScores = {
      economy: this.calculateDimensionScore(metrics, "economy"),
      international: this.calculateDimensionScore(metrics, "international"),
      tourism: this.calculateDimensionScore(metrics, "tourism"),
      livability: this.calculateDimensionScore(metrics, "livability"),
    };

    // Calculate composite score
    const compositeScore =
      dimensionScores.economy * this.dimensionWeights.economy +
      dimensionScores.international * this.dimensionWeights.international +
      dimensionScores.tourism * this.dimensionWeights.tourism +
      dimensionScores.livability * this.dimensionWeights.livability;

    // Calculate breakdown for transparency
    const breakdown = this.calculateBreakdown(metrics, dimensionScores);

    return {
      citySlug,
      economyScore: Math.round(dimensionScores.economy * 100) / 100,
      internationalScore: Math.round(dimensionScores.international * 100) / 100,
      tourismScore: Math.round(dimensionScores.tourism * 100) / 100,
      livabilityScore: Math.round(dimensionScores.livability * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      tier: calculateTier(compositeScore),
      breakdown,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate score for a specific dimension across all sources
   */
  private calculateDimensionScore(
    metrics: CitySourceMetric[],
    dimension: "economy" | "international" | "tourism" | "livability",
  ): number {
    const dimensionMetrics = metrics.filter((m) => m.metricType === dimension);

    if (dimensionMetrics.length === 0) return 0;

    // Weighted average across sources
    let weightedSum = 0;
    let totalWeight = 0;

    for (const metric of dimensionMetrics) {
      const weight = this.sourceWeights[metric.source] || 0;
      weightedSum += metric.value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate detailed breakdown for transparency
   */
  private calculateBreakdown(
    metrics: CitySourceMetric[],
    _dimensionScores: Record<string, number>,
  ): CityScoreInput["breakdown"] {
    const breakdown: CityScoreInput["breakdown"] = [];
    const sources: SourceType[] = ["yicai", "gawc", "ctrip", "gaode", "dazhong"];
    const dimensions = ["economy", "international", "tourism", "livability"] as const;

    for (const source of sources) {
      const sourceMetrics = metrics.filter((m) => m.source === source);
      if (sourceMetrics.length === 0) continue;

      const weight = this.sourceWeights[source];

      for (const dimension of dimensions) {
        const metric = sourceMetrics.find((m) => m.metricType === dimension);
        if (!metric) continue;

        breakdown.push({
          source,
          weight,
          rawScore: metric.value,
          weightedContribution: (metric.value * weight * this.dimensionWeights[dimension]) / 100,
        });
      }
    }

    return breakdown;
  }

  /**
   * Get scoring engine version
   */
  getVersion(): string {
    return "1.0.0";
  }
}

export const cityScoringEngine = new CityScoringEngine();
