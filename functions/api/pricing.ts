/**
 * Pricing API
 * Returns available membership tiers and pricing
 *
 * GET /api/pricing
 * Returns: { tiers: MembershipTier[] }
 *
 * Uses static pricing data (no Supabase dependency for this endpoint)
 */

import type { PagesFunction } from "@cloudflare/workers-types";

// Static tier data matching subscription.ts
const TIERS = [
  {
    id: "free",
    name: { en: "Free", zh: "免费版" },
    description: { en: "Get started with basic AI travel planning", zh: "开始体验基础AI旅行规划" },
    pricing: { monthly: 0, annual: 0 },
    features: {
      en: ["5 AI requests per month", "Basic travel planning", "View itineraries"],
      zh: ["每月5次AI请求", "基础旅行规划", "查看行程"]
    },
    limits: { aiRequestsPerMonth: 5, saveItineraries: false, exportPDF: false },
    display_order: 1,
    is_active: true
  },
  {
    id: "explorer",
    name: { en: "Explorer", zh: "探索版" },
    description: { en: "More requests and save your itineraries", zh: "更多请求次数并保存行程" },
    pricing: { monthly: 4.99, annual: 47.99 },
    features: {
      en: ["20 AI requests per month", "Save itineraries", "Conversation history", "Priority support"],
      zh: ["每月20次AI请求", "保存行程", "对话历史", "优先支持"]
    },
    limits: { aiRequestsPerMonth: 20, saveItineraries: true, exportPDF: false },
    display_order: 2,
    is_active: true
  },
  {
    id: "traveler",
    name: { en: "Traveler", zh: "旅行版" },
    description: { en: "40 AI requests with premium features", zh: "每月40次AI请求及高级功能" },
    pricing: { monthly: 9.99, annual: 95.99 },
    features: {
      en: ["40 AI requests per month", "Save & export itineraries", "PDF export", "Premium customization", "Advanced travel tools"],
      zh: ["每月40次AI请求", "保存和导出行程", "PDF导出", "高级自定义", "高级旅行工具"]
    },
    limits: { aiRequestsPerMonth: 40, saveItineraries: true, exportPDF: true },
    display_order: 3,
    is_active: true
  },
  {
    id: "business",
    name: { en: "Business", zh: "商务版" },
    description: { en: "Full access for travel professionals", zh: "旅行专业人士的完整功能" },
    pricing: { monthly: 29.99, annual: 287.99 },
    features: {
      en: ["Unlimited AI requests", "Save & export itineraries", "PDF export", "Premium customization", "Business templates", "Team collaboration", "API access", "Dedicated support"],
      zh: ["无限AI请求", "保存和导出行程", "PDF导出", "高级自定义", "商务模板", "团队协作", "API访问", "专属支持"]
    },
    limits: { aiRequestsPerMonth: -1, saveItineraries: true, exportPDF: true },
    display_order: 4,
    is_active: true
  }
];

export const onRequestGet: PagesFunction = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return new Response(
    JSON.stringify({ tiers: TIERS }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    }
  );
};
