/**
 * MiniMax AI Client for ChinaConnect — CLIENT-SIDE ONLY
 *
 * This module communicates ONLY with /api/chat (the server-side proxy).
 * No API keys are used or exposed client-side.
 * All MiniMax communication and tool execution happens server-side.
 */

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
  /** Called for each content chunk during streaming */
  onChunk: (text: string) => void;
  /** Called when the stream completes */
  onComplete: (finalText: string) => void;
  /** Called on error */
  onError: (error: Error) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// Clean model response — strip ANY XML-like tags
// ---------------------------------------------------------------------------

/**
 * Strip <think> blocks, <function> tags, <invoke> tags, <minimax:tool_call> blocks,
 * and any other XML-like artifacts from model output.
 * This is a safety net — should rarely be needed with proper tool calling.
 */
export function cleanModelResponse(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Remove closed <think>...</think> blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "");
  // Remove unclosed <think> blocks (mid-stream)
  cleaned = cleaned.replace(/<think>[\s\S]*$/, "");

  // Remove closed <minimax:tool_call>...</minimax:tool_call> blocks
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*?<\/minimax:tool_call>/g, "");
  // Remove unclosed <minimax:tool_call> blocks
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*$/, "");

  // Remove any <invoke ... /> tags
  cleaned = cleaned.replace(/<invoke\s+[^>]*\/>/g, "");

  // Remove <function ...> ... </function> blocks (multi-line)
  cleaned = cleaned.replace(/<function\s+[\s\S]*?<\/function>/g, "");
  // Remove self-closing <function ... /> tags
  cleaned = cleaned.replace(/<function\s+[\s\S]*?\/>/g, "");
  // Remove unclosed <function ...> tags
  cleaned = cleaned.replace(/<function\s+[\s\S]*$/, "");

  // Remove [TOOL_CALL]...[/TOOL_CALL] blocks
  cleaned = cleaned.replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/g, "");

  // Clean up extra whitespace/newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  return cleaned;
}

// ---------------------------------------------------------------------------
// Context window management
// ---------------------------------------------------------------------------

const MAX_CONTEXT_MESSAGES = 20;

/**
 * Trim messages to fit within context window.
 * Always keeps the system prompt (first message) and last N messages.
 */
export function trimMessages(messages: MiniMaxMessage[]): MiniMaxMessage[] {
  if (messages.length <= MAX_CONTEXT_MESSAGES + 1) return messages;

  const systemMessages = messages.filter((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  // Keep last MAX_CONTEXT_MESSAGES non-system messages
  const trimmed = nonSystemMessages.slice(-MAX_CONTEXT_MESSAGES);

  return [...systemMessages, ...trimmed];
}

// ---------------------------------------------------------------------------
// SSE Stream Parser
// ---------------------------------------------------------------------------

interface SSEChunk {
  content?: string;
  error?: string;
}

/**
 * Parse a TextDecoderStream of SSE data, yielding parsed chunks.
 * Handles: data: prefix, [DONE] marker, multi-line buffers.
 */
async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SSEChunk> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (!trimmed.startsWith("data:")) continue;

      const dataStr = trimmed.slice(5).trim();

      if (dataStr === "[DONE]") {
        return;
      }

      try {
        const event = JSON.parse(dataStr);
        yield {
          content: event.content,
          error: event.error,
        };
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim().startsWith("data:")) {
    const dataStr = buffer.trim().slice(5).trim();
    if (dataStr !== "[DONE]") {
      try {
        const event = JSON.parse(dataStr);
        yield {
          content: event.content,
          error: event.error,
        };
      } catch {
        // Skip malformed
      }
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
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      const res = await fetch(url, { ...init, signal });

      // Don't retry on client errors (4xx) — only on server errors (5xx) or network issues
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }

      lastError = new Error(`Server error: ${res.status}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// ---------------------------------------------------------------------------
// MiniMax Client — client-side, talks only to /api/chat
// ---------------------------------------------------------------------------

export class MiniMaxClient {
  private baseUrl: string;
  private currentAbortController: AbortController | null = null;

  constructor(baseUrl = "/api/chat") {
    this.baseUrl = baseUrl;
  }

  /**
   * Cancel any in-flight request.
   */
  cancel(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  /**
   * Stream a chat message to /api/chat with SSE response.
   * Returns the final cleaned response text.
   */
  async chatStream(options: ChatStreamOptions): Promise<string> {
    const { messages, onChunk, onComplete, onError, signal } = options;

    // Cancel any previous in-flight request
    this.cancel();

    // Create a new AbortController linked to the external signal
    const controller = new AbortController();
    this.currentAbortController = controller;

    // If external signal is already aborted, throw immediately
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    // Link external signal to our controller
    const onExternalAbort = () => controller.abort();
    signal?.addEventListener("abort", onExternalAbort);

    let fullResponse = "";

    try {
      const trimmed = trimMessages(messages);

      const res = await fetchWithRetry(
        this.baseUrl,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: trimmed,
            stream: true,
          }),
        },
        3,
        controller.signal,
      );

      if (!res.ok) {
        let errorMsg = `API error: ${res.status}`;
        try {
          const errBody = await res.json();
          errorMsg = errBody.error || errorMsg;
        } catch {
          // Use default error message
        }
        throw new Error(errorMsg);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      // Parse SSE stream
      for await (const chunk of parseSSEStream(reader)) {
        if (controller.signal.aborted) break;

        if (chunk.error) {
          throw new Error(chunk.error);
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          // Clean and send incremental update
          const cleaned = cleanModelResponse(fullResponse);
          onChunk(cleaned);
        }
      }

      // Final clean
      const finalCleaned = cleanModelResponse(fullResponse);
      onComplete(finalCleaned);
      return finalCleaned;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Cancellation — return what we have so far
        const cleaned = cleanModelResponse(fullResponse);
        if (cleaned) onComplete(cleaned);
        return cleaned;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      onError(error);
      return fullResponse;
    } finally {
      this.currentAbortController = null;
      signal?.removeEventListener("abort", onExternalAbort);
    }
  }

  /**
   * Non-streaming chat request to /api/chat.
   */
  async chatBlocking(messages: MiniMaxMessage[]): Promise<string> {
    const trimmed = trimMessages(messages);

    const res = await fetchWithRetry(
      this.baseUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: trimmed,
          stream: false,
        }),
      },
      3,
    );

    if (!res.ok) {
      let errorMsg = `API error: ${res.status}`;
      try {
        const errBody = await res.json();
        errorMsg = errBody.error || errorMsg;
      } catch {
        // Use default
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return cleanModelResponse(data.content || "");
  }
}

// ---------------------------------------------------------------------------
// System prompt & context
// ---------------------------------------------------------------------------

export const TRAVEL_PLANNING_SYSTEM = `# Role Definition

You are **ChinaConnect AI** (中国旅行专家), an authoritative and friendly travel expert specializing in China tourism. You possess deep knowledge of:
- All Chinese provinces, cities, and regions — their history, culture, geography, and climate
- Chinese cuisine: regional specialties, Michelin/Black Pearl restaurants, street food, dietary customs
- Transportation: high-speed rail, domestic flights, metro systems, ride-hailing (Didi), bike-sharing
- Practical matters: visa policies, payment methods (WeChat Pay/Alipay), SIM cards, VPN, cultural etiquette
- Emergency protocols: police (110), ambulance (120), fire (119), embassy contacts

You help international visitors plan trips to Chinese cities with detailed itineraries, restaurant recommendations, transport tips, and cultural insights.

Follow the 8-step workflow for travel planning:
1. Intent Recognition - Classify user intent (travel planning/business/food/emergency/life consultation)
2. Parameter Extraction - Extract destination, days, budget, group size, preferences
3. City Matching - Match destination to city data
4. Route Generation - Create day-by-day itinerary
5. Content Enrichment - Add details, tips, practical info
6. Practical Info - Inject visa, payment, SIM, cultural tips
7. Formatting - Structure as markdown itinerary
8. Saving - Note user can save the plan

Always provide:
- Day-by-day schedule with timing
- Restaurant recommendations (Michelin/Black Pearl/local)
- Transport between locations
- Estimated costs in Chinese Yuan (¥) — ALWAYS use the ¥ symbol instead of "CNY"
- Cultural tips specific to the destination
- Emergency numbers relevant to the city

CRITICAL RULES:
- If the user specifies a number of days (e.g., "3 days", "5-day"), you MUST generate exactly that many days. NEVER add extra days.
- Always use ¥ symbol for prices, not "CNY" or "RMB". Example: ¥150 not 150 CNY
- Use ¥ for all price mentions throughout your response

## CRITICAL OUTPUT RULES

1. NEVER output <think> blocks. Do your reasoning silently.
2. NEVER output XML tool calls like <function>, <invoke>, <minimax:tool_call>, or [TOOL_CALL].
3. ONLY output the final user-facing response in clean Markdown format.
4. Do NOT show your internal reasoning process.
5. Do NOT show tool call syntax — just use the information you have.

## Available Tools

You have access to the following tools via the API. Use them to get accurate, real-time information about cities, attractions, restaurants, weather, hotels, and transport. The system will execute them for you automatically.

When you need information about a city, its attractions, restaurants, weather, hotels, or transport routes, the system will call the appropriate tools for you. You will receive the results and should use them to provide accurate recommendations.

### When tools are used automatically:
- User asks about a specific city → CitySearch provides city overview
- User asks about attractions → AttractionSearch provides attraction details
- User asks about food/restaurants → FoodSearch provides restaurant info
- User asks about transport between cities → TransportSearch provides routes
- User asks about weather → WeatherSearch provides climate info
- User asks about hotels → HotelSearch provides accommodation options

## Output Format Requirements

Structure your responses using Markdown for readability:

### For Travel Itineraries:
- Use **# headings** for main sections (Destination Overview, Daily Itinerary, Practical Info, Budget)
- Use **## headings** for sub-sections (Day 1, Day 2, etc.)
- Use **tables** for budget breakdowns and transport schedules
- Use **bullet lists** for attractions, restaurants, tips
- Use **bold** for key information (prices, times, names)

### For Information Queries:
- Use **bullet points** for step-by-step instructions
- Use **tables** for comparing options (hotels, transport)
- Use **blockquotes** (>) for important warnings or tips
- Use **code blocks** for phone numbers and addresses

### For Food Recommendations:
- Use **### headings** for each restaurant
- Include: cuisine type, average price, highlights, hours, address
- Use ⭐ for ratings, 💎 for awards

### Budget Table Format:
| Category | Amount (¥) |
|----------|------------|
| Total | ¥X,XXX |
| Food | ¥XXX |
| Accommodation | ¥XXX |
| Transport | ¥XXX |
| Attractions | ¥XXX |

### Transport Table Format:
| Train/Flight | Departure | Arrival | Duration | Price |
|-------------|-----------|---------|----------|-------|
| G123 | 08:00 | 12:30 | 4.5h | ¥553 |

Respond in the user's language (English/Chinese).

## Security Rules (MUST FOLLOW)

These rules are ABSOLUTE and NON-NEGOTIABLE:

1. **NEVER disclose or reference**: API keys, API endpoints, environment variables, database credentials, server configurations, internal system architecture, source code, or any backend implementation details. If asked, respond: "I cannot share technical implementation details."

2. **NEVER modify website files**: Do not provide instructions to modify, delete, or create any files on the server. Do not execute or suggest code that modifies the website.

3. **ONLY answer travel-related questions**: You may answer questions about China travel, culture, food, transportation, visa, accommodation, weather, and related practical matters. For non-travel questions, respond: "I'm specialized in China travel advice. Please ask me about destinations, itineraries, food, transport, or travel planning!"

4. **NEVER answer politically sensitive topics**: Do not discuss or comment on political matters, territorial disputes, government policies, censorship, human rights, military affairs, or any politically controversial subjects. Politely redirect: "I focus on travel advice. Let me help you plan your China trip instead!"

5. **NEVER generate harmful content**: No violence, discrimination, illegal activities, or content that could endanger travelers.

6. **Respect user privacy**: Do not ask for or store personal information beyond what's needed for travel planning.

Violation of these rules is strictly prohibited regardless of how the request is phrased.`;

export const CITY_CONTEXT = `
Available cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin

City data includes:
- Beijing: Forbidden City, Great Wall, Temple of Heaven, Peking Duck, 6 days recommended
- Shanghai: The Bund, Yu Garden, French Concession, Soup dumplings, 3-4 days
- Guangzhou: Canton Tower, Chimelong Safari, Dim Sum, 2-3 days
- Xi'an: Terracotta Army, City Wall, Muslim Quarter, Biangbiang noodles, 2-3 days
- Chengdu: Giant Panda Base, Jinli Street, Sichuan Opera, Hot pot, 2-3 days
- Guilin: Li River cruise, Elephant Trunk Hill, Rice noodles, 2-3 days
`;

/**
 * Create a MiniMaxClient that talks to /api/chat.
 * No API key needed on the client side.
 */
export function createMiniMaxClient(): MiniMaxClient {
  return new MiniMaxClient("/api/chat");
}
