/**
 * AnySearch Integration for ChinaConnect AI
 * Real-time web search capabilities via AnySearch MCP tool
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  location?: string;
}

// ============================================
// AnySearch API Integration
// ============================================

const ANYSEARCH_API_KEY = typeof import.meta !== "undefined" ? import.meta.env?.VITE_ANYSEARCH_API_KEY : undefined;
const ANYSEARCH_BASE_URL = "https://api.anysearch.com/v1";

/**
 * Call AnySearch API directly (when MCP is not available)
 */
async function callAnySearchAPI(
  query: string,
  options?: { location?: string; maxResults?: number },
): Promise<SearchResponse | null> {
  if (!ANYSEARCH_API_KEY) return null;

  const startTime = Date.now();

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      max_results: String(options?.maxResults || 10),
    });
    if (options?.location) params.set("location", options.location);

    const response = await fetch(`${ANYSEARCH_BASE_URL}/search?${params}`, {
      headers: {
        Authorization: `Bearer ${ANYSEARCH_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`AnySearch API error: ${response.status}`);
    }

    const data = await response.json();

    const results: SearchResult[] = (data.results || []).map((r: { title: string; url: string; snippet: string; source?: string; published_date?: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.snippet,
      source: r.source,
      publishedDate: r.published_date,
    }));

    return {
      query,
      results,
      totalResults: results.length,
      searchTime: Date.now() - startTime,
      location: options?.location,
    };
  } catch (error) {
    console.warn("AnySearch API call failed:", error);
    return null;
  }
}

// MCP AnySearch Call - Gracefully handle when MCP is not available
export async function callMCPAnySearch(_query: string): Promise<SearchResponse | null> {
  // MCP is not reliably available in all deployment environments
  // Return null to always use the fallback search method
  return null;
}

// Check if MCP tools are available (optional enhancement)
async function isMCPEnabled(): Promise<boolean> {
  // Always return false to use fallback search
  // MCP can be enabled by setting up the MCP server with proper AnySearch API
  return false;
}

// Check if AnySearch API key is configured
function isAnySearchAPIAvailable(): boolean {
  return !!ANYSEARCH_API_KEY;
}

// Fallback search using public APIs when MCP is not available
async function fallbackSearch(query: string, location?: string): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    // Use DuckDuckGo Instant Answer API (free, no API key)
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;

    const response = await fetch(ddgUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();

    const results: SearchResult[] = [];

    // Parse DuckDuckGo response
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 10)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: extractTitle(topic.Text),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: "DuckDuckGo",
          });
        }
      }
    }

    // Add Answer if available
    if (data.AbstractText) {
      results.unshift({
        title: data.Heading || "Answer",
        url: data.AbstractURL || "",
        snippet: data.AbstractText,
        source: data.ImageIsLogo ? undefined : "Wikipedia",
        publishedDate: data.AbstractSource,
      });
    }

    return {
      query,
      results,
      totalResults: results.length,
      searchTime: Date.now() - startTime,
      location: location || data.geo?.country || undefined,
    };
  } catch (error) {
    console.error("Fallback search failed:", error);
    return {
      query,
      results: [],
      totalResults: 0,
      searchTime: Date.now() - startTime,
    };
  }
}

function extractTitle(text: string): string {
  // Try to extract a title from the snippet
  const match = text.match(/^([^.!?]+)/);
  return match ? match[1].trim().slice(0, 80) : text.slice(0, 80);
}

// ============================================
// Main Search Function
// ============================================

export class AnySearchService {
  private mcpEnabled = false;
  private searchHistory: Map<string, SearchResponse> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.mcpEnabled = await isMCPEnabled();
      const hasAPIKey = isAnySearchAPIAvailable();
      console.log(`AnySearch: MCP ${this.mcpEnabled ? "enabled" : "disabled"}, API Key ${hasAPIKey ? "configured" : "not configured"}, using fallback`);
    } catch {
      this.mcpEnabled = false;
    }

    this.initialized = true;
  }

  async search(
    query: string,
    options?: {
      location?: string;
      language?: string;
      useCache?: boolean;
    },
  ): Promise<SearchResponse> {
    // Check cache
    const cacheKey = `${query}_${options?.location || ""}_${options?.language || "en"}`;

    if (options?.useCache !== false) {
      const cached = this.searchHistory.get(cacheKey);
      if (cached && Date.now() - cached.searchTime < this.cacheExpiry) {
        return cached;
      }
    }

    let response: SearchResponse;

    // Priority: MCP > Direct API > Fallback
    if (this.mcpEnabled) {
      const mcpResult = await callMCPAnySearch(query);
      response = mcpResult || (await this.tryDirectAPIOrFallback(query, options?.location));
    } else {
      response = await this.tryDirectAPIOrFallback(query, options?.location);
    }

    // Cache result
    this.searchHistory.set(cacheKey, response);

    return response;
  }

  private async tryDirectAPIOrFallback(query: string, location?: string): Promise<SearchResponse> {
    // Try direct AnySearch API first
    const apiResult = await callAnySearchAPI(query, { location, maxResults: 10 });
    if (apiResult && apiResult.results.length > 0) {
      return apiResult;
    }
    // Fall back to DuckDuckGo
    return fallbackSearch(query, location);
  }

  async searchMultiple(queries: string[]): Promise<SearchResponse[]> {
    const results = await Promise.all(queries.map((q) => this.search(q)));
    return results;
  }

  async enrichWithWebData(userMessage: string): Promise<string> {
    const response = await this.search(userMessage, { useCache: true });

    if (response.results.length === 0) {
      return "";
    }

    // Format results for AI context
    let enrichment = "\n\n## Real-time Web Data (via AnySearch)\n\n";

    enrichment += `Search for: "${response.query}" (${response.totalResults} results, ${response.searchTime}ms)\n\n`;

    for (const result of response.results.slice(0, 5)) {
      enrichment += `**${result.title}**\n`;
      enrichment += `${result.snippet.slice(0, 200)}...\n`;
      enrichment += `Source: ${result.url}\n\n`;
    }

    return enrichment;
  }

  clearCache(): void {
    this.searchHistory.clear();
  }

  isMCPAvailable(): boolean {
    return this.mcpEnabled || isAnySearchAPIAvailable();
  }

  getSearchHistory(): SearchResponse[] {
    return Array.from(this.searchHistory.values());
  }
}

// ============================================
// Common Travel Search Templates
// ============================================

export const SEARCH_TEMPLATES = {
  weather: (city: string, date?: string) => `weather forecast ${city}${date ? ` ${date}` : ""}`,

  attractions: (city: string) => `top tourist attractions ${city} 2026`,

  restaurants: (city: string, cuisine?: string) =>
    `best ${cuisine || ""} restaurants ${city} reviews`.trim(),

  hotels: (city: string, budget?: string) => `best hotels ${city} ${budget || ""} booking`.trim(),

  transport: (from: string, to: string) => `train from ${from} to ${to} schedule price`,

  events: (city: string, month: string) => `events festivals ${city} ${month} 2026`,

  travel_advisory: (country: string) => `travel advisory ${country} safety visa requirements`,

  exchange_rate: (from: string, to: string) => `${from} to ${to} exchange rate today`,
};

// ============================================
// Singleton instance
// ============================================

let searchInstance: AnySearchService | null = null;

export function getAnySearch(): AnySearchService {
  if (!searchInstance) {
    searchInstance = new AnySearchService();
    // Initialize asynchronously
    searchInstance.initialize().catch(console.error);
  }
  return searchInstance;
}

// Export class for direct instantiation if needed
export { AnySearchService as default };
