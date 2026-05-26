import { filterRestaurantList, foodFilterStore } from "@/lib/food-context";
import type { Restaurant } from "@/types/food";
import { useEffect, useState } from "react";

interface RestaurantListClientProps {
  restaurants: Restaurant[];
}

export default function RestaurantListClient({ restaurants }: RestaurantListClientProps) {
  const [filtered, setFiltered] = useState<Restaurant[]>(restaurants);
  const [stateVersion, setStateVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = foodFilterStore.subscribe(() => {
      setFiltered(filterRestaurantList(restaurants, foodFilterStore.getState()));
      setStateVersion((v) => v + 1);
    });
    // Initial filter
    setFiltered(filterRestaurantList(restaurants, foodFilterStore.getState()));
    return unsubscribe;
  }, [restaurants]);

  return (
    <>
      {filtered.map((restaurant) => (
        <RestaurantListItem key={restaurant.id} restaurant={restaurant} />
      ))}
    </>
  );
}

function RestaurantListItem({ restaurant }: { restaurant: Restaurant }) {
  const typeColors = {
    michelin: "bg-[#1E3A5F]/90 text-white",
    blackpearl: "bg-[#2D1B4E]/90 text-white",
    local: "bg-[#B8383D]/90 text-white",
  };

  return (
    <a
      href={`/food/${restaurant.id}`}
      className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200"
    >
      {restaurant.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${typeColors[restaurant.type]}`}
            >
              {restaurant.type === "michelin"
                ? "⭐"
                : restaurant.type === "blackpearl"
                  ? "💎"
                  : "🔥"}
              {restaurant.type === "michelin"
                ? "米其林"
                : restaurant.type === "blackpearl"
                  ? "黑珍珠"
                  : "本地推荐"}
              {restaurant.type === "michelin" && restaurant.star ? `${restaurant.star}星` : ""}
              {restaurant.type === "blackpearl" && restaurant.diamond
                ? `${restaurant.diamond}钻`
                : ""}
            </span>
          </div>
          {restaurant.bloggerName && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
                📍 {restaurant.bloggerName}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
            {restaurant.nameEn && <p className="text-xs text-gray-400">{restaurant.nameEn}</p>}
          </div>
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
            <span>★</span>
            <span>{restaurant.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="px-2 py-0.5 bg-gray-100 rounded">{restaurant.cuisine}</span>
          <span className="font-medium text-orange-600">¥{restaurant.avgPrice}</span>
          <span className="text-gray-400">/人</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-1">{restaurant.address}</p>
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">
              推荐: {restaurant.dishHighlights.slice(0, 2).join(", ")}
            </p>
          </div>
        )}
      </div>
    </a>
  );
}
