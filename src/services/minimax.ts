/**
 * MiniMax AI Client for ChinaConnect — client-side wrapper around the Supabase Edge Function.
 *
 * Why this changed:
 *   The previous build hard-coded /api/chat but Astro config is `output: "static"` (Cloudflare Pages),
 *   so there was no server runtime to handle that endpoint. AI chat has been broken since launch.
 *   This module now POSTs to `https://<project>.supabase.co/functions/v1/chat`, which
 *   authenticates the user, enforces monthly usage limits, runs the tool-calling loop
 *   against Supabase DB + MiniMax, and persists the conversation server-side.
 *
 * No API keys are used or exposed client-side. All MiniMax communication happens in the Edge Function.
 */

import { supabase } from "@/supabase/config";

// ---------------------------------------------------------------------------
// Imports kept for backward compatibility (executed only when caller passes tools through)
// ---------------------------------------------------------------------------
import { executeTool } from "@/lib/ai/tools";
import { executeWebSearch } from "@/lib/ai/search/web-search";
import { executeAmapPOISearch } from "@/lib/ai/search/amap-poi";
import { executeAmapRouteSearch } from "@/lib/ai/search/amap-route";

// ---------------------------------------------------------------------------
// Async Tool Execution (kept for callers that still want client-side tool execution)
// ---------------------------------------------------------------------------

async function executeToolAsync(name: string, args: Record<string, string>): Promise<string> {
  try {
    switch (name) {
      case "WebSearch": {
        const result = await executeWebSearch({
          query: args.query || "",
          location: args.location,
          maxResults: args.maxResults ? Number(args.maxResults) : 5,
        });
        return JSON.stringify(result);
      }
      case "AmapPOISearch": {
        const result = await executeAmapPOISearch({
          keywords: args.keywords || "",
          city: args.city,
          type: args.type,
          page: args.page ? Number(args.page) : 1,
          pageSize: args.pageSize ? Number(args.pageSize) : 10,
        });
        return JSON.stringify(result);
      }
      case "AmapRouteSearch": {
        const result = await executeAmapRouteSearch({
          origin: args.origin || "",
          destination: args.destination || "",
          mode: (args.mode as "driving" | "transit" | "walking" | "riding") || "driving",
          city: args.city,
          strategy: args.strategy ? Number(args.strategy) : undefined,
        });
        return JSON.stringify(result);
      }
      default:
        return executeTool(name, args);
    }
  } catch (error) {
    return JSON.stringify({ error: `Tool execution failed: ${String(error)}` });
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MiniMaxMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: MiniMaxToolCall[];
  name?: string;
}

export interface MiniMaxToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatStreamOptions {
  /** Messages to send (including system prompt) */
  messages: MiniMaxMessage[];
  /** Tools available for the AI to call (handled server-side by Edge Function) */
  tools?: unknown[];
  /** Called for each content chunk during streaming (typewriter effect) */
  onChunk: (text: string) => void;
  /** Called when the stream completes */
  onComplete: (finalText: string) => void;
  /** Called when a tool is being executed (Edge Function reports this via tools loop) */
  onToolExecuting?: (toolName: string, toolId: string) => void;
  /** Called when a tool returns a result */
  onToolResult?: (toolName: string, toolId: string, result: string) => void;
  /** Called on error */
  onError: (error: Error) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Forced conversation id (reuse an existing conversation) */
  conversationId?: string;
  /** Conversation language (passed for analytics) */
  language?: string;
  /** Model id override */
  model?: string;
}

export interface ChatUsage {
  request_count: number;
  max_requests: number;
  tier_slug: string;
}

// ---------------------------------------------------------------------------
// Clean model response — strip ANY XML-like tags (safety net)
// ---------------------------------------------------------------------------

export function cleanModelResponse(text: string): string {
  if (!text) return "";
  let cleaned = text;
  cleaned = cleaned.replace(/think[\s\S]*?<\/think>/g, "");
  cleaned = cleaned.replace(/think[\s\S]*$/, "");
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*?<\/minimax:tool_call>/g, "");
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*$/, "");
  cleaned = cleaned.replace(/<invoke\s+[^>]*\/>/g, "");
  cleaned = cleaned.replace(/<function\s+[\s\S]*?<\/function>/g, "");
  cleaned = cleaned.replace(/<function\s+[\s\S]*?\/>/g, "");
  cleaned = cleaned.replace(/<function\s+[\s\S]*$/, "");
  cleaned = cleaned.replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/g, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();
  return cleaned;
}

// ---------------------------------------------------------------------------
// Context window management
// ---------------------------------------------------------------------------

const MAX_CONTEXT_MESSAGES = 20;

export function trimMessages(messages: MiniMaxMessage[]): MiniMaxMessage[] {
  if (messages.length <= MAX_CONTEXT_MESSAGES + 1) return messages;
  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");
  const trimmed = nonSystemMessages.slice(-MAX_CONTEXT_MESSAGES);
  return [...systemMessages, ...trimmed];
}

// ---------------------------------------------------------------------------
// Typewriter chunker (used to fake streaming from a non-streaming response)
// ---------------------------------------------------------------------------

function chunkText(text: string, chunkSize = 8): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

async function typeWriterEffect(
  text: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  chunkSize = 8,
  delayMs = 12,
): Promise<void> {
  const chunks = chunkText(text, chunkSize);
  let acc = "";
  for (const c of chunks) {
    if (signal?.aborted) break;
    acc += c;
    onChunk(acc);
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// ---------------------------------------------------------------------------
// Retry logic with exponential backoff
// ---------------------------------------------------------------------------

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 3,
  signal?: AbortSignal,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await fetch(url, { ...init, signal });
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }
      lastError = new Error(`Server error: ${res.status}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError || new Error("Max retries exceeded");
}

// ---------------------------------------------------------------------------
// MiniMax Client — now a thin wrapper around the Supabase Edge Function
// ---------------------------------------------------------------------------

export class MiniMaxClient {
  private currentAbortController: AbortController | null = null;
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || this.resolveEdgeUrl();
  }

  private resolveEdgeUrl(): string {
    if (typeof window !== "undefined") {
      const w = window as unknown as { __SUPABASE_URL__?: string };
      const runtime = (w.__SUPABASE_URL__ || "").replace(/\/$/, "");
      if (runtime) return `${runtime}/functions/v1/chat`;
    }
    const envUrl = (import.meta.env?.PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    return `${envUrl}/functions/v1/chat`;
  }

  cancel(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  private async getAccessToken(): Promise<string> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      throw new Error("Authentication required: please sign in to use AI Chat.");
    }
    return data.session.access_token;
  }

  async chatStream(options: ChatStreamOptions): Promise<string> {
    const {
      messages,
      tools,
      onChunk,
      onComplete,
      onError,
      signal,
      conversationId,
      language,
      model,
    } = options;

    this.cancel();
    const controller = new AbortController();
    this.currentAbortController = controller;
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const onExternalAbort = () => controller.abort();
    signal?.addEventListener("abort", onExternalAbort);

    try {
      const accessToken = await this.getAccessToken();
      const anonKey = (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || "").trim();

      const trimmed = trimMessages(messages);
      const res = await fetchWithRetry(
        this.baseUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: anonKey,
          },
          body: JSON.stringify({
            messages: trimmed,
            tools: tools && (tools as unknown[]).length > 0 ? tools : undefined,
            conversationId,
            language,
            model: model || "MiniMax-Text-01",
          }),
        },
        3,
        controller.signal,
      );

      if (res.status === 401) {
        throw new Error("Authentication required: please sign in to use AI Chat.");
      }
      if (res.status === 429) {
        const errBody = await res.json().catch(() => ({}));
        const max = errBody?.max_requests ?? 5;
        const used = errBody?.request_count ?? max;
        throw new Error(
          `You have used all ${used} of your ${max} free AI requests this month. Upgrade to Explorer for 20 or Traveler for 40.`,
        );
      }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `AI service error: ${res.status}`);
      }

      const data = await res.json();
      const content = cleanModelResponse(data.content || "");

      // Report usage to listeners (the UI banner listens for these events)
      if (typeof window !== "undefined" && data.usage) {
        window.dispatchEvent(
          new CustomEvent("ai-usage-updated", {
            detail: {
              count: data.usage.request_count,
              max: data.usage.max_requests,
              tier: data.usage.tier_slug,
              conversationId: data.conversationId,
            },
          }),
        );
      }

      // Typewriter effect for the final response
      await typeWriterEffect(content, onChunk, controller.signal);
      onComplete(content);
      return content;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "";
      }
      const error = err instanceof Error ? err : new Error(String(err));
      onError(error);
      throw error;
    } finally {
      this.currentAbortController = null;
      signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  /**
   * Non-streaming chat. Used by code that just wants the final text.
   */
  async chatBlocking(messages: MiniMaxMessage[]): Promise<string> {
    const accessToken = await this.getAccessToken();
    const anonKey = (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || "").trim();
    const trimmed = trimMessages(messages);
    const res = await fetchWithRetry(
      this.baseUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          messages: trimmed,
          model: "MiniMax-Text-01",
        }),
      },
      3,
    );
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error || `AI service error: ${res.status}`);
    }
    const data = await res.json();
    return cleanModelResponse(data.content || "");
  }
}

// ---------------------------------------------------------------------------
// System prompt & context
// ---------------------------------------------------------------------------
// The full agent system prompt lives in src/lib/ai/prompts.ts (SYSTEM_PROMPT).
// TRAVEL_PLANNING_SYSTEM is kept as a backwards-compatible alias.

import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

export const TRAVEL_PLANNING_SYSTEM = SYSTEM_PROMPT;

export const CITY_CONTEXT = `
Available cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin, Hangzhou, Chongqing, Dali, Nanjing, Suzhou, Shenzhen, Xiamen, Qingdao, Kunming, Lijiang, Zhangjiajie, Sanya, Wuhan, Changsha, Tianjin, Harbin, Dalian, Ningbo, Chengde, Luoyang, Jinan, Yantai, Weihai, Fuzhou, Quanzhou, Hulunbuir, Xining, Lanzhou, Dunhuang.

Each city has curated data: top attractions, signature foods, transport options, weather, scams to avoid, and recommended day count. Use CitySearch to pull the exact city data.
`;

export function createMiniMaxClient(): MiniMaxClient {
  return new MiniMaxClient("");
}
