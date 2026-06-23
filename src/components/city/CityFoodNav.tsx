// @ts-nocheck
import type { Restaurant } from "@/data/cities/types";
import React, { useState } from "react";

interface CityFoodNavProps {
  restaurants: Restaurant[];
  citySlug: string;
}

type FoodFilter =
  | "all"
  | "local_recommend"
  | "michelin"
  | "blackpearl"
  | "affordable"
  | "street_food";

const FILTER_CONFIG: Record<
  FoodFilter,
  { label: string; labelZh: string; icon: string; colorClass: string }
> = {
  all: {
    label: "All",
    labelZh: "全部",
    icon: "🍽️",
    colorClass: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  },
  local_recommend: {
    label: "Local Recommend",
    labelZh: "本地人推荐",
    icon: "❤️",
    colorClass: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
  },
  michelin: {
    label: "Michelin",
    labelZh: "米其林",
    icon: "⭐",
    colorClass: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
  },
  blackpearl: {
    label: "Black Pearl",
    labelZh: "黑珍珠",
    icon: "💎",
    colorClass: "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-600",
  },
  affordable: {
    label: "Affordable",
    labelZh: "平价",
    icon: "💙",
    colorClass: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  street_food: {
    label: "Street Food",
    labelZh: "苍蝇馆子",
    icon: "🔥",
    colorClass: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
  },
};

const LOCAL_RECOMMEND_THRESHOLD = 150;
const AFFORDABLE_MAX_PRICE = 100;

function getFoodCategory(r: Restaurant): FoodFilter {
  if (r.type === "local") {
    const tags = r.tags || [];
    if (tags.some((t) => t.includes("苍蝇馆子") || t.includes("street"))) {
      return "street_food";
    }
    if (r.avgPrice <= AFFORDABLE_MAX_PRICE) {
      return "affordable";
    }
    if (r.avgPrice <= LOCAL_RECOMMEND_THRESHOLD) {
      return "local_recommend";
    }
    return "local_recommend";
  }
  if (r.type === "michelin") return "michelin";
  if (r.type === "blackpearl") return "blackpearl";
  // local type with higher price still shows as local_recommend
  return "local_recommend";
}

function getFilterCounts(restaurants: Restaurant[]): Record<FoodFilter, number> {
  const counts: Record<FoodFilter, number> = {
    all: restaurants.length,
    local_recommend: 0,
    michelin: 0,
    blackpearl: 0,
    affordable: 0,
    street_food: 0,
  };

  for (const r of restaurants) {
    const cat = getFoodCategory(r);
    if (cat !== "all") {
      counts[cat]++;
    }
  }

  return counts;
}

export function CityFoodNav({ restaurants, citySlug }: CityFoodNavProps) {
  const [activeFilter, setActiveFilter] = useState<FoodFilter>("all");
  const counts = getFilterCounts(restaurants);

  const filters: FoodFilter[] = [
    "all",
    "local_recommend",
    "michelin",
    "blackpearl",
    "affordable",
    "street_food",
  ];

  const filteredRestaurants =
    activeFilter === "all"
      ? restaurants
      : restaurants.filter((r) => getFoodCategory(r) === activeFilter);

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const config = FILTER_CONFIG[filter];
          const isActive = activeFilter === filter;
          return (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                ${
                  isActive
                    ? `${config.colorClass} ring-2 ring-offset-1 ${filter === "blackpearl" ? "ring-slate-400" : filter === "local_recommend" ? "ring-red-300" : filter === "affordable" ? "ring-blue-300" : filter === "street_food" ? "ring-orange-300" : "ring-amber-300"}`
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.labelZh}</span>
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${isActive ? "bg-white/40" : "bg-gray-100"}`}
              >
                {counts[filter]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Restaurant count summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-500">
          共 <span className="font-semibold text-gray-900">{filteredRestaurants.length}</span>{" "}
          家餐厅
        </p>
        <a
          href={`/city/${citySlug}/food${activeFilter !== "all" ? `?filter=${activeFilter}` : ""}`}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          完整列表 →
        </a>
      </div>
    </div>
  );
}
