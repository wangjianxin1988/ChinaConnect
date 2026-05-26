import React from "react";

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
}

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  compact?: boolean;
}

function getBadgeClass(type: RestaurantCardData["type"]) {
  if (type === "michelin") return "badge-michelin";
  if (type === "blackpearl") return "badge-blackpearl";
  return "badge-local";
}

function getBadgeLabel(type: RestaurantCardData["type"]) {
  if (type === "michelin") return "Michelin";
  if (type === "blackpearl") return "Black Pearl";
  return "Local Favorite";
}

export function RestaurantCard({ restaurant, compact = false }: RestaurantCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 card-hover">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{restaurant.nameEn}</h3>
          <p className="text-gray-500 text-sm">{restaurant.name}</p>
        </div>

        {/* Stars / Diamonds */}
        <div className="flex items-center gap-1 shrink-0">
          {restaurant.type === "michelin" && restaurant.star && (
            <div className="flex items-center">
              {Array.from({ length: restaurant.star }).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">
                  ★
                </span>
              ))}
            </div>
          )}
          {restaurant.type === "blackpearl" && restaurant.diamond && (
            <div className="flex items-center">
              {Array.from({ length: restaurant.diamond }).map((_, i) => (
                <span key={i} className="text-gray-400 text-sm">
                  ◆
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeClass(restaurant.type)}`}
        >
          {getBadgeLabel(restaurant.type)}
        </span>
        <span className="text-gray-500 text-sm">{restaurant.cuisine}</span>
        {restaurant.hours && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{restaurant.hours}</span>
          </>
        )}
      </div>

      {/* Price & Rating */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-500">Avg. </span>
          <span className="font-semibold text-gray-900">{restaurant.avgPrice} CNY</span>
        </div>
        <div className="text-yellow-500 font-medium">★ {restaurant.rating}</div>
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{restaurant.description}</p>
      )}

      {/* Signature dishes */}
      {restaurant.dishHighlights.length > 0 && !compact && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Signature Dishes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {restaurant.dishHighlights.map((dish, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {!compact && restaurant.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {restaurant.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
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
          <a
            href={`https://maps.google.com/maps?search=${restaurant.coordinates.lat},${restaurant.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <span>📍</span>
            <span>Directions</span>
          </a>
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

export default RestaurantCard;
