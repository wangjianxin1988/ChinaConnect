/**
 * Base scraper interface for city data sources
 */

import type { CitySourceMetric, SourceType } from "./types";

export interface ScraperConfig {
  source: SourceType;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface ScrapeResult {
  source: SourceType;
  metrics: CitySourceMetric[];
  fetchedAt: Date;
  success: boolean;
  error?: string;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  abstract scrape(): Promise<ScrapeResult>;

  protected async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "ChinaConnect/1.0 (City Ranking Data Fetcher)",
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof DOMException && error.name === "AbortException") {
          lastError = new Error(`Timeout after ${this.config.timeout}ms`);
        }

        if (attempt < this.config.retryAttempts) {
          await this.delay(2 ** attempt * 100);
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected normalizeValue(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  }

  getSource(): SourceType {
    return this.config.source;
  }
}
