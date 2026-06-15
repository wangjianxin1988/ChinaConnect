import { useFavorites } from "@/hooks/useFavorites";
import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";
import type { Restaurant } from "@/types/food";
import React, { useCallback } from "react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  michelin: { label: "米其林", icon: "⭐", color: "text-[#1E3A5F]", bg: "bg-[#1E3A5F]/10" },
  blackpearl: { label: "黑珍珠", icon: "💎", color: "text-[#2D1B4E]", bg: "bg-[#2D1B4E]/10" },
  local: { label: "本地推荐", icon: "🔥", color: "text-[#B8383D]", bg: "bg-[#B8383D]/10" },
  street: { label: "苍蝇馆子", icon: "🍜", color: "text-[#D4820C]", bg: "bg-[#D4820C]/10" },
  cafe: { label: "咖啡厅", icon: "☕", color: "text-[#6B4226]", bg: "bg-[#6B4226]/10" },
  chain: { label: "连锁品牌", icon: "🏪", color: "text-[#2563EB]", bg: "bg-[#2563EB]/10" },
  fine: { label: "精致餐饮", icon: "🍽️", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
  "fine-dining": { label: "高级料理", icon: "🍽️", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
  international: { label: "国际美食", icon: "🌍", color: "text-[#059669]", bg: "bg-[#059669]/10" },
  luxury: { label: "奢华餐饮", icon: "👑", color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
  buffet: { label: "自助餐", icon: "🥘", color: "text-[#EA580C]", bg: "bg-[#EA580C]/10" },
  fastfood: { label: "快餐", icon: "🍔", color: "text-[#DC2626]", bg: "bg-[#DC2626]/10" },
  modern: { label: "新派餐厅", icon: "✨", color: "text-[#0891B2]", bg: "bg-[#0891B2]/10" },
};

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const config = TYPE_CONFIG[restaurant.type] || { label: "美食", icon: "🍴", color: "text-gray-600", bg: "bg-gray-100" };
  const { isFavorited, toggleFavorite } = useFavorites();

  const isFav = isFavorited(restaurant.id);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite({
        id: restaurant.id,
        name: restaurant.name,
        nameEn: restaurant.nameEn,
        cuisine: restaurant.cuisine,
        avgPrice: restaurant.avgPrice,
        rating: restaurant.rating,
        address: restaurant.address,
        city: restaurant.city,
        cityZh: restaurant.cityZh,
        type: restaurant.type,
        imageUrl: restaurant.imageUrl,
      });
    },
    [restaurant, toggleFavorite],
  );

  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {/* Favorite Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleFavoriteClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            handleFavoriteClick(e as unknown as React.MouseEvent);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all shadow-sm cursor-pointer ${
          isFav
            ? "bg-red-100 text-red-500"
            : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
        }`}
        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {isFav ? "❤️" : "🤍"}
      </div>

      {restaurant.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
            >
              {config.icon} {config.label}
              {restaurant.type === "michelin" && restaurant.star && `${restaurant.star}星`}
              {restaurant.type === "blackpearl" && restaurant.diamond && `${restaurant.diamond}钻`}
            </span>
          </div>
          {restaurant.bloggerName && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                📍 {restaurant.bloggerName}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
            <span>★</span>
            <span>{restaurant.rating}</span>
          </div>
        </div>

        {restaurant.nameEn && <p className="text-sm text-gray-500 mb-2">{restaurant.nameEn}</p>}

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span className="px-2 py-0.5 bg-gray-100 rounded">{restaurant.cuisine}</span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-orange-600">¥{restaurant.avgPrice}</span>
          <span className="text-gray-400">/人</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{restaurant.address}</p>

        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">推荐菜品</p>
            <div className="flex flex-wrap gap-1">
              {restaurant.dishHighlights.slice(0, 3).map((dish) => (
                <span key={dish} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Map & Phone */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <MapDirectionsLink
            lat={restaurant.lat}
            lng={restaurant.lng}
            name={restaurant.name}
            address={restaurant.address}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors touch-manipulation"
          />
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors touch-manipulation"
            >
              <span>📞</span>
              <span>{restaurant.phone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
