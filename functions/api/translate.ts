/**
 * Cloudflare Pages Function — AI Translation API
 * 
 * Translates text content using Cloudflare Workers AI (free tier: 10,000 neurons/day)
 * Endpoint: POST /api/translate
 * Body: { text: string, targetLang: string, sourceLang?: string }
 * Returns: { translated: string, source: string, target: string, cached: boolean }
 */

import type { PagesFunction } from "@cloudflare/workers-types";

interface Env {
  // Cloudflare AI is available by default on Workers/Pages
}

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

// Language code mapping for the AI model
const LANG_MAP: Record<string, string> = {
  "en": "English",
  "ja": "Japanese",
  "ko": "Korean",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  "th": "Thai",
  "vi": "Vietnamese",
  "ru": "Russian",
  "fr": "French",
  "de": "German",
  "ar": "Arabic",
  "fa": "Persian",
};

// In-memory cache (per worker instance, resets on cold start)
const translationCache = new Map<string, string>();

function getCacheKey(text: string, target: string, source: string): string {
  // Use first 100 chars + hash for cache key (to keep it small)
  const shortText = text.substring(0, 100);
  return `${source}:${target}:${shortText}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = (await request.json()) as TranslateRequest;
    const { text, targetLang, sourceLang = "en" } = body;

    // Validate
    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing text or targetLang" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Skip if source === target
    if (sourceLang === targetLang) {
      return new Response(
        JSON.stringify({ translated: text, source: sourceLang, target: targetLang, cached: false }),
        { headers: corsHeaders }
      );
    }

    // Skip if target is English and source is English
    if (targetLang === "en") {
      return new Response(
        JSON.stringify({ translated: text, source: sourceLang, target: targetLang, cached: false }),
        { headers: corsHeaders }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(text, targetLang, sourceLang);
    if (translationCache.has(cacheKey)) {
      return new Response(
        JSON.stringify({
          translated: translationCache.get(cacheKey),
          source: sourceLang,
          target: targetLang,
          cached: true,
        }),
        { headers: corsHeaders }
      );
    }

    // Build translation prompt
    const targetName = LANG_MAP[targetLang] || targetLang;
    const sourceName = LANG_MAP[sourceLang] || sourceLang;

    // Use Cloudflare Workers AI for translation
    // @ts-ignore - AI binding is available on CF Pages
    const ai = (context.env as any).AI;
    
    if (ai) {
      // Use CF Workers AI (free tier)
      const response = await ai.run("@cf/meta/m2m100-1.2b", {
        text: text,
        source_lang: sourceLang === "zh-CN" ? "zh" : sourceLang,
        target_lang: targetLang === "zh-CN" ? "zh" : targetLang,
      });

      const translated = response.translated_text || text;
      
      // Cache the result
      translationCache.set(cacheKey, translated);

      return new Response(
        JSON.stringify({
          translated,
          source: sourceLang,
          target: targetLang,
          cached: false,
        }),
        { headers: corsHeaders }
      );
    }

    // Fallback: Use a simple prompt-based translation via MiniMax
    // (if CF AI is not available)
    const minimaxKey = (context.env as any).MINIMAX_API_KEY;
    if (minimaxKey) {
      const minimaxResponse = await fetch("https://api.minimax.chat/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${minimaxKey}`,
        },
        body: JSON.stringify({
          model: "MiniMax-M2.7-highspeed",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text from ${sourceName} to ${targetName}. Return ONLY the translated text, no explanations, no notes, no thinking process. Just the translation.`
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 2000,
          temperature: 0.1,
          reasoning_split: true,
        }),
      });

      const minimaxData = await minimaxResponse.json() as any;
      // Use content (not reasoning_content) for the translation
      let translated = minimaxData?.choices?.[0]?.message?.content || text;
      
      // Strip any <think>...</think> blocks that might leak through
      translated = translated.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      // Strip any leading/trailing quotes
      translated = translated.replace(/^["']|["']$/g, '').trim();

      // Cache
      translationCache.set(cacheKey, translated);

      return new Response(
        JSON.stringify({
          translated,
          source: sourceLang,
          target: targetLang,
          cached: false,
        }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "No translation service available" }),
      { status: 500, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Translation failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
