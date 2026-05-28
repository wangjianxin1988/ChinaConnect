/**
 * FoodCard Component
 * Restaurant card with tier badge and rating display
 * Supports all three tiers: S (Michelin), A (Black Pearl), B (Local)
 * Also supports new types: budget_local, hole_in_wall, night_market
 */

import type { Restaurant } from "@/types/food";
import { RESTAURANT_TYPE_CONFIG } from "@/types/food";
import React from "react";
import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";
import {
  BloggerBadge,
  BudgetTypeBadge,
  FoodTierBadge,
  PriceRangeBadge,
  RatingBadge,
  RestaurantTypeBadge,
  TierStarsBadge,
} from "./FoodTierBadge";

interface FoodCardProps {
  restaurant: Restaurant;
  compact?: boolean;
  showMapLink?: boolean;
  showBloggerInfo?: boolean;
  className?: string;
}

export function FoodCard({
  restaurant,
  compact = false,
  showMapLink = true,
  showBloggerInfo = true,
  className = "",
}: FoodCardProps) {
  const isLocalBlogger = restaurant.tier === "B";
  const isNewType = ["budget_local", "hole_in_wall", "night_market"].includes(restaurant.type);

  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 card-hover ${className}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {restaurant.nameEn || restaurant.name}
          </h3>
          {restaurant.nameEn && <p className="text-gray-500 text-sm">{restaurant.name}</p>}
        </div>

        {/* Stars / Diamonds for tier S and A, or Type icon for new types */}
        <div className="flex items-center gap-1 shrink-0">
          {isNewType ? (
            <BudgetTypeBadge
              type={restaurant.type as "budget_local" | "hole_in_wall" | "night_market"}
              size="sm"
            />
          ) : (
            <TierStarsBadge
              tier={restaurant.tier}
              starCount={restaurant.star}
              diamondCount={restaurant.diamond}
            />
          )}
        </div>
      </div>

      {/* Tier Badge row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {isNewType ? (
          <RestaurantTypeBadge type={restaurant.type} size="sm" />
        ) : (
          <FoodTierBadge tier={restaurant.tier} size="sm" showSource />
        )}
        <span className="text-gray-500 text-sm">{restaurant.cuisine}</span>
        {restaurant.hours && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">{restaurant.hours}</span>
          </>
        )}
      </div>

      {/* Blogger info for tier B */}
      {isLocalBlogger &&
        showBloggerInfo &&
        restaurant.bloggerPlatform &&
        restaurant.bloggerName && (
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
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="External link"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        )}

      {/* Price & Rating */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">人均 </span>
          <PriceRangeBadge
            avgPrice={restaurant.avgPrice}
            localPrice={restaurant.localPrice}
            touristPrice={restaurant.touristPrice}
            showRange
          />
          {isNewType && (
            <span className="text-xs text-gray-400">
              (¥{RESTAURANT_TYPE_CONFIG[restaurant.type]?.priceRange.min}-
              {RESTAURANT_TYPE_CONFIG[restaurant.type]?.priceRange.max})
            </span>
          )}
        </div>
        {restaurant.rating && <RatingBadge rating={restaurant.rating} source="评分" />}
      </div>

      {/* Description */}
      {!compact && restaurant.description && (
        <p className="text-gray-600 text-sm leading-relaxed mb-3">{restaurant.description}</p>
      )}

      {/* Signature dishes */}
      {restaurant.dishHighlights && restaurant.dishHighlights.length > 0 && !compact && (
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
      {!compact && (
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.foreignerFriendly && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
              🌍 外国游客友好
            </span>
          )}
          {restaurant.hasEnglishMenu && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
              📖 英文菜单
            </span>
          )}
          {restaurant.hasPictureMenu && (
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
              🖼️ 图文菜单
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {!compact && restaurant.tags.length > 0 && (
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
        {showMapLink && restaurant.lat && restaurant.lng && (
          <MapDirectionsLink
            lat={restaurant.lat}
            lng={restaurant.lng}
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

// Compact version for lists
export function FoodCardCompact({
  restaurant,
  className = "",
}: {
  restaurant: Restaurant;
  className?: string;
}) {
  return <FoodCard restaurant={restaurant} compact showBloggerInfo={false} className={className} />;
}

export default FoodCard;
