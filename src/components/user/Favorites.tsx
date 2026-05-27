/**
 * Favorites Component
 * Manages user favorites (cities, restaurants, hotels, attractions)
 */

import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import type { FavoriteItem, FavoriteType } from "@/types/user";
import { useState } from "react";

interface FavoritesProps {
  onRemove?: (id: string) => void;
  onViewDetails?: (item: FavoriteItem) => void;
  maxDisplay?: number;
  showCategories?: boolean;
  className?: string;
}

type TabType = "all" | "restaurants" | "cities" | "hotels" | "attractions";

export function Favorites({
  onRemove,
  onViewDetails,
  maxDisplay,
  showCategories = true,
  className,
}: FavoritesProps) {
  const { favorites, isFavorited, removeFavorite, clearFavorites, favoriteCount } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Convert restaurant favorites to FavoriteItem format
  const restaurantItems: FavoriteItem[] = favorites.map((f) => ({
    id: f.id,
    type: "restaurant",
    reference_id: f.id,
    name: f.name,
    nameZh: f.nameEn,
    image_url: f.imageUrl,
    rating: f.rating,
    added_at: f.addedAt,
    tags: [f.cuisine, f.type],
  }));

  // Filter by tab
  const filteredItems =
    activeTab === "all"
      ? restaurantItems
      : restaurantItems.filter((item) => item.type === activeTab);

  const displayItems = maxDisplay ? filteredItems.slice(0, maxDisplay) : filteredItems;
  const remainingCount = maxDisplay ? Math.max(0, filteredItems.length - maxDisplay) : 0;

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "all", label: "All", count: favoriteCount },
    { id: "restaurants", label: "Restaurants" },
    { id: "cities", label: "Cities" },
    { id: "hotels", label: "Hotels" },
    { id: "attractions", label: "Attractions" },
  ];

  if (favorites.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <svg
          className="h-12 w-12 mx-auto mb-3 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
        </svg>
        <p className="text-gray-500 text-sm">No favorites yet</p>
        <p className="text-gray-400 text-xs mt-1">Start exploring to add favorites!</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {showCategories && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Favorites Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {displayItems.map((item) => (
          <FavoriteCard
            key={item.id}
            item={item}
            onRemove={() => {
              removeFavorite(item.reference_id);
              onRemove?.(item.reference_id);
            }}
            onView={() => onViewDetails?.(item)}
          />
        ))}
      </div>

      {/* View More */}
      {remainingCount > 0 && (
        <p className="text-center text-sm text-gray-500">+{remainingCount} more favorites</p>
      )}
    </div>
  );
}

// ============================================
// FavoriteCard Component
// ============================================

interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove?: () => void;
  onView?: () => void;
  className?: string;
}

function FavoriteCard({ item, onRemove, onView, className }: FavoriteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeIcon = (type: FavoriteType) => {
    switch (type) {
      case "restaurant":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
          </svg>
        );
      case "city":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case "hotel":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9h.01" />
            <path d="M9 12h.01" />
            <path d="M9 15h.01" />
            <path d="M9 18h.01" />
          </svg>
        );
      case "attraction":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={cn(
        "group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all",
        className,
      )}
    >
      {/* Image */}
      {item.image_url ? (
        <div className="relative h-24 overflow-hidden">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          {/* Type badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-gray-600">
            {getTypeIcon(item.type)}
            <span className="capitalize">{item.type}</span>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-gray-400">{getTypeIcon(item.type)}</div>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        {item.nameZh && <p className="text-xs text-gray-500 truncate">{item.nameZh}</p>}

        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-1 mt-1">
            <svg className="h-3 w-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-xs font-medium text-gray-700">{item.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/90 p-1 text-gray-500 hover:text-gray-700 shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 z-10 w-32 rounded-lg bg-white shadow-lg border py-1">
            {onView && (
              <button
                onClick={() => {
                  onView();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => {
                  onRemove();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// FavoriteButton Component (add/remove toggle)
// ============================================

interface FavoriteButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  isFavorited,
  onToggle,
  size = "md",
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 rounded-full border-2 transition-all",
        isFavorited
          ? "border-red-400 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-300 bg-white text-gray-400 hover:border-red-300 hover:text-red-400",
        sizeClasses[size],
        className,
      )}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className={iconSizes[size]}
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium">{isFavorited ? "Favorited" : "Favorite"}</span>
      )}
    </button>
  );
}

// ============================================
// FavoritesSkeleton Component
// ============================================

interface FavoritesSkeletonProps {
  count?: number;
  className?: string;
}

export function FavoritesSkeleton({ count = 4, className }: FavoritesSkeletonProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-24 animate-pulse bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 animate-pulse bg-gray-200 rounded" />
            <div className="h-3 w-1/2 animate-pulse bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
