// @ts-nocheck
/**
 * Hotel Search API Route
 * /api/hotels/search
 * 
 * 实时搜索酒店数据
 * Query params:
 *   - city: 城市slug (required)
 *   - category: 酒店分类 (optional)
 *   - limit: 返回数量 (default: 20)
 */

import type { APIRoute } from "astro";
import { getHotelsByCity, getHotelsByCityAndCategory } from "@/data/hotels";
import type { HotelCategory } from "@/types/accommodation";

export const GET: APIRoute = async ({ url }) => {
  const city = url.searchParams.get("city");
  const category = url.searchParams.get("category") as HotelCategory | null;
  const limit = parseInt(url.searchParams.get("limit") || "20");

  if (!city) {
    return new Response(
      JSON.stringify({ error: "city parameter is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    let hotels;

    if (category) {
      hotels = getHotelsByCityAndCategory(city, category);
    } else {
      hotels = getHotelsByCity(city);
    }

    // Apply limit
    hotels = hotels.slice(0, limit);

    return new Response(
      JSON.stringify({
        success: true,
        city,
        category: category || "all",
        count: hotels.length,
        hotels,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch hotels" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
