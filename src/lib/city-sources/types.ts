/**
 * City Scoring Data Sources
 * Types and interfaces for multi-source city ranking data
 */

export type SourceType = "yicai" | "gawc" | "ctrip" | "gaode" | "dazhong";

export interface CitySourceMetric {
  citySlug: string;
  source: SourceType;
  metricType: "economy" | "international" | "tourism" | "livability";
  value: number;
  unit: string;
  rawData: Record<string, unknown>;
  fetchedAt: Date;
}

export interface CityScoreInput {
  citySlug: string;
  economyScore: number;
  internationalScore: number;
  tourismScore: number;
  livabilityScore: number;
  compositeScore: number;
  tier: "S" | "A" | "B" | "C" | "D";
  overallRank?: number | null;
  breakdown: {
    source: SourceType;
    weight: number;
    rawScore: number;
    weightedContribution: number;
  }[];
  calculatedAt: Date;
}

export interface DataSourceConfig {
  name: SourceType;
  baseUrl: string;
  weights: {
    economy: number;
    international: number;
    tourism: number;
    livability: number;
  };
  updateFrequencyHours: number;
  lastFetchAt?: Date;
  isActive: boolean;
}

export const SOURCE_WEIGHTS: Record<SourceType, number> = {
  yicai: 0.3, // 第一财经
  gawc: 0.25, // GaWC
  ctrip: 0.15, // 携程
  gaode: 0.1, // 高德
  dazhong: 0.2, // 大众点评
};

export const DIMENSION_WEIGHTS = {
  economy: 0.3,
  international: 0.25,
  tourism: 0.25,
  livability: 0.2,
};

export const TIER_THRESHOLDS = {
  S: 85,
  A: 70,
  B: 55,
  C: 40,
  D: 0,
};
