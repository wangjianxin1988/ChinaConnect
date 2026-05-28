/**
 * ReAct Engine for ChinaConnect AI
 * Implements Think → Action → Observe → Reflect loop
 */

import { cities } from "@/data/cities";
import type { City } from "@/data/cities/beijing";
import type {
  ExtractedParams,
  IntentResult,
  ReActState,
  ToolCall,
  ToolName,
  WorkflowProgress,
} from "./types";

const WORKFLOW_STEPS = [
  {
    key: "intent_recognition",
    name: "Intent Recognition",
    description: "Understanding user intent",
  },
  {
    key: "parameter_extraction",
    name: "Parameter Extraction",
    description: "Extracting trip parameters",
  },
  { key: "city_matching", name: "City Matching", description: "Matching destinations to data" },
  { key: "route_generation", name: "Route Generation", description: "Creating day-by-day plan" },
  { key: "content_enrichment", name: "Content Enrichment", description: "Adding details and tips" },
  { key: "practical_info", name: "Practical Info", description: "Adding visa/payment/SIM info" },
  { key: "formatting", name: "Formatting", description: "Structuring final output" },
  { key: "saving", name: "Saving", description: "Saving to memory" },
] as const;

type ReActPhase = "think" | "act" | "observe" | "reflect" | "answer";

interface ReActStep {
  phase: ReActPhase;
  thought: string;
  action?: string;
  actionInput?: Record<string, unknown>;
  observation?: string;
  toolResult?: unknown;
}

// ============================================
// Intent Recognition
// ============================================

function recognizeIntent(userMessage: string, _language: string): IntentResult {
  const msg = userMessage.toLowerCase();
  const msgZh = userMessage;
  const _isZh = /[一-龥]/.test(msgZh);

  // Emergency keywords
  const emergencyKeywords = [
    "emergency",
    "lost",
    "stolen",
    "hospital",
    "police",
    "ambulance",
    "passport lost",
    "护照丢失",
    " emergency",
    "急救",
    "警察",
    "医院",
    "help",
    "danger",
    "scam",
    "robbed",
    "assault",
    "accident",
  ];

  if (emergencyKeywords.some((k) => msg.includes(k))) {
    return {
      intent: "emergency_help",
      confidence: 0.95,
      secondaryIntents: ["life_consultation"],
      reasoning: "Emergency keywords detected, prioritizing urgent assistance",
      suggestedParams: { location: extractLocation(msgZh) },
    };
  }

  // Business keywords
  const businessKeywords = [
    "business",
    "meeting",
    "conference",
    "visa (business|m)",
    "exhibition",
    "trade",
    "fair",
    "contract",
    "商务",
    "会议",
    "会展",
    "出差",
  ];

  if (businessKeywords.some((k) => msg.includes(k))) {
    return {
      intent: "business_arrangement",
      confidence: 0.92,
      secondaryIntents: ["travel_planning"],
      reasoning: "Business context detected from keywords",
      suggestedParams: {
        destination: extractDestination(msgZh),
        timeIndicator: extractTimeIndicator(msgZh),
      },
    };
  }

  // Food keywords
  const foodKeywords = [
    "food",
    "restaurant",
    "eat",
    "meal",
    "dinner",
    "lunch",
    "breakfast",
    "dish",
    "cuisine",
    "recommend.*food",
    "best.*restaurant",
    "where.*eat",
    "michelin",
    "dim sum",
    "peking duck",
    "noodles",
    "dumpling",
    "美食",
    "餐厅",
    "好吃",
    "推荐.*吃",
    "哪里.*美食",
    "小吃",
  ];

  if (foodKeywords.some((k) => msg.includes(k))) {
    return {
      intent: "food_recommendation",
      confidence: 0.9,
      secondaryIntents: ["travel_planning"],
      reasoning: "Food-related keywords detected",
      suggestedParams: { destination: extractDestination(msgZh) || "China" },
    };
  }

  // Life consultation (how to use, where to buy, translation, transport)
  const lifeKeywords = [
    "how to",
    "how do",
    "where to buy",
    "where can i",
    "use.*wechat",
    "use.*alipay",
    "sim card",
    "data.*plan",
    "translate",
    "metro",
    "subway",
    "train ticket",
    "buy",
    "get.*around",
    "can i use",
    "payment",
    "cash",
    "exchange",
    "如何",
    "怎么",
    "购买",
    "哪里",
    "使用",
    "兑换",
    "买",
    "地铁",
    "火车",
  ];

  if (lifeKeywords.some((k) => msg.includes(k))) {
    return {
      intent: "life_consultation",
      confidence: 0.88,
      secondaryIntents: [],
      reasoning: "Life consultation keywords detected",
      suggestedParams: { destination: extractDestination(msgZh) },
    };
  }

  // Travel planning (default)
  const travelKeywords = [
    "visit",
    "trip",
    "travel",
    "tour",
    "go to",
    "plan",
    "itinerary",
    "days",
    "spend.*days",
    "stay.*days",
    "explore",
    "see.*in",
    "旅游",
    "旅行",
    "行程",
    "几天",
    "天",
    "玩",
    "观光",
    "景点",
  ];

  const hasTravelKeywords = travelKeywords.some((k) => msg.includes(k));

  return {
    intent: "travel_planning",
    confidence: hasTravelKeywords ? 0.92 : 0.7,
    secondaryIntents: hasTravelKeywords ? ["food_recommendation"] : ["casual_chat"],
    reasoning: hasTravelKeywords
      ? "Travel planning intent recognized from keywords"
      : "Defaulting to travel planning; low confidence due to vague input",
    suggestedParams: {
      destination: extractDestination(msgZh),
      timeIndicator: extractTimeIndicator(msgZh),
    },
  };
}

// ============================================
// Parameter Extraction
// ============================================

function extractDestination(text: string): string | undefined {
  // Chinese cities
  const zhCities = [
    "北京",
    "上海",
    "广州",
    "深圳",
    "西安",
    "成都",
    "桂林",
    "杭州",
    "苏州",
    "南京",
    "武汉",
    "重庆",
    "青岛",
    "厦门",
    "天津",
    "大连",
    "昆明",
    "长沙",
  ];
  for (const city of zhCities) {
    if (text.includes(city)) return city;
  }

  // English cities
  const enCities = [
    "beijing",
    "shanghai",
    "guangzhou",
    "shenzhen",
    "xi'an",
    "xian",
    "chengdu",
    "guilin",
    "hangzhou",
    "suzhou",
    "nanjing",
    "wuhan",
    "chongqing",
    "qingdao",
    "xiamen",
    "tianjin",
    "dalian",
    "kunming",
    "changsha",
  ];
  const lowerText = text.toLowerCase();
  for (const city of enCities) {
    if (lowerText.includes(city))
      return city === "xian" ? "xi'an" : city.charAt(0).toUpperCase() + city.slice(1);
  }

  return undefined;
}

function extractTimeIndicator(text: string): string | undefined {
  // Chinese patterns
  const zhPatterns = [/(\d+)\s*天[的]?/, /(\d+)\s*晚/, /(\d+)\s*夜/, /一周/, /半个月/];
  for (const pattern of zhPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  // English patterns
  const enPatterns = [
    /(\d+)\s*(day|days)/i,
    /(\d+)\s*(night|nights)/i,
    /(\d+)\s*(week|weeks)/i,
    /a\s*week/i,
    /half\s*a\s*month/i,
  ];
  for (const pattern of enPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return undefined;
}

function extractLocation(text: string): string | undefined {
  // Extract location mentions for emergency context
  const zhLocations = [
    "北京",
    "上海",
    "广州",
    "深圳",
    "西安",
    "成都",
    "桂林",
    "杭州",
    "苏州",
    "南京",
    "武汉",
    "重庆",
    "青岛",
    "厦门",
    "天津",
    "大连",
    "昆明",
    "长沙",
    "北京",
    "上海",
  ];
  for (const loc of zhLocations) {
    if (text.includes(loc)) return loc;
  }

  const enLocations = [
    "beijing",
    "shanghai",
    "guangzhou",
    "shenzhen",
    "xi'an",
    "xian",
    "chengdu",
    "guilin",
    "hangzhou",
    "suzhou",
    "nanjing",
    "wuhan",
    "chongqing",
    "qingdao",
    "xiamen",
    "tianjin",
    "dalian",
    "kunming",
    "changsha",
  ];
  const lowerText = text.toLowerCase();
  for (const loc of enLocations) {
    if (lowerText.includes(loc)) return loc;
  }

  return undefined;
}

function extractDays(text: string): number | undefined {
  // Chinese patterns
  const zhMatch = text.match(/(\d+)\s*天[的]?/);
  if (zhMatch) return Number.parseInt(zhMatch[1]);

  // English patterns
  const enMatch = text.match(/(\d+)\s*(day|days)/i);
  if (enMatch) return Number.parseInt(enMatch[1]);

  // X days
  const xDaysMatch = text.match(/(?:for|stay|visit|spend)\s*(\d+)\s*(?:day|days)/i);
  if (xDaysMatch) return Number.parseInt(xDaysMatch[1]);

  return undefined;
}

function extractBudget(text: string): "budget" | "medium" | "luxury" {
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("luxury") ||
    lowerText.includes("high-end") ||
    lowerText.includes("5-star") ||
    lowerText.includes("premium") ||
    lowerText.includes("豪华")
  ) {
    return "luxury";
  }
  if (
    lowerText.includes("budget") ||
    lowerText.includes("cheap") ||
    lowerText.includes("affordable") ||
    lowerText.includes("backpacker") ||
    lowerText.includes("经济")
  ) {
    return "budget";
  }
  return "medium";
}

function extractGroupSize(text: string): number {
  const match = text.match(/(\d+)\s*(?:people|person|travelers|traveler|adult|adults|人|游客|团)/i);
  if (match) return Number.parseInt(match[1]);
  if (text.includes("couple") || text.includes("两人") || text.includes("俩")) return 2;
  if (text.includes("family") || text.includes("family with") || text.includes("家人")) return 3;
  if (
    text.includes("solo") ||
    text.includes("alone") ||
    text.includes("一个人") ||
    text.includes("独自")
  )
    return 1;
  return 2; // default
}

function extractTravelStyles(text: string): string[] {
  const styles: string[] = [];
  const lowerText = text.toLowerCase();

  const styleMap: Record<string, string> = {
    history: "historical",
    historical: "historical",
    culture: "cultural",
    cultural: "cultural",
    food: "food",
    foodie: "food",
    nature: "nature",
    adventure: "adventure",
    photography: "photography",
    shopping: "shopping",
    nightlife: "nightlife",
    art: "art",
    museum: "museum",
    imperial: "historical",
    modern: "modern",
  };

  for (const [keyword, style] of Object.entries(styleMap)) {
    if (lowerText.includes(keyword) || text.includes(keyword)) {
      if (!styles.includes(style)) styles.push(style);
    }
  }

  if (styles.length === 0) styles.push("general");
  return styles;
}

function extractParams(userMessage: string): ExtractedParams {
  return {
    destination: extractDestination(userMessage) || "",
    days: extractDays(userMessage),
    budgetLevel: extractBudget(userMessage),
    groupSize: extractGroupSize(userMessage),
    travelStyles: extractTravelStyles(userMessage),
    language: "en",
    transportPreference: "any",
  };
}

// ============================================
// City Matching
// ============================================

function matchCity(destination: string): City | null {
  if (!destination) return null;

  const lowerDest = destination.toLowerCase();

  // Direct slug match
  const slugMap: Record<string, string> = {
    beijing: "beijing",
    北京: "beijing",
    shanghai: "shanghai",
    上海: "shanghai",
    guangzhou: "guangzhou",
    广州: "guangzhou",
    xian: "xian",
    "xi'an": "xian",
    西安: "xian",
    chengdu: "chengdu",
    成都: "chengdu",
    guilin: "guilin",
    桂林: "guilin",
  };

  const slug = slugMap[lowerDest] || slugMap[destination];
  if (slug) {
    return cities.find((c) => c.slug === slug) || null;
  }

  // Fuzzy match
  const allCities = [...cities.map((c) => ({ slug: c.slug, name: c.name, nameEn: c.nameEn }))];

  for (const city of allCities) {
    const cityNames = [
      city.slug.toLowerCase(),
      city.name.toLowerCase(),
      city.nameEn?.toLowerCase() || "",
    ];
    if (cityNames.some((n) => n.includes(lowerDest) || lowerDest.includes(n))) {
      return cities.find((c) => c.slug === city.slug) || null;
    }
  }

  return null;
}

// ============================================
// Tool Selectors
// ============================================

function selectTools(intent: IntentResult, params: ExtractedParams): ToolName[] {
  const tools: ToolName[] = [];

  switch (intent.intent) {
    case "travel_planning":
      tools.push("CitySearch");
      if (params.destination) {
        tools.push("WeatherSearch");
        tools.push("HotelSearch");
        tools.push("TransportSearch");
        tools.push("AttractionSearch");
        tools.push("FoodSearch");
      }
      break;

    case "food_recommendation":
      tools.push("CitySearch");
      tools.push("FoodSearch");
      tools.push("TranslationService");
      break;

    case "life_consultation":
      tools.push("PaymentGuide");
      tools.push("SIMCard");
      if (params.destination) {
        tools.push("TransportSearch");
        tools.push("LocalExpert");
      }
      break;

    case "emergency_help":
      tools.push("EmergencySOS");
      tools.push("EmergencyContact");
      tools.push("TranslationService");
      break;

    case "business_arrangement":
      tools.push("CitySearch");
      tools.push("VisaCheck");
      tools.push("TransportSearch");
      break;
    default:
      tools.push("WebSearch");
      tools.push("LocalExpert");
      break;
  }

  return tools;
}

// ============================================
// ReAct Loop
// ============================================

export class ReActEngine {
  private messages: string[] = [];
  private toolResults: Map<string, unknown> = new Map();
  private maxIterations = 10;

  constructor() {
    this.reset();
  }

  reset() {
    this.messages = [];
    this.toolResults.clear();
  }

  /**
   * Execute the full ReAct loop for a user message
   */
  async execute(
    userMessage: string,
    language = "en",
    progressCallback?: (progress: WorkflowProgress) => void,
  ): Promise<{
    response: string;
    state: ReActState;
    workflowProgress: WorkflowProgress[];
    toolCalls: ToolCall[];
  }> {
    this.reset();

    // Step 1: Intent Recognition
    progressCallback?.(this.makeProgress(1, {}));
    const intentResult = recognizeIntent(userMessage, language);

    // Step 2: Parameter Extraction
    progressCallback?.(this.makeProgress(2, { intent: intentResult }));
    const params = extractParams(userMessage);

    // Step 3: City Matching
    progressCallback?.(this.makeProgress(3, { params }));
    const matchedCity = matchCity(params.destination);

    // Step 4-7: Generate response using ReAct
    progressCallback?.(this.makeProgress(4, { city: matchedCity?.name || params.destination }));

    const tools = selectTools(intentResult, params);
    const toolCalls: ToolCall[] = [];
    const reactSteps = await this.runReactLoop(intentResult, params, matchedCity, tools, toolCalls);

    // Step 7: Format response
    progressCallback?.(this.makeProgress(7, { steps: reactSteps.length }));
    const response = this.formatResponse(intentResult, params, matchedCity, reactSteps, language);

    // Step 8: Saving (noted but handled by storage layer)
    progressCallback?.(this.makeProgress(8, { responseLength: response.length }));

    const finalState: ReActState = {
      step: reactSteps.length,
      thought: reactSteps[reactSteps.length - 1]?.thought || "",
      action: "generate_itinerary",
      actionInput: { intentResult, params, city: matchedCity },
      observation: response.slice(0, 200),
      finalAnswer: response,
    };

    return {
      response,
      state: finalState,
      workflowProgress: this.getAllProgress(),
      toolCalls,
    };
  }

  private progressHistory: WorkflowProgress[] = [];

  private makeProgress(step: number, context: Record<string, unknown>): WorkflowProgress {
    const progress = WORKFLOW_STEPS[step - 1];
    const p: WorkflowProgress = {
      step,
      stepName: progress.name,
      stepKey: progress.key,
      progress: Math.round((step / 8) * 100),
      data: context,
    };
    this.progressHistory.push(p);
    return p;
  }

  private getAllProgress(): WorkflowProgress[] {
    return [...this.progressHistory];
  }

  /**
   * Run the ReAct thought loop
   */
  private async runReactLoop(
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    selectedTools: ToolName[],
    toolCallsOut: ToolCall[],
  ): Promise<ReActStep[]> {
    const steps: ReActStep[] = [];

    for (let i = 0; i < this.maxIterations; i++) {
      const stepNum = i + 1;

      // THINK: Analyze the current state
      const thought = this.think(stepNum, intent, params, city, steps);

      // If we have enough information, generate answer
      if (this.shouldGenerateAnswer(intent, params, city, steps)) {
        steps.push({ phase: "think", thought, action: undefined });
        break;
      }

      // ACT: Select and execute tool
      const actionResult = await this.act(
        stepNum,
        thought,
        intent,
        params,
        city,
        selectedTools,
        toolCallsOut,
      );
      steps.push(actionResult.step);

      // OBSERVE: Record result
      if (actionResult.toolResult) {
        this.toolResults.set(actionResult.step.action || "", actionResult.toolResult);
        steps[steps.length - 1].observation = this.summarizeObservation(actionResult.toolResult);
      }

      // REFLECT: Check if we should continue
      if (this.shouldTerminate(steps)) break;
    }

    return steps;
  }

  private think(
    stepNum: number,
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    steps: ReActStep[],
  ): string {
    const context: string[] = [];

    context.push(`[Step ${stepNum}] Intent: ${intent.intent} (confidence: ${intent.confidence})`);
    context.push(
      `Parameters: destination=${params.destination || "unspecified"}, days=${params.days || "unspecified"}, budget=${params.budgetLevel}`,
    );

    if (city) {
      context.push(`Matched city: ${city.nameEn} (${city.name})`);
      context.push(`Available attractions: ${city.attractions?.length || 0}`);
      context.push(`Available restaurants: ${city.restaurants?.length || 0}`);
    } else if (params.destination) {
      context.push(
        `City "${params.destination}" not found in database - will use general knowledge`,
      );
    } else {
      context.push("No destination specified - will ask user for clarification");
    }

    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      context.push(`Last observation: ${lastStep.observation || "none"}`);
    }

    return context.join("; ");
  }

  private shouldGenerateAnswer(
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    steps: ReActStep[],
  ): boolean {
    // For simple queries, generate answer immediately
    if (intent.intent === "emergency_help" && steps.length >= 1) return true;
    if (intent.intent === "casual_chat" && steps.length >= 1) return true;
    if (intent.intent === "food_recommendation" && steps.length >= 2) return true;

    // For travel planning, we need city data
    if (intent.intent === "travel_planning") {
      if (city && steps.length >= 1) return true;
      if (!params.destination && steps.length >= 1) return true; // Will ask user
      if (steps.length >= 3) return true; // Safety limit
    }

    return false;
  }

  private async act(
    stepNum: number,
    thought: string,
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    selectedTools: ToolName[],
    toolCallsOut: ToolCall[],
  ): Promise<{ step: ReActStep; toolResult: unknown }> {
    // Select the next tool based on thought
    const tool = selectedTools[Math.min(stepNum - 1, selectedTools.length - 1)] || "CitySearch";

    const toolCall: ToolCall = {
      name: tool,
      parameters: this.buildToolParams(tool, intent, params, city),
      timestamp: Date.now(),
    };

    toolCallsOut.push(toolCall);

    let result: unknown = null;

    switch (tool) {
      case "CitySearch":
        result = city ? this.getCityData(city) : { error: "No city matched" };
        break;

      case "AttractionSearch":
        result = city ? this.getCityData(city) : { error: "No city matched" };
        break;

      case "FoodSearch":
        result = city ? this.getCityData(city) : { error: "No city matched" };
        break;

      case "WeatherSearch":
        result = this.getWeatherData(params.destination);
        break;

      case "HotelSearch":
        result = this.getHotelRecommendations(city, params.budgetLevel);
        break;

      case "TransportSearch":
        result = this.getTransportInfo(params.destination);
        break;

      case "TranslationService":
        result = { status: "available", note: "Translation service ready" };
        break;

      case "EmergencyContact":
        result = { status: "available", note: "Emergency contacts ready" };
        break;

      case "EmergencySOS":
        result = { status: "available", note: "Emergency SOS ready" };
        break;

      case "PaymentGuide":
        result = { status: "available", note: "Payment guide ready" };
        break;

      case "VisaCheck":
        result = { status: "available", note: "Visa check ready" };
        break;

      case "SIMCard":
        result = { status: "available", note: "SIM card info ready" };
        break;

      case "WebSearch":
        result = { status: "search_available", note: "Real-time search ready" };
        break;

      case "LocalExpert":
        result = { status: "available", note: "Local expert ready" };
        break;

      case "city_database":
        result = city ? this.getCityData(city) : { error: "No city matched" };
        break;

      case "map_service":
        result = city ? this.getMapData(city) : { error: "No city for map" };
        break;

      default:
        result = { status: "unknown_tool" };
    }

    toolCall.result = result;
    if (result && typeof result === "object" && "error" in result) {
      toolCall.error = String((result as { error: string }).error);
    }

    return {
      step: {
        phase: "act" as ReActPhase,
        thought,
        action: tool,
        actionInput: toolCall.parameters,
        toolResult: result,
      },
      toolResult: result,
    };
  }

  private buildToolParams(
    tool: ToolName,
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
  ): Record<string, unknown> {
    switch (tool) {
      case "CitySearch":
      case "AttractionSearch":
      case "FoodSearch":
        return {
          city: params.destination || city?.nameEn || "Beijing",
          language: params.language,
        };

      case "WeatherSearch":
        return { city: params.destination || city?.nameEn || "Beijing", days: params.days || 5 };

      case "HotelSearch":
        return {
          city: params.destination || city?.nameEn || "Beijing",
          budget_level: params.budgetLevel,
          user_rating_min: 4.0,
        };

      case "TransportSearch":
        return {
          destination: params.destination || city?.nameEn || "Beijing",
          transport_type: params.transportPreference || "any",
        };

      case "TranslationService":
        return { target_lang: params.language, note: "Translation API available" };

      case "EmergencyContact":
        return { city: params.destination, language: params.language };

      case "EmergencySOS":
        return { city: params.destination, language: params.language };

      case "PaymentGuide":
        return { city: params.destination, language: params.language };

      case "VisaCheck":
        return { nationality: "United States", purpose: intent.intent, language: params.language };

      case "SIMCard":
        return { city: params.destination, language: params.language };

      case "WebSearch":
        return { query: params.destination || "China travel", language: params.language };

      case "LocalExpert":
        return { city: params.destination, specialty: "general", language: params.language };

      case "city_database":
        return {
          city_name: params.destination || city?.nameEn || "Beijing",
          language: params.language,
          include_attractions: true,
          include_food: true,
          include_transport: true,
        };

      case "weather_api":
        return { city: params.destination || city?.nameEn || "Beijing", days: params.days || 5 };

      case "hotel_search":
        return {
          city: params.destination || city?.nameEn || "Beijing",
          budget_level: params.budgetLevel,
          user_rating_min: 4.0,
        };

      case "transport_search":
        return {
          destination: params.destination || city?.nameEn || "Beijing",
          transport_type: params.transportPreference || "any",
        };

      case "translation_api":
        return { target_lang: params.language, note: "Translation API available" };

      case "map_service":
        return { city: city?.nameEn || params.destination || "Beijing" };

      default:
        return {};
    }
  }

  private shouldTerminate(steps: ReActStep[]): boolean {
    if (steps.length >= this.maxIterations) return true;

    // Check if last few steps produced no new information
    const recentSteps = steps.slice(-2);
    if (recentSteps.length >= 2) {
      const obs1 = recentSteps[0].observation || "";
      const obs2 = recentSteps[1].observation || "";
      if (obs1 === obs2 && obs1 !== "") return true;
    }

    return false;
  }

  private summarizeObservation(result: unknown): string {
    if (!result || typeof result !== "object") return String(result);

    const r = result as Record<string, unknown>;

    if ("error" in r) return `Error: ${r.error}`;
    if ("status" in r) return `Status: ${r.status}`;

    // Summarize city data
    if ("attractions" in r && Array.isArray(r.attractions)) {
      const count = (r.attractions as unknown[]).length;
      return `Found ${count} attractions`;
    }

    if ("restaurants" in r && Array.isArray(r.restaurants)) {
      const count = (r.restaurants as unknown[]).length;
      return `Found ${count} restaurants`;
    }

    if ("hotels" in r && Array.isArray(r.hotels)) {
      const count = (r.hotels as unknown[]).length;
      return `Found ${count} hotels`;
    }

    return "Data retrieved successfully";
  }

  private getCityData(city: City): Record<string, unknown> {
    return {
      name_en: city.nameEn,
      name_zh: city.name,
      attractions: city.attractions?.map((a) => ({
        name: a.nameEn || a.name,
        name_zh: a.name,
        category: a.category,
        ticket_price: a.ticketPrice,
        duration: a.recommendedVisitTime,
      })),
      restaurants: city.restaurants?.slice(0, 5).map((r) => ({
        name: r.nameEn || r.name,
        cuisine: r.cuisine,
        price_range: `$${r.avgPrice}`,
        type: r.type,
      })),
      transport: city.transport,
    };
  }

  private getWeatherData(cityName?: string): Record<string, unknown> {
    return {
      location: { city: cityName || "Beijing" },
      forecast: [
        { date: "today", condition: "partly_cloudy", temp: { min: 18, max: 26 } },
        { date: "tomorrow", condition: "sunny", temp: { min: 20, max: 28 } },
      ],
      note: "Use AnySearch for real-time weather data",
    };
  }

  private getHotelRecommendations(city: City | null, budget: string): Record<string, unknown> {
    if (!city?.hotels) {
      return { hotels: [], note: "Use real hotel API for live data" };
    }

    const budgetMap: Record<string, string[]> = {
      budget: ["budget"],
      medium: ["mid", "budget"],
      luxury: ["luxury", "mid"],
    };

    const targetBudgets = budgetMap[budget] || ["mid"];

    const filtered = city.hotels
      .filter((h) => targetBudgets.includes(h.budget))
      .slice(0, 3)
      .map((h) => ({
        name: h.nameEn,
        budget: h.budget,
        price_range: h.priceRange,
        rating: h.rating,
      }));

    return { hotels: filtered };
  }

  private getTransportInfo(cityName?: string): Record<string, unknown> {
    return {
      destination: cityName || "Beijing",
      metro: "Available - use local transport app",
      taxi: "Available via Didi app",
      train: "High-speed rail network connects major cities",
      note: "Use 12306 app or station for real train schedules",
    };
  }

  private getMapData(city: City): Record<string, unknown> {
    return {
      city: city.nameEn,
      coordinates: city.coordinates,
      zoom_level: 12,
      attractions: city.attractions?.slice(0, 5).map((a) => ({
        name: a.nameEn || a.name,
        coordinates: a.coordinates,
      })),
    };
  }

  private formatResponse(
    intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    _reactSteps: ReActStep[],
    language: string,
  ): string {
    switch (intent.intent) {
      case "travel_planning":
        return this.formatTravelPlanning(intent, params, city, language);
      case "food_recommendation":
        return this.formatFoodRecommendation(intent, params, city, language);
      case "life_consultation":
        return this.formatLifeConsultation(intent, params, city, language);
      case "emergency_help":
        return this.formatEmergencyHelp(intent, params, language);
      case "business_arrangement":
        return this.formatBusinessHelp(intent, params, language);
      default:
        return this.formatCasualChat(intent, language);
    }
  }

  private formatTravelPlanning(
    _intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    language: string,
  ): string {
    const days = params.days || 5;
    const budget = params.budgetLevel;
    const dest = params.destination || city?.nameEn || city?.name || "your destination";

    let response = "";

    // Header
    response += `# ${language === "zh" ? "旅行计划" : "Travel Itinerary"}\n\n`;
    response += `${language === "zh" ? "目的地" : "Destination"}: **${dest}**\n`;
    response += `${language === "zh" ? "天数" : "Duration"}: **${days} ${language === "zh" ? "天" : "days"}**\n`;
    response += `${language === "zh" ? "预算级别" : "Budget Level"}: **${budget}**\n\n`;

    if (!city) {
      // Need more info
      response += `## ${language === "zh" ? "需要更多信息" : "Need More Information"}\n\n`;
      response +=
        language === "zh"
          ? `我目前没有"${dest}"的详细数据。请告诉我：\n- 您想去哪个具体城市？\n- 行程是几天？\n- 您的预算是多少？`
          : `I don't have detailed data for "${dest}" yet. Could you tell me:\n- Which specific city in China?\n- How many days?\n- What's your budget?`;
      return response;
    }

    // Destination intro
    response += `## ${language === "zh" ? "目的地概览" : "Destination Overview"}\n\n`;
    response += `**${city.nameEn}** (${city.name})\n`;
    response += `${city.description?.slice(0, 300) || ""}...\n\n`;

    // Highlights
    if (city.highlights && city.highlights.length > 0) {
      response += `### ${language === "zh" ? "必看亮点" : "Top Highlights"}\n`;
      city.highlights.forEach((h) => {
        response += `- ${h}\n`;
      });
      response += "\n";
    }

    // Daily Itinerary
    response += `## ${language === "zh" ? "每日行程" : "Daily Itinerary"}\n\n`;

    const themes =
      language === "zh"
        ? ["历史探索", "文化体验", "美食发现", "自然风光", "现代都市", "休闲购物", "返程"]
        : [
            "Historical Exploration",
            "Cultural Discovery",
            "Culinary Adventure",
            "Natural Beauty",
            "Modern City",
            "Leisure & Shopping",
            "Departure",
          ];

    const daysToShow = Math.min(days, city.attractions?.length || days, 7);

    for (let d = 0; d < daysToShow; d++) {
      const day = d + 1;
      const theme = themes[d % themes.length];
      const attr = city.attractions?.[d % (city.attractions?.length || 1)];

      response += `### ${language === "zh" ? `第${day}天` : `Day ${day}`}: ${theme}\n\n`;

      if (attr) {
        response += `**${language === "zh" ? "上午" : "Morning"}:** ${attr.nameEn || attr.name} ${language === "zh" ? "参观" : ""}\n`;
        response += `- ${attr.description?.slice(0, 150) || ""}...\n`;
        if (attr.ticketPrice)
          response += `- ${language === "zh" ? "门票" : "Ticket"}: ${attr.ticketPrice}\n`;
        if (attr.openingHours)
          response += `- ${language === "zh" ? "开放时间" : "Hours"}: ${attr.openingHours}\n`;
        response += `- ${language === "zh" ? "建议时长" : "Suggested duration"}: ${attr.recommendedVisitTime}\n\n`;
      }

      // Lunch suggestion
      const restaurant = city.restaurants?.[d % (city.restaurants?.length || 1)];
      if (restaurant) {
        response += `${language === "zh" ? "**午餐**" : "**Lunch:**"} ${restaurant.nameEn || restaurant.name}\n`;
        response += `- ${language === "zh" ? "推荐" : "Specialties"}: ${restaurant.dishHighlights?.slice(0, 3).join(", ")}\n`;
        response += `- ${language === "zh" ? "人均" : "Avg. price"}: ${restaurant.avgPrice} CNY\n\n`;
      }

      // Afternoon
      if (city.attractions && city.attractions.length > daysToShow) {
        const afternoonAttr = city.attractions[(d + daysToShow) % (city.attractions.length || 1)];
        if (afternoonAttr && afternoonAttr.id !== attr?.id) {
          response += `${language === "zh" ? "**下午**" : "**Afternoon:**"} ${afternoonAttr.nameEn || afternoonAttr.name}\n`;
          response += `- ${afternoonAttr.description?.slice(0, 100) || ""}...\n\n`;
        }
      }
    }

    // Practical Info
    response += `## ${language === "zh" ? "实用信息" : "Practical Information"}\n\n`;

    if (city.quickFacts) {
      response += `### ${language === "zh" ? "基本信息" : "Basic Info"}\n`;
      const facts = city.quickFacts;
      response += `- **${language === "zh" ? "语言" : "Language"}:** ${facts.language || "Mandarin Chinese"}\n`;
      response += `- **${language === "zh" ? "货币" : "Currency"}:** ${facts.currency || "CNY"}\n`;
      response += `- **${language === "zh" ? "签证" : "Visa"}:** ${facts.visa || "Required for most nationalities"}\n`;
      response += `- **${language === "zh" ? "时区" : "Timezone"}:** ${facts.timeZone || "UTC+8"}\n\n`;
    }

    // Payment methods
    if (city.payment && city.payment.length > 0) {
      response += `### ${language === "zh" ? "支付方式" : "Payment"}\n`;
      city.payment.forEach((p) => {
        response += `- **${p.method}:** ${p.description}\n`;
      });
      response += "\n";
    }

    // Transport
    if (city.transport?.local) {
      response += `### ${language === "zh" ? "市内交通" : "Local Transport"}\n`;
      if (city.transport.local.metro) {
        response += `- **${language === "zh" ? "地铁" : "Metro"}:** ${Array.isArray(city.transport.local.metro) ? city.transport.local.metro[0] : city.transport.local.metro}\n`;
      }
      if (city.transport.local.taxi) {
        response += `- **${language === "zh" ? "出租车" : "Taxi"}:** ${Array.isArray(city.transport.local.taxi) ? city.transport.local.taxi[0] : city.transport.local.taxi}\n`;
      }
      response += "\n";
    }

    // Estimated Cost
    response += `## ${language === "zh" ? "预算估算" : "Estimated Budget"}\n\n`;
    const dailyBudgets: Record<string, number> = { budget: 300, medium: 600, luxury: 1500 };
    const total = dailyBudgets[budget] * days;
    const food = Math.round(total * 0.25);
    const hotel = Math.round(total * 0.35);
    const transport = Math.round(total * 0.15);
    const attractions = Math.round(total * 0.25);

    response += `| ${language === "zh" ? "项目" : "Category"} | ${language === "zh" ? "金额 (CNY)" : "Amount (CNY)"} |\n`;
    response += "|------|------|\n";
    response += `| ${language === "zh" ? "总计" : "Total"} | ${total} |\n`;
    response += `| ${language === "zh" ? "餐饮" : "Food"} | ${food} |\n`;
    response += `| ${language === "zh" ? "住宿" : "Accommodation"} | ${hotel} |\n`;
    response += `| ${language === "zh" ? "交通" : "Transport"} | ${transport} |\n`;
    response += `| ${language === "zh" ? "门票" : "Attractions"} | ${attractions} |\n\n`;

    response += "---\n\n";
    response += `*${
      language === "zh"
        ? "此行程由ChinaConnect AI生成，仅供参考。请以当地实际信息为准。"
        : "This itinerary is generated by ChinaConnect AI and is for reference only. Please verify local information."
    }*\n`;

    return response;
  }

  private formatFoodRecommendation(
    _intent: IntentResult,
    params: ExtractedParams,
    city: City | null,
    language: string,
  ): string {
    const dest = params.destination || city?.nameEn || city?.name || "China";
    let response = "";

    response += `# ${language === "zh" ? "美食推荐" : "Food Recommendations"} - ${dest}\n\n`;

    if (!city?.restaurants) {
      response +=
        language === "zh"
          ? `我目前没有${dest}的详细美食数据。建议您使用AnySearch进行实时搜索，或告诉我您想去的具体城市。`
          : `I don't have detailed food data for ${dest} yet. Try using AnySearch for real-time results, or tell me which city you're visiting.`;
      return response;
    }

    const restaurants = city.restaurants.slice(0, 8);

    restaurants.forEach((r) => {
      const stars = r.star ? "⭐".repeat(r.star) : r.diamond ? "💎".repeat(r.diamond) : "";
      response += `### ${r.nameEn || r.name} ${stars}\n`;
      response += `**${r.cuisine}** | ${language === "zh" ? "人均" : "Avg price"}: ${r.avgPrice} CNY\n`;
      response += `${r.description || ""}\n`;
      response += `${language === "zh" ? "推荐菜" : "Highlights"}: ${r.dishHighlights?.slice(0, 4).join(", ")}\n`;
      if (r.hours) response += `${language === "zh" ? "营业时间" : "Hours"}: ${r.hours}\n`;
      response += "\n";
    });

    return response;
  }

  private formatLifeConsultation(
    _intent: IntentResult,
    _params: ExtractedParams,
    _city: City | null,
    language: string,
  ): string {
    let response = "";
    response += `# ${language === "zh" ? "生活指南" : "Life Guide"}\n\n`;

    response +=
      language === "zh"
        ? "以下是一些在中国生活的实用信息：\n\n"
        : "Here are some practical tips for living in China:\n\n";

    response += `## ${language === "zh" ? "支付方式" : "Payment Methods"}\n`;
    response += `- **${language === "zh" ? "微信支付" : "WeChat Pay"}:** ${language === "zh" ? "绑定银行卡即可使用，适用大多数场景" : "Link your bank card for most payments"}\n`;
    response += `- **${language === "zh" ? "支付宝" : "Alipay"}:** ${language === "zh" ? "同样方便，支持扫码支付" : "Equally convenient, QR code payment"}\n`;
    response += `- **${language === "zh" ? "现金" : "Cash"}:** ${language === "zh" ? "准备少量现金作为备用" : "Keep some cash as backup"}\n\n`;

    response += `## ${language === "zh" ? "交通出行" : "Getting Around"}\n`;
    response += `- **${language === "zh" ? "地铁" : "Metro"}:** ${language === "zh" ? "最便捷的出行方式，高峰期较拥挤" : "Most efficient, can be crowded during rush hours"}\n`;
    response += `- **${language === "zh" ? "滴滴" : "Didi"}:** ${language === "zh" ? "相当于Uber，支持英文界面" : "Like Uber, English interface available"}\n`;
    response += `- **${language === "zh" ? "共享单车" : "Bike Sharing"}:** ${language === "zh" ? "美团、哈啰单车随处可见" : "Meituan, Hello bikes available everywhere"}\n\n`;

    response += `## ${language === "zh" ? "SIM卡和流量" : "SIM & Data"}\n`;
    response += `- **${language === "zh" ? "国际漫游" : "Int'l Roaming"}:** ${language === "zh" ? "方便但费用高" : "Convenient but expensive"}\n`;
    response += `- **${language === "zh" ? "本地SIM" : "Local SIM"}:** ${language === "zh" ? "可在机场或便利店购买" : "Available at airports and convenience stores"}\n`;
    response += `- **${language === "zh" ? "推荐运营商" : "Recommended carriers"}:** China Mobile, China Unicom, Telecom\n\n`;

    response += "---\n\n";
    response +=
      language === "zh"
        ? "如果您有具体问题，欢迎继续问我！"
        : "Feel free to ask if you have specific questions!";

    return response;
  }

  private formatEmergencyHelp(
    _intent: IntentResult,
    _params: ExtractedParams,
    language: string,
  ): string {
    let response = "";
    response += `# ${language === "zh" ? "紧急帮助" : "Emergency Assistance"}\n\n`;

    response +=
      language === "zh"
        ? "**请保持冷静，我会尽力帮助您。**\n\n"
        : "**Please stay calm, I'm here to help.**\n\n";

    response += `## ${language === "zh" ? "紧急电话" : "Emergency Numbers"}\n`;
    response += `- 🚑 **${language === "zh" ? "急救" : "Ambulance"}:** 120\n`;
    response += `- 🚔 **${language === "zh" ? "报警" : "Police"}:** 110\n`;
    response += `- 🔥 **${language === "zh" ? "火警" : "Fire"}:** 119\n\n`;

    response += `## ${language === "zh" ? "护照丢失" : "Passport Lost"}\n`;
    response +=
      language === "zh"
        ? "1. 立即向当地警方报案，获取报警记录\n2. 联系您的大使馆或领事馆补办旅行证件\n3. 准备好身份证明材料（照片、身份证复印件等）\n4. 如需紧急回国，可申请旅行证\n\n"
        : "1. Report to local police immediately and get a police report\n2. Contact your embassy or consulate for document replacement\n3. Prepare identification materials (photos, ID copies, etc.)\n4. Emergency travel permits available if needed\n\n";

    response += "---\n\n";
    response +=
      language === "zh"
        ? "如果情况紧急，请立即拨打当地报警电话！"
        : "If the situation is critical, please call emergency services immediately!";

    return response;
  }

  private formatBusinessHelp(
    _intent: IntentResult,
    _params: ExtractedParams,
    language: string,
  ): string {
    let response = "";
    const isZh = language === "zh";

    response += `# ${isZh ? "商务出行指南" : "Business Travel Guide"}\n\n`;
    response += isZh
      ? "以下是一些商务出行建议：\n\n"
      : "Here are some tips for your business trip:\n\n";

    response += `## ${isZh ? "签证信息" : "Visa Information"}\n`;

    if (isZh) {
      response += "- **商务签证**: 适用于商务访问、会议、洽谈\n";
      response += "- **所需材料**: 邀请函、公司证明、护照、签证申请表\n";
      response += "- **办理时间**: 通常4-7个工作日\n\n";
    } else {
      response += "- **Business Visa (M)**: For business visits, meetings, negotiations\n";
      response +=
        "- **Required docs**: Invitation letter, company letter, passport, application form\n";
      response += "- **Processing time**: Usually 4-7 working days\n\n";
    }

    response += `## ${isZh ? "实用建议" : "Practical Tips"}\n`;

    if (isZh) {
      response += "- **名片交换**: 双手递接名片，仔细阅读后妥善保管\n";
      response += "- **着装**: 正式商务装，男性建议西装领带\n";
      response += "- **时间观念**: 守时很重要，提前5-10分钟到达\n";
    } else {
      response +=
        "- **Business card exchange**: Present and receive with both hands, read before storing\n";
      response += "- **Dress code**: Formal business attire, suits for men\n";
      response += "- **Punctuality**: Be on time, arrive 5-10 minutes early\n";
    }

    return response;
  }

  private formatCasualChat(_intent: IntentResult, language: string): string {
    const responses =
      language === "zh"
        ? [
            "中国是一个非常多元化的国家，从繁华的都市到宁静的乡村，从千年古都到现代奇观，每个地方都有独特的魅力！",
            "很高兴和您聊天！中国有太多值得探索的地方了。您有什么具体的旅行计划吗？",
            "无论是美食、历史、文化还是自然风光，中国都能满足您的期待！有什么我可以帮您规划的吗？",
          ]
        : [
            "China is an incredibly diverse country - from bustling megacities to serene countryside, from ancient capitals to modern wonders!",
            "Great chatting with you! China has so much to explore. Do you have any specific travel plans?",
            "Whether you're into food, history, culture, or nature - China has something for everyone! How can I help you plan?",
          ];

    return `# ${language === "zh" ? "关于中国" : "About China"}\n\n${responses[Math.floor(Math.random() * responses.length)]}\n\n---\n${language === "zh" ? "想开始规划您的中国之旅吗？告诉我您想去哪里、待多久！" : "Ready to plan your China trip? Tell me where you want to go and for how long!"}`;
  }
}

export const reactEngine = new ReActEngine();
