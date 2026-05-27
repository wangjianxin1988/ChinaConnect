/**
 * FoodList Component
 * Displays a filtered/sorted list of restaurants by tier
 * Supports three-tier filtering: S (Michelin), A (Black Pearl), B (Local)
 */

import { InfiniteList } from "@/components/ui/InfiniteList";
import type { FoodTier, Restaurant } from "@/types/food";
import React, { useState, useMemo } from "react";
import { FoodCard } from "./FoodCard";
import { FoodTierBadge } from "./FoodTierBadge";

interface FoodListProps {
  restaurants: Restaurant[];
  initialCount?: number;
  loadMoreCount?: number;
  showFilters?: boolean;
  showTierToggle?: boolean;
  className?: string;
}

const ALL_TIERS: FoodTier[] = ["S", "A", "B"];

export function FoodList({
  restaurants,
  initialCount = 10,
  loadMoreCount = 10,
  showFilters = true,
  showTierToggle = true,
  className = "",
}: FoodListProps) {
  const [activeTiers, setActiveTiers] = useState<Set<FoodTier>>(new Set(ALL_TIERS));
  const [sortBy, setSortBy] = useState<"rating" | "price" | "name">("rating");

  // Filter restaurants by active tiers
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => activeTiers.has(r.tier));
  }, [restaurants, activeTiers]);

  // Sort restaurants
  const sortedRestaurants = useMemo(() => {
    return [...filteredRestaurants].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "price") {
        return a.avgPrice - b.avgPrice;
      }
      return (a.nameEn || a.name).localeCompare(b.nameEn || b.name);
    });
  }, [filteredRestaurants, sortBy]);

  // Toggle tier selection
  const toggleTier = (tier: FoodTier) => {
    setActiveTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  // Count by tier
  const tierCounts = useMemo(() => {
    const counts: Record<FoodTier, number> = { S: 0, A: 0, B: 0 };
    for (const r of restaurants) {
      counts[r.tier]++;
    }
    return counts;
  }, [restaurants]);

  return (
    <div className={className}>
      {/* Filters and Tier Toggle */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Tier Toggle */}
          {showTierToggle && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Tier:</span>
              {ALL_TIERS.map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    transition-all border
                    ${
                      activeTiers.has(tier)
                        ? tier === "S"
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : tier === "A"
                            ? "bg-slate-800 border-slate-600 text-slate-200"
                            : "bg-orange-50 border-orange-200 text-orange-800"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                    }
                  `}
                >
                  <FoodTierBadge tier={tier} size="sm" showLabel={false} />
                  <span>{tierCounts[tier]}</span>
                </button>
              ))}

              {/* Sort dropdown */}
              <div className="ml-auto flex items-center gap-2">
                <label htmlFor="food-sort-select" className="text-sm text-gray-500">
                  Sort:
                </label>
                <select
                  id="food-sort-select"
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
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {Math.min(initialCount, sortedRestaurants.length)} of {sortedRestaurants.length}{" "}
        restaurants
      </div>

      {/* Restaurant List with Infinite Scroll */}
      {sortedRestaurants.length > 0 ? (
        <InfiniteList
          items={sortedRestaurants}
          initialCount={initialCount}
          loadMoreCount={loadMoreCount}
          renderItem={(restaurant, _index) => (
            <FoodCard key={restaurant.id} restaurant={restaurant} />
          )}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No restaurants match your filters.</p>
          <button
            type="button"
            onClick={() => setActiveTiers(new Set(ALL_TIERS))}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

interface FoodTierSectionProps {
  restaurants: Restaurant[];
  tier: FoodTier;
  title?: string;
  initialCount?: number;
  className?: string;
}

export function FoodTierSection({
  restaurants,
  tier,
  title,
  initialCount = 5,
  className = "",
}: FoodTierSectionProps) {
  const tierRestaurants = restaurants.filter((r) => r.tier === tier);

  if (tierRestaurants.length === 0) return null;

  const tierTitles: Record<FoodTier, { en: string; zh: string }> = {
    S: { en: "Michelin Stars", zh: "米其林星级" },
    A: { en: "Black Pearl", zh: "黑珍珠餐厅" },
    B: { en: "Local Favorites", zh: "本地博主推荐" },
  };

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FoodTierBadge tier={tier} size="md" />
        <span className="text-gray-700">{title || tierTitles[tier].zh}</span>
        <span className="text-sm font-normal text-gray-400">({tierRestaurants.length})</span>
      </h3>
      <div className="space-y-4">
        {tierRestaurants.slice(0, initialCount).map((restaurant) => (
          <FoodCard key={restaurant.id} restaurant={restaurant} />
        ))}
        {tierRestaurants.length > initialCount && (
          <button
            type="button"
            className="w-full py-3 text-center text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View all {tierRestaurants.length} {tierTitles[tier].zh}
          </button>
        )}
      </div>
    </div>
  );
}

export default FoodList;
