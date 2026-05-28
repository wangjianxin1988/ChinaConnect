/**
 * ThreeTierFoodSection Component
 * Displays restaurants organized by tier (S/A/B)
 * Integrates with the existing city page food section
 */

import React, { useState } from "react";
import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";
import { BloggerBadge, RatingBadge } from "./FoodTierBadge";

// Type for existing city restaurant data
interface FoodItemData {
  id: string;
  name: string;
  nameEn?: string;
  type: "michelin" | "blackpearl" | "local";
  star?: number;
  diamond?: number;
  cuisine: string;
  avgPrice: number;
  rating?: number;
  address?: string;
  coordinates?: { lat: number; lng: number };
  phone?: string;
  hours?: string;
  description?: string;
  dishHighlights?: string[];
  tags?: string[];
  // Blogger fields
  bloggerName?: string;
  bloggerPlatform?: "douyin" | "xiaohongshu" | "bilibili" | "weibo";
  bloggerReason?: string;
  videoUrl?: string;
  // Accessibility
  foreignerFriendly?: boolean;
  hasEnglishMenu?: boolean;
  hasPictureMenu?: boolean;
  // Price
  touristPrice?: number;
  localPrice?: number;
}

interface ThreeTierFoodSectionProps {
  restaurants: FoodItemData[];
  citySlug: string;
  cityName: string;
  className?: string;
}

// Map restaurant type to tier
function typeToTier(type: FoodItemData["type"]): "S" | "A" | "B" {
  switch (type) {
    case "michelin":
      return "S";
    case "blackpearl":
      return "A";
    case "local":
      return "B";
  }
}

// Get tier info
function getTierInfo(tier: "S" | "A" | "B") {
  return {
    S: { label: "Michelin", labelZh: "米其林星级", icon: "⭐", color: "amber" },
    A: { label: "Black Pearl", labelZh: "黑珍珠餐厅", icon: "💎", color: "slate" },
    B: { label: "Local Favorite", labelZh: "本地博主推荐", icon: "🔥", color: "orange" },
  }[tier];
}

export function ThreeTierFoodSection({
  restaurants,
  citySlug: _citySlug,
  cityName: _cityName,
  className = "",
}: ThreeTierFoodSectionProps) {
  const [activeTier, setActiveTier] = useState<"S" | "A" | "B" | "all">("all");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");

  // Group restaurants by tier
  const restaurantsByTier = {
    S: restaurants.filter((r) => r.type === "michelin"),
    A: restaurants.filter((r) => r.type === "blackpearl"),
    B: restaurants.filter((r) => r.type === "local"),
  };

  // Filter and sort
  const filteredRestaurants = restaurants
    .filter((r) => activeTier === "all" || typeToTier(r.type) === activeTier)
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price") return a.avgPrice - b.avgPrice;
      return (a.nameEn || a.name).localeCompare(b.nameEn || b.name);
    });

  const tierCounts = {
    S: restaurantsByTier.S.length,
    A: restaurantsByTier.A.length,
    B: restaurantsByTier.B.length,
  };

  return (
    <div className={className}>
      {/* Tier Filter Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTier("all")}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold border transition-all
            ${
              activeTier === "all"
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }
          `}
        >
          All ({restaurants.length})
        </button>
        {(["S", "A", "B"] as const).map((tier) => {
          const info = getTierInfo(tier);
          const isActive = activeTier === tier;
          const colorMap = {
            amber: isActive ? "bg-amber-50 border-amber-200 text-amber-700" : "",
            slate: isActive ? "bg-slate-800 border-slate-600 text-white" : "",
            orange: isActive ? "bg-orange-50 border-orange-200 text-orange-700" : "",
          };
          return (
            <button
              type="button"
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all
                ${colorMap[info.color as keyof typeof colorMap]}
                ${!isActive ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50" : ""}
              `}
            >
              <span>{info.icon}</span>
              <span>{info.labelZh}</span>
              <span className="text-xs opacity-70">({tierCounts[tier]})</span>
            </button>
          );
        })}

        {/* Sort dropdown */}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="tier-food-sort-select" className="text-sm text-gray-500">
            Sort:
          </label>
          <select
            id="tier-food-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="space-y-4">
        {filteredRestaurants.map((restaurant) => (
          <FoodItemCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No restaurants in this tier yet.</p>
        </div>
      )}
    </div>
  );
}

// Food Item Card
function FoodItemCard({ restaurant }: { restaurant: FoodItemData }) {
  const tier = typeToTier(restaurant.type);
  const tierInfo = getTierInfo(tier);
  const isLocalBlogger = restaurant.type === "local";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 card-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {restaurant.nameEn || restaurant.name}
          </h3>
          {restaurant.nameEn && <p className="text-gray-500 text-sm">{restaurant.name}</p>}
        </div>

        {/* Stars / Diamonds */}
        <div className="flex items-center gap-1 shrink-0">
          {restaurant.type === "michelin" && restaurant.star === 1 && (
            <span className="text-amber-400 text-sm font-bold">★</span>
          )}
          {restaurant.type === "michelin" && restaurant.star === 2 && (
            <>
              <span className="text-amber-400 text-sm font-bold">★</span>
              <span className="text-amber-400 text-sm font-bold">★</span>
            </>
          )}
          {restaurant.type === "michelin" && restaurant.star === 3 && (
            <>
              <span className="text-amber-400 text-sm font-bold">★</span>
              <span className="text-amber-400 text-sm font-bold">★</span>
              <span className="text-amber-400 text-sm font-bold">★</span>
            </>
          )}
          {restaurant.type === "blackpearl" && restaurant.diamond === 1 && (
            <span className="text-slate-400 text-sm font-bold">◆</span>
          )}
          {restaurant.type === "blackpearl" && restaurant.diamond === 2 && (
            <>
              <span className="text-slate-400 text-sm font-bold">◆</span>
              <span className="text-slate-400 text-sm font-bold">◆</span>
            </>
          )}
          {restaurant.type === "blackpearl" && restaurant.diamond === 3 && (
            <>
              <span className="text-slate-400 text-sm font-bold">◆</span>
              <span className="text-slate-400 text-sm font-bold">◆</span>
              <span className="text-slate-400 text-sm font-bold">◆</span>
            </>
          )}
        </div>
      </div>

      {/* Tier Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
            ${tier === "S" ? "bg-amber-50 text-amber-800 border-amber-200" : ""}
            ${tier === "A" ? "bg-slate-800 text-slate-200 border-slate-600" : ""}
            ${tier === "B" ? "bg-orange-50 text-orange-800 border-orange-200" : ""}
          `}
        >
          <span className="mr-1">{tierInfo.icon}</span>
          {tierInfo.labelZh}
        </span>
        <span className="text-gray-500 text-sm">{restaurant.cuisine}</span>
        {restaurant.hours && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{restaurant.hours}</span>
          </>
        )}
      </div>

      {/* Blogger info for tier B */}
      {isLocalBlogger && restaurant.bloggerPlatform && restaurant.bloggerName && (
        <div className="mb-3">
          <BloggerBadge
            platform={restaurant.bloggerPlatform}
            bloggerName={restaurant.bloggerName}
          />
          {restaurant.bloggerReason && (
            <p className="mt-2 text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
              💡 {restaurant.bloggerReason}
            </p>
          )}
          {restaurant.videoUrl && (
            <a
              href={restaurant.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              🎬 查看视频推荐
            </a>
          )}
        </div>
      )}

      {/* Price & Rating */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Avg. </span>
          <span className="font-semibold text-gray-900">¥{restaurant.avgPrice}</span>
          {restaurant.localPrice && (
            <span className="text-xs text-gray-400 ml-1">(本地价: ¥{restaurant.localPrice})</span>
          )}
        </div>
        {restaurant.rating && <RatingBadge rating={restaurant.rating} source="评分" />}
      </div>

      {/* Description */}
      {restaurant.description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{restaurant.description}</p>
      )}

      {/* Signature dishes */}
      {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Signature Dishes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.dishHighlights.map((dish) => (
              <span
                key={dish}
                className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Accessibility badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {restaurant.foreignerFriendly && (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
            🌍 外国游客友好
          </span>
        )}
        {restaurant.hasEnglishMenu && (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">📖 英文菜单</span>
        )}
        {restaurant.hasPictureMenu && (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
            🖼️ 图文菜单
          </span>
        )}
      </div>

      {/* Tags */}
      {restaurant.tags && restaurant.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <span>📞</span>
            <span>Call</span>
          </a>
        )}
        {restaurant.coordinates && (
          <MapDirectionsLink
            lat={restaurant.coordinates.lat}
            lng={restaurant.coordinates.lng}
            name={restaurant.nameEn || restaurant.name}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          />
        )}
        {restaurant.address && (
          <span
            className="ml-auto text-xs text-gray-400 line-clamp-1 text-right max-w-[180px]"
            title={restaurant.address}
          >
            {restaurant.address}
          </span>
        )}
      </div>
    </div>
  );
}

export default ThreeTierFoodSection;
