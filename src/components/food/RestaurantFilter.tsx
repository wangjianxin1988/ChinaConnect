import { foodFilterStore } from "@/lib/food-context";
import type { FilterState, RestaurantType } from "@/types/food";
import { useEffect, useState } from "react";

interface RestaurantFilterProps {
  cuisines: string[];
}

const _CUISINES = ["中餐", "西餐", "日料", "东南亚", "其他"];
const PRICE_RANGES: { label: string; value: [number, number] }[] = [
  { label: "不限", value: [0, 99999] },
  { label: "0-100", value: [0, 100] },
  { label: "100-300", value: [100, 300] },
  { label: "300-500", value: [300, 500] },
  { label: "500+", value: [500, 99999] },
];
const RATINGS = [
  { label: "不限", value: 0 },
  { label: "4.0+", value: 4.0 },
  { label: "4.5+", value: 4.5 },
  { label: "4.8+", value: 4.8 },
];
const DISTANCES = [
  { label: "不限", value: 0 },
  { label: "1km", value: 1 },
  { label: "3km", value: 3 },
  { label: "5km", value: 5 },
  { label: "10km", value: 10 },
];

export default function RestaurantFilter({ cuisines }: RestaurantFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState(foodFilterStore.getState().filter);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = foodFilterStore.subscribe((state) => {
      setFilters(state.filter);
    });
    return unsubscribe;
  }, []);

  const onChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    foodFilterStore.setFilter(newFilters);
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((c) => c !== cuisine)
      : [...filters.cuisines, cuisine];
    onChange({ ...filters, cuisines: newCuisines });
  };

  const toggleType = (type: RestaurantType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: newTypes });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">筛选</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? "收起" : "展开更多"}
        </button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        {/* Cuisine */}
        {cuisines.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">菜系</label>
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => toggleCuisine(cuisine)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${
                      filters.cuisines.includes(cuisine)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">人均价格</label>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() =>
                  onChange({
                    ...filters,
                    priceRange: range.value[1] === 99999 ? null : range.value,
                  })
                }
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-all
                  ${
                    JSON.stringify(filters.priceRange) === JSON.stringify(range.value)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                ¥{range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">评分</label>
          <div className="flex flex-wrap gap-2">
            {RATINGS.map((rating) => (
              <button
                key={rating.label}
                onClick={() => onChange({ ...filters, minRating: rating.value || null })}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-all
                  ${
                    filters.minRating === rating.value
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">距离</label>
          <div className="flex flex-wrap gap-2">
            {DISTANCES.map((dist) => (
              <button
                key={dist.label}
                onClick={() => onChange({ ...filters, distance: dist.value || null })}
                className={`
                  px-3 py-1.5 rounded-full text-sm transition-all
                  ${
                    filters.distance === dist.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {dist.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Restaurant Type */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">餐厅类型</label>
              <div className="flex flex-wrap gap-2">
                {(["michelin", "blackpearl", "local"] as RestaurantType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-all
                      ${
                        filters.types.includes(type)
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }
                    `}
                  >
                    {type === "michelin"
                      ? "⭐ 米其林"
                      : type === "blackpearl"
                        ? "💎 黑珍珠"
                        : "🔥 本地推荐"}
                  </button>
                ))}
              </div>
            </div>

            {/* Foreigner Friendly */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.foreignerFriendly}
                  onChange={(e) => onChange({ ...filters, foreignerFriendly: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">仅显示外国人友好餐厅</span>
              </label>
            </div>
          </>
        )}

        {/* Reset Button */}
        <button
          onClick={() => {
            foodFilterStore.reset();
            setFilters(foodFilterStore.getState().filter);
          }}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
        >
          重置筛选
        </button>
      </div>
    </div>
  );
}
