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

/**
 * Strip <think> blocks, <minimax:tool_call> blocks, and stray <invoke> tags
 * from model output so users only see clean responses.
 */
function cleanModelResponse(text: string): string {
  // Remove closed <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  // Remove unclosed <think> blocks (mid-stream: opening tag with no closing yet)
  cleaned = cleaned.replace(/<think>[\s\S]*$/, '');
  // Remove closed <minimax:tool_call>...</minimax:tool_call> blocks
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*?<\/minimax:tool_call>/g, '');
  // Remove unclosed <minimax:tool_call> blocks (mid-stream)
  cleaned = cleaned.replace(/<minimax:tool_call>[\s\S]*$/, '');
  // Remove any stray <invoke ... /> tags that may appear outside tool_call blocks
  cleaned = cleaned.replace(/<invoke\s+[^>]*\/>/g, '');
  // Clean up extra whitespace/newlines left behind
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
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
              onMessage(cleanModelResponse(fullResponse), false);
            }
            if (event.choices[0]?.finish_reason) {
              onMessage(cleanModelResponse(fullResponse), true);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      const cleaned = cleanModelResponse(fullResponse);
      onMessage(cleaned, true);
      return cleaned;
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
    return cleanModelResponse(data.choices[0]?.message?.content || "");
  }
}

// System prompt for travel planning
const TRAVEL_PLANNING_SYSTEM = `# Role Definition

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

## Available Tools

You have access to the following tools. Call them when needed to provide accurate, real-time information:

### Core Search Tools
- **CitySearch** - Search city database for destinations, attractions, restaurants, transport info
- **AttractionSearch** - Find attractions by city and category (historical, cultural, nature, etc.)
- **FoodSearch** - Search restaurants by city, cuisine type, and budget
- **HotelSearch** - Find hotels by city, budget level, star rating, and amenities
- **TransportSearch** - Search trains, flights between cities with schedules and prices
- **WeatherSearch** - Get weather forecasts for destinations

### Information Tools
- **VisaCheck** - Check visa requirements by nationality and purpose
- **PaymentGuide** - Get payment method info (WeChat Pay, Alipay, cash, cards)
- **SIMCard** - Mobile data plans and SIM card purchasing info
- **TranslationService** - Translate common phrases for travelers
- **EmergencySOS** - Emergency numbers and procedures
- **EmergencyContact** - City-specific emergency contacts, hospitals, embassies

### Advanced Tools
- **ExchangeRate** - Get currency exchange rates (USD, EUR, GBP, JPY, etc. to CNY)
- **VisaSearch** - Detailed visa requirements with processing times
- **RouteSearch** - Search train/flight/driving routes between cities
- **WebSearch** - Real-time web search for latest information
- **LocalExpert** - Local guide and tour recommendations

### When to use tools:
- User asks about a specific city → CitySearch + AttractionSearch + FoodSearch
- User asks about transport between cities → TransportSearch or RouteSearch
- User asks about currency/exchange rates → ExchangeRate
- User asks about visa requirements → VisaSearch or VisaCheck
- User asks about weather → WeatherSearch
- User asks about hotels → HotelSearch
- User asks about emergency info → EmergencySOS + EmergencyContact
- User asks about payment methods → PaymentGuide
- User asks about SIM/data plans → SIMCard
- User needs real-time info → WebSearch

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
  const apiKey = import.meta.env.PUBLIC_MINIMAX_API_KEY || "";
  const baseUrl = import.meta.env.PUBLIC_MINIMAX_BASE_URL || "https://api.minimax.chat/v1";
  return new MiniMaxClient(apiKey, baseUrl);
}

export { TRAVEL_PLANNING_SYSTEM, CITY_CONTEXT };
