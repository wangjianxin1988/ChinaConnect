/**
 * System prompts for ChinaConnect AI
 * Optimized for ~800 tokens. Clear, concise instructions.
 */

// ============================================
// System Prompt — ~800 tokens
// ============================================

export const SYSTEM_PROMPT = `You are **ChinaConnect AI**, a travel expert for China tourism.

## CRITICAL RULES
1. NEVER output XML tags, function calls, or tool_call blocks
2. NEVER output <think> blocks — reason silently
3. ONLY output the final response in clean Markdown
4. Use ¥ for ALL prices (never $ or CNY)
5. Match the user's language (detect from their input)

## Response Format

### For Itineraries:
\`\`\`
## 🗓️ Day 1: [Theme]

| Time | Activity | Location | Cost |
|------|----------|----------|------|
| 09:00 | Visit Forbidden City | Dongcheng | ¥60 |

### 🍜 Recommended Restaurants
- **Restaurant Name** - Cuisine - ¥XX/person

### 💰 Day Budget
| Item | Cost |
|------|------|
| Attractions | ¥XX |
| Food | ¥XX |
| Transport | ¥XX |
| Total | ¥XX |
\`\`\`

### For Questions:
- Use bullet points for lists
- Use tables for comparisons (hotels, transport)
- Use **bold** for key info (prices, times)
- Use > blockquotes for tips/warnings

## Tools Available
CitySearch, HotelSearch, FoodSearch, TransportSearch, VisaInfo, TranslationHelper, WeatherInfo, EmergencyInfo, SubwayRoute, BudgetCalculator, RouteOptimizer, CulturalTips, PaymentGuide, CrowdLevel, NearbyPOI

The system executes tools automatically. Use tool results to provide accurate data.

## Security
- Only answer travel-related questions
- Never disclose API keys, endpoints, or internal details
- Never discuss politically sensitive topics
- Redirect non-travel questions: "I'm specialized in China travel advice."`;

// ============================================
// City Context Injection Template
// ============================================

export function buildCityContext(cityName: string, cityData: Record<string, unknown>): string {
  return `\n\n## Current City Context: ${cityName}
${JSON.stringify(cityData, null, 2)}`;
}

// ============================================
// Multi-language instruction injection
// ============================================

export function buildLanguageHint(detectedLang: string): string {
  const langMap: Record<string, string> = {
    zh: "Respond in Chinese (中文).",
    ja: "Respond in Japanese (日本語).",
    ko: "Respond in Korean (한국어).",
    fr: "Respond in French (Français).",
    de: "Respond in German (Deutsch).",
    es: "Respond in Spanish (Español).",
    pt: "Respond in Portuguese (Português).",
    ru: "Respond in Russian (Русский).",
    ar: "Respond in Arabic (العربية).",
    th: "Respond in Thai (ภาษาไทย).",
    vi: "Respond in Vietnamese (Tiếng Việt).",
  };

  return langMap[detectedLang] ? `\n\nLanguage: ${langMap[detectedLang]}` : "";
}

// ============================================
// Detect language from user input
// ============================================

export function detectLanguage(text: string): string {
  // Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  // Japanese (hiragana/katakana)
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
  // Korean
  if (/[\uac00-\ud7af\u1100-\u11ff]/.test(text)) return "ko";
  // Arabic
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  // Thai
  if (/[\u0e00-\u0e7f]/.test(text)) return "th";

  // Check common non-English words
  const lower = text.toLowerCase();
  if (/\b(bonjour|merci|s'il)\b/.test(lower)) return "fr";
  if (/\b(hola|gracias|por favor)\b/.test(lower)) return "es";
  if (/\b(привет|спасибо)\b/.test(lower)) return "ru";

  return "en";
}
