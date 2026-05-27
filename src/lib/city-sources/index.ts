/**
 * City Data Sources - Main Index
 * Orchestrates all data source scrapers for city scoring
 */

export { yicaiScraper, YicaiScraper } from "./yicai-scraper";
export { gawcScraper, GaWCScraper } from "./gawc-scraper";
export { ctripScraper, CtripScraper } from "./ctrip-scraper";
export { gaodeScraper, GaodeScraper } from "./gaode-scraper";
export { dazhongScraper, DazhongScraper } from "./dazhong-scraper";

export { BaseScraper, type ScrapeResult, type ScraperConfig } from "./base-scraper";
export {
  type SourceType,
  type CitySourceMetric,
  type CityScoreInput,
  type DataSourceConfig,
  SOURCE_WEIGHTS,
  DIMENSION_WEIGHTS,
  TIER_THRESHOLDS,
} from "./types";

export {
  CityScoringEngine,
  cityScoringEngine,
  calculateTier,
  type ScoringResult,
  type ScoringSummary,
} from "./scoring-engine";

export {
  saveCityScores,
  getCityScores,
  getDataSourceConfigs,
  updateDataSourceFetchTime,
  saveCityScoreHistory,
  getCityImages,
  getScoreUpdateLogs,
  createScoreUpdateLog,
  updateScoreUpdateLog,
  type StoredCityScore,
  type StoredCityImage,
} from "./city-scores-db";
