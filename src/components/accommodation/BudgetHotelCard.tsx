/**
 * BudgetHotelCard Component
 * 平价酒店卡片组件
 */

import type { BudgetHotelType } from "@/types/accommodation";
import {
  BLOGGER_PLATFORM_LABELS,
  BUDGET_HOTEL_TYPE_LABELS,
  getAmenityIcon,
} from "@/types/accommodation";
import React from "react";

export interface BudgetHotelCardData {
  id: string;
  name: string;
  nameEn: string;
  type: BudgetHotelType;
  avgPrice: number;
  district: string;
  address: string;
  metro?: {
    line: string;
    station: string;
    walkingMinutes: number;
  };
  rating: number;
  reviewCount?: number;
  bloggerName?: string;
  bloggerPlatform?: "douyin" | "xiaohongshu" | "bilibili" | "weibo";
  bloggerReason?: string;
  amenities: string[];
  foreignerFriendly: boolean;
  hasEnglishSign: boolean;
  phone?: string;
  tips?: string;
}

interface BudgetHotelCardProps {
  hotel: BudgetHotelCardData;
  compact?: boolean;
}

function getTypeBadgeClass(type: BudgetHotelType): string {
  return BUDGET_HOTEL_TYPE_LABELS[type]?.color ?? "bg-gray-100 text-gray-700";
}

function getTypeLabel(type: BudgetHotelType): string {
  return BUDGET_HOTEL_TYPE_LABELS[type]?.label ?? type;
}

export function BudgetHotelCard({ hotel, compact = false }: BudgetHotelCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{hotel.nameEn}</h3>
          <p className="text-gray-500 text-sm">{hotel.name}</p>
        </div>

        {/* Price badge */}
        <div className="shrink-0 text-right">
          <div className="text-xl font-bold text-green-600">¥{hotel.avgPrice}</div>
          <div className="text-xs text-gray-400">/night</div>
        </div>
      </div>

      {/* Type and location badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeClass(hotel.type)}`}
        >
          {getTypeLabel(hotel.type)}
        </span>
        <span className="text-gray-500 text-sm">{hotel.district}</span>
        {hotel.metro && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-blue-600 text-sm flex items-center gap-1">
              <span>🚇</span>
              <span>
                {hotel.metro.line} {hotel.metro.station}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Rating row */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 font-medium">★ {hotel.rating.toFixed(1)}</span>
          {hotel.reviewCount && (
            <span className="text-gray-400 text-xs">
              ({hotel.reviewCount.toLocaleString()} reviews)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hotel.foreignerFriendly && (
            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
              Foreigner Friendly
            </span>
          )}
          {hotel.hasEnglishSign && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
              English Sign
            </span>
          )}
        </div>
      </div>

      {/* Blogger recommendation */}
      {hotel.bloggerName && !compact && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
              {hotel.bloggerName.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-gray-800">{hotel.bloggerName}</span>
            {hotel.bloggerPlatform && (
              <span className="text-xs text-gray-500">
                @{BLOGGER_PLATFORM_LABELS[hotel.bloggerPlatform]}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{hotel.bloggerReason}</p>
        </div>
      )}

      {/* Amenities */}
      {!compact && hotel.amenities.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 6).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs flex items-center gap-1"
                title={amenity}
              >
                <span>{getAmenityIcon(amenity)}</span>
                <span>{amenity.replace(/_/g, " ")}</span>
              </span>
            ))}
            {hotel.amenities.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                +{hotel.amenities.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Compact mode: Show metro and tips */}
      {compact && hotel.metro && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="text-blue-600">🚇</span> {hotel.metro.line} {hotel.metro.station} (
          {hotel.metro.walkingMinutes}min walk)
        </div>
      )}

      {/* Tips */}
      {!compact && hotel.tips && (
        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="text-amber-500 mr-1">💡</span>
          {hotel.tips}
        </div>
      )}

      {/* Address */}
      <div className="text-sm text-gray-500 truncate mb-3" title={hotel.address}>
        📍 {hotel.address}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {hotel.phone && (
          <a
            href={`tel:${hotel.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <span>📞</span>
            <span>Call</span>
          </a>
        )}
        {hotel.metro && (
          <a
            href={`https://maps.google.com/maps?search=${hotel.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            <span>🗺️</span>
            <span>Directions</span>
          </a>
        )}
        {hotel.foreignerFriendly && (
          <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
            <span>✓</span>
            <span>Verified</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default BudgetHotelCard;
