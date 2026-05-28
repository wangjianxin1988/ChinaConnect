/**
 * MiniMax AI Client for ChinaConnect
 * OpenAI-compatible API integration for travel planning
 */

export interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiniMaxChatRequest {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface MiniMaxStreamResponse {
  id: string;
  choices: Array<{
    delta: { content?: string };
    finish_reason?: string;
  }>;
}

export class MiniMaxClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(
    apiKey: string,
    baseUrl = "https://api.minimax.chat/v1",
    model = "MiniMax-M2.7-highspeed",
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async chatStream(
    messages: MiniMaxMessage[],
    onMessage: (text: string, isComplete: boolean) => void,
    onError?: (error: Error) => void,
  ): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    let fullResponse = "";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MiniMax API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || !line.startsWith("data:")) continue;

          const dataStr = line.slice(5);
          if (dataStr === "[DONE]") {
            onMessage(fullResponse, true);
            return fullResponse;
          }

          try {
            const event: MiniMaxStreamResponse = JSON.parse(dataStr);
            const content = event.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onMessage(fullResponse, false);
            }
            if (event.choices[0]?.finish_reason) {
              onMessage(fullResponse, true);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      onMessage(fullResponse, true);
      return fullResponse;
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error"));
      }
      return fullResponse;
    }
  }

  async chatBlocking(messages: MiniMaxMessage[]): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MiniMax API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
}

// System prompt for travel planning
const TRAVEL_PLANNING_SYSTEM = `You are ChinaConnect AI, an expert travel assistant for visitors to China. You help users plan trips to Chinese cities with detailed itineraries, restaurant recommendations, transport tips, and cultural insights.

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

Respond in the user's language (English/Chinese).`;

// City data for grounding
const CITY_CONTEXT = `
Available cities: Beijing, Shanghai, Guangzhou, Xi'an, Chengdu, Guilin

City data includes:
- Beijing: Forbidden City, Great Wall, Temple of Heaven, Peking Duck, 6 days recommended
- Shanghai: The Bund, Yu Garden, French Concession, Soup dumplings, 3-4 days
- Guangzhou: Canton Tower, Chimelong Safari, Dim Sum, 2-3 days
- Xi'an: Terracotta Army, City Wall, Muslim Quarter, Biangbiang noodles, 2-3 days
- Chengdu: Giant Panda Base, Jinli Street, Sichuan Opera, Hot pot, 2-3 days
- Guilin: Li River cruise, Elephant Trunk Hill, Rice noodles, 2-3 days
`;

export function createMiniMaxClient(): MiniMaxClient {
  const apiKey = import.meta.env.MINIMAX_API_KEY || "";
  const baseUrl = import.meta.env.MINIMAX_BASE_URL || "https://api.minimax.chat/v1";
  return new MiniMaxClient(apiKey, baseUrl);
}

export { TRAVEL_PLANNING_SYSTEM, CITY_CONTEXT };
