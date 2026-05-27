import type { Restaurant, RestaurantHighlightTag } from "@/data/cities/types";
import React from "react";

interface FoodHighlightsSectionProps {
  restaurants: Restaurant[];
  citySlug: string;
  cityName: string;
}

const LOCAL_RECOMMEND_THRESHOLD = 150; // avgPrice below this + local type = local recommend
const AFFORDABLE_MAX_PRICE = 100; // avgPrice <= this = affordable

function getHighlightTag(r: Restaurant): RestaurantHighlightTag | null {
  if (r.type === "local") {
    const tags = r.tags || [];
    // Has "苍蝇馆子" tag → street food
    if (tags.some((t) => t.includes("苍蝇馆子") || t.includes("street"))) {
      return "street_food";
    }
    // Low price local restaurant → affordable
    if (r.avgPrice <= AFFORDABLE_MAX_PRICE) {
      return "affordable";
    }
    // Local type + reasonable price + not street food → local recommend
    if (r.avgPrice <= LOCAL_RECOMMEND_THRESHOLD) {
      return "local_recommend";
    }
  }
  // michelin/blackpearl that are affordable (lunch sets, etc.) could be marked affordable
  if (r.type !== "local" && r.avgPrice <= AFFORDABLE_MAX_PRICE) {
    return "affordable";
  }
  return null;
}

const HIGHLIGHT_CONFIG: Record<
  RestaurantHighlightTag,
  { label: string; labelZh: string; badgeClass: string; icon: string }
> = {
  local_recommend: {
    label: "Local Recommend",
    labelZh: "本地人推荐",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    icon: "❤️",
  },
  affordable: {
    label: "Affordable",
    labelZh: "平价美食",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "💙",
  },
  street_food: {
    label: "Street Food",
    labelZh: "苍蝇馆子",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    icon: "🔥",
  },
};

function getBadgeClass(type: Restaurant["type"]) {
  if (type === "michelin") return "badge-michelin";
  if (type === "blackpearl") return "badge-blackpearl";
  return "badge-local";
}

function getBadgeLabel(type: Restaurant["type"]) {
  if (type === "michelin") return "Michelin";
  if (type === "blackpearl") return "Black Pearl";
  return "Local Favorite";
}

interface HighlightCardProps {
  restaurant: Restaurant;
  highlightTag: RestaurantHighlightTag;
}

function HighlightCard({ restaurant, highlightTag }: HighlightCardProps) {
  const config = HIGHLIGHT_CONFIG[highlightTag];

  return (
    <a
      href={`/food/${restaurant.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
            {restaurant.nameEn}
          </h4>
          <p className="text-gray-500 text-xs truncate">{restaurant.name}</p>
        </div>
        {/* Highlight badge - prominent */}
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
        >
          {config.icon} {config.labelZh}
        </span>
      </div>

      {/* Sub-badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeClass(restaurant.type)}`}
        >
          {getBadgeLabel(restaurant.type)}
          {restaurant.type === "michelin" && restaurant.star ? `${restaurant.star}星` : ""}
          {restaurant.type === "blackpearl" && restaurant.diamond ? `${restaurant.diamond}钻` : ""}
        </span>
        <span className="text-gray-400 text-xs">{restaurant.cuisine}</span>
      </div>

      {/* Price & Rating */}
      <div className="flex items-center gap-3 text-xs mb-2">
        <div>
          <span className="text-gray-500">¥</span>
          <span className="font-semibold text-gray-900">{restaurant.avgPrice}</span>
          <span className="text-gray-400">/人</span>
        </div>
        {restaurant.rating && (
          <div className="text-yellow-500 font-medium">★ {restaurant.rating}</div>
        )}
      </div>

      {/* Signature dishes */}
      {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {restaurant.dishHighlights.slice(0, 2).map((dish) => (
            <span
              key={`${restaurant.id}-${dish}`}
              className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs"
            >
              {dish}
            </span>
          ))}
        </div>
      )}

      {/* Address */}
      {restaurant.address && (
        <p className="mt-2 text-xs text-gray-400 truncate">{restaurant.address}</p>
      )}
    </a>
  );
}

export function FoodHighlightsSection({
  restaurants,
  citySlug,
  cityName,
}: FoodHighlightsSectionProps) {
  // Categorize restaurants
  const categorized: Record<RestaurantHighlightTag, Restaurant[]> = {
    local_recommend: [],
    affordable: [],
    street_food: [],
  };

  for (const r of restaurants) {
    const tag = getHighlightTag(r);
    if (tag) {
      categorized[tag].push(r);
    }
  }

  const hasLocalRecommend = categorized.local_recommend.length > 0;
  const hasAffordable = categorized.affordable.length > 0;
  const hasStreetFood = categorized.street_food.length > 0;

  if (!hasLocalRecommend && !hasAffordable && !hasStreetFood) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">本地美食亮点</h3>
          <p className="text-sm text-gray-500 mt-0.5">{cityName}本地人真心推荐</p>
        </div>
        <a
          href={`/city/${citySlug}/food`}
          className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
        >
          查看全部
          <span>→</span>
        </a>
      </div>

      {/* Three category grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Local Recommend */}
        {hasLocalRecommend && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-lg">❤️</span>
              <h4 className="font-semibold text-red-700">本地人推荐</h4>
              <span className="text-xs text-gray-400 ml-auto">
                {categorized.local_recommend.length}家
              </span>
            </div>
            <div className="space-y-2">
              {categorized.local_recommend.slice(0, 3).map((r) => (
                <HighlightCard key={r.id} restaurant={r} highlightTag="local_recommend" />
              ))}
            </div>
            {categorized.local_recommend.length > 3 && (
              <a
                href={`/city/${citySlug}/food?filter=local_recommend`}
                className="block text-center text-sm text-red-600 hover:text-red-700 font-medium py-2 border border-dashed border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                查看全部{categorized.local_recommend.length}家 →
              </a>
            )}
          </div>
        )}

        {/* Affordable */}
        {hasAffordable && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold text-lg">💙</span>
              <h4 className="font-semibold text-blue-700">平价美食</h4>
              <span className="text-xs text-gray-400 ml-auto">
                {categorized.affordable.length}家
              </span>
            </div>
            <div className="space-y-2">
              {categorized.affordable.slice(0, 3).map((r) => (
                <HighlightCard key={r.id} restaurant={r} highlightTag="affordable" />
              ))}
            </div>
            {categorized.affordable.length > 3 && (
              <a
                href={`/city/${citySlug}/food?filter=affordable`}
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                查看全部{categorized.affordable.length}家 →
              </a>
            )}
          </div>
        )}

        {/* Street Food */}
        {hasStreetFood && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-lg">🔥</span>
              <h4 className="font-semibold text-orange-700">苍蝇馆子</h4>
              <span className="text-xs text-gray-400 ml-auto">
                {categorized.street_food.length}家
              </span>
            </div>
            <div className="space-y-2">
              {categorized.street_food.slice(0, 3).map((r) => (
                <HighlightCard key={r.id} restaurant={r} highlightTag="street_food" />
              ))}
            </div>
            {categorized.street_food.length > 3 && (
              <a
                href={`/city/${citySlug}/food?filter=street_food`}
                className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium py-2 border border-dashed border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
              >
                查看全部{categorized.street_food.length}家 →
              </a>
            )}
          </div>
        )}
      </div>

      {/* CTA: Full Food Page */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>🍜</span> 探索{cityName}全部美食
            </h4>
            <p className="text-sm text-gray-600 mt-0.5">米其林、黑珍珠、本地推荐 — 三层筛选</p>
          </div>
          <a
            href={`/city/${citySlug}/food`}
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            美食地图
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Navigate to food map</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
