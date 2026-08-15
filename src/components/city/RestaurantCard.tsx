import React from "react";
import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";
import { ct } from "@/i18n/components-strings";

export interface RestaurantCardData {
  id: string;
  name: string;
  nameEn: string;
  type: "michelin" | "blackpearl" | "local";
  star?: number;
  diamond?: number;
  cuisine: string;
  avgPrice: number;
  rating: number;
  address?: string;
  coordinates?: { lat: number; lng: number };
  phone?: string;
  hours?: string;
  description: string;
  dishHighlights: string[];
  tags: string[];
  image?: string;
}

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  compact?: boolean;
  lang?: string;
}

function getBadgeConfig(type: RestaurantCardData["type"], lang: string = "en") {
  if (type === "michelin")
    return {
      class: "bg-amber-500 text-white shadow-lg shadow-amber-200",
      label: ct(lang, "badge_michelin", "Michelin"),
      icon: "⭐",
    };
  if (type === "blackpearl")
    return {
      class: "bg-slate-800 text-white shadow-lg shadow-slate-300",
      label: ct(lang, "badge_blackpearl", "Black Pearl"),
      icon: "💎",
    };
  return {
    class: "bg-orange-500 text-white shadow-lg shadow-orange-200",
    label: ct(lang, "badge_local", "Local Favorite"),
    icon: "🔥",
  };
}

function getPriceLevel(avgPrice: number): { label: string; color: string } {
  if (avgPrice <= 20) return { label: "¥", color: "text-green-600" };
  if (avgPrice <= 80) return { label: "¥¥", color: "text-green-500" };
  if (avgPrice <= 200) return { label: "¥¥¥", color: "text-amber-500" };
  if (avgPrice <= 500) return { label: "¥¥¥¥", color: "text-orange-500" };
  return { label: "¥¥¥¥¥", color: "text-red-500" };
}

export function RestaurantCard({ restaurant, compact = false, lang = "en" }: RestaurantCardProps) {
  const badge = getBadgeConfig(restaurant.type, lang);
  const priceLevel = getPriceLevel(restaurant.avgPrice);
  // Display-name selection logic:
  //   zh-CN / zh-TW  -> restaurant.name (Chinese original)
  //   ja / ko         -> prefers restaurant.nameJa / nameKo from cities-i18n/<lang>/<slug>.json
  //                       (falls back to nameEn so users see 汉字/가나 instead of 中文)
  //   fr / de / ru / vi / th / ar / fa / en -> restaurant.nameEn
  const localKey = (lang === "ja") ? "nameJa"
                  : (lang === "ko") ? "nameKo"
                  : null;
  const localised = localKey ? (restaurant as any)[localKey] : undefined;
  const isCJK = lang === "zh-CN" || lang === "zh-TW";
  const displayName = isCJK && restaurant.name
    ? restaurant.name
    : (localised || restaurant.nameEn || restaurant.name);
  const secondaryName = (displayName === restaurant.nameEn) ? restaurant.name : restaurant.nameEn;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col">
      {/* Hero Image / Placeholder */}
      <div className="relative h-48 overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.nameEn}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-6xl ${
              restaurant.type === "michelin"
                ? "bg-gradient-to-br from-amber-100 to-amber-200"
                : restaurant.type === "blackpearl"
                  ? "bg-gradient-to-br from-slate-700 to-slate-900"
                  : "bg-gradient-to-br from-orange-100 to-red-100"
            }`}
          >
            {restaurant.type === "michelin" ? "⭐" : restaurant.type === "blackpearl" ? "💎" : "🍜"}
          </div>
        )}

        {/* Type Badge - Top Left, Large */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${badge.class}`}
          >
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
        </div>

        {/* Stars / Diamonds - Top Right */}
        {(restaurant.type === "michelin" && restaurant.star) ||
        (restaurant.type === "blackpearl" && restaurant.diamond) ? (
          <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            {restaurant.type === "michelin" &&
              restaurant.star &&
              Array.from({ length: restaurant.star }).map((_, i) => (
                <span key={i} className="text-amber-400 text-lg">
                  ★
                </span>
              ))}
            {restaurant.type === "blackpearl" &&
              restaurant.diamond &&
              Array.from({ length: restaurant.diamond }).map((_, i) => (
                <span key={i} className="text-white text-lg">
                  ◆
                </span>
              ))}
          </div>
        ) : null}

        {/* Price Level - Bottom Right */}
        <div className="absolute bottom-3 right-3">
          <span
            className={`inline-block px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm font-bold text-sm ${priceLevel.color} shadow-sm`}
          >
            {priceLevel.label}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight">{displayName}</h3>
        {secondaryName && secondaryName !== displayName && (
          <p className="text-gray-500 text-sm mb-3">{secondaryName}</p>
        )}

        {/* Price & Rating - Prominent */}
        <div className="flex items-end gap-3 mb-3">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{ct(lang, "avg_per_person", "Avg")}</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold text-gray-900">¥{restaurant.avgPrice}</span>
            </div>
          </div>
          {restaurant.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="font-bold text-gray-900 text-sm">{restaurant.rating}</span>
            </div>
          )}
        </div>

        {/* Cuisine & Hours */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {restaurant.cuisine}
          </span>
          {restaurant.hours && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
              🕐 {restaurant.hours}
            </span>
          )}
        </div>

        {/* Description */}
        {!compact && (
          <p
            className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2"
            data-translate={restaurant.description}
          >
            {restaurant.description}
          </p>
        )}

        {/* Dish Highlights */}
        {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && !compact && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {ct(lang, "signature_dishes", "Signature Dishes")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.dishHighlights.map((dish, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {!compact && restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors touch-manipulation"
            >
              <span>📞</span>
              <span>{ct(lang, "call_button", "Call")}</span>
            </a>
          )}
          {(restaurant.coordinates || restaurant.address) && (
            <MapDirectionsLink
              lat={restaurant.coordinates?.lat}
              lng={restaurant.coordinates?.lng}
              name={restaurant.nameEn}
              address={restaurant.address}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors touch-manipulation"
             lang="lang"/>
          )}
          {restaurant.address && (
            <span
              className="ml-auto text-xs text-gray-400 line-clamp-1 text-right max-w-[160px]"
              title={restaurant.address}
            >
              {restaurant.address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
