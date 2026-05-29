/**
 * WebSearch Tool for ChinaConnect AI
 * Wraps AnySearchService to provide structured web search results
 * for the MiniMax AI tool-calling system.
 */

import { getAnySearch, type SearchResponse } from "@/lib/ai/anysearch";

// ============================================
// Types
// ============================================

export interface WebSearchParams {
  query: string;
  location?: string;
  maxResults?: number;
}

export interface WebSearchResult {
  success: boolean;
  query: string;
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    source?: string;
  }>;
  totalResults: number;
  searchTimeMs: number;
  error?: string;
}

// ============================================
// WebSearch Tool Implementation
// ============================================

/**
 * Execute a web search using AnySearchService.
 * Returns structured JSON data suitable for AI consumption.
 */
export async function executeWebSearch(params: WebSearchParams): Promise<WebSearchResult> {
  const { query, location, maxResults = 5 } = params;

  if (!query || query.trim().length === 0) {
    return {
      success: false,
      query: query || "",
      results: [],
      totalResults: 0,
      searchTimeMs: 0,
      error: "Query parameter is required and cannot be empty.",
    };
  }

  try {
    const searchService = getAnySearch();
    const response: SearchResponse = await searchService.search(query, {
      location,
      useCache: true,
    });

    return {
      success: response.results.length > 0,
      query: response.query,
      results: response.results.slice(0, maxResults).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        source: r.source,
      })),
      totalResults: response.totalResults,
      searchTimeMs: response.searchTime,
    };
  } catch (error) {
    return {
      success: false,
      query,
      results: [],
      totalResults: 0,
      searchTimeMs: 0,
      error: `Web search failed: ${String(error)}`,
    };
  }
}

// ============================================
// Tool Definition for MiniMax API (OpenAI-compatible)
// ============================================

export const WebSearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "WebSearch",
    description:
      "Search the web for real-time information about travel destinations, attractions, restaurants, hotels, weather, events, and more in China. Returns structured search results with titles, URLs, and snippets.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The search query. Be specific for best results, e.g. 'best Sichuan restaurants in Chengdu' or 'Shanghai weather May 2026'.",
        },
        location: {
          type: "string",
          description:
            "Optional location context to improve search relevance, e.g. 'Beijing', 'Shanghai'.",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (1-10, default 5).",
        },
      },
      required: ["query"],
    },
  },
};
