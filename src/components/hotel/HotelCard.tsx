/**
 * HotelCard Component
 * 统一酒店卡片组件 - 支持图片、地图跳转、电话拨打
 *
 * Features:
 * - 顶部大图 (h-48 object-cover)
 * - 中英文名称
 * - 分类标签（豪华/中端/经济/青年旅舍/情趣/电竞）
 * - 价格区间
 * - 评分
 * - 地址 + 地图跳转（高德地图）
 * - 电话拨打
 * - 特色标签（highlights）
 * - 响应式设计
 */

import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";
import React from "react";

// ─── Hotel Category Types ────────────────────────────────────────

export type HotelCategory =
  | "luxury"
  | "mid_range"
  | "budget"
  | "hostel"
  | "love_hotel"
  | "esports_hotel";

// ─── Category Label & Color Config ───────────────────────────────

export const HOTEL_CATEGORY_CONFIG: Record<
  HotelCategory,
  { label: string; labelEn: string; color: string; bg: string; icon: string }
> = {
  luxury: {
    label: "豪华",
    labelEn: "Luxury",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: "👑",
  },
  mid_range: {
    label: "中端",
    labelEn: "Mid-Range",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: "🏨",
  },
  budget: {
    label: "经济",
    labelEn: "Budget",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: "💰",
  },
  hostel: {
    label: "青年旅舍",
    labelEn: "Hostel",
    color: "text-cyan-700",
    bg: "bg-cyan-100",
    icon: "🛏️",
  },
  love_hotel: {
    label: "情趣",
    labelEn: "Love Hotel",
    color: "text-pink-700",
    bg: "bg-pink-100",
    icon: "💕",
  },
  esports_hotel: {
    label: "电竞",
    labelEn: "Esports",
    color: "text-orange-700",
    bg: "bg-orange-100",
    icon: "🎮",
  },
};

// ─── Hotel Data Interface ────────────────────────────────────────

export interface HotelData {
  id: string;
  /** 中文名称 */
  name: string;
  /** 英文名称 */
  nameEn?: string;
  /** 分类 */
  category: HotelCategory;
  /** 最低价格 (CNY/晚) */
  priceMin?: number;
  /** 最高价格 (CNY/晚) */
  priceMax?: number;
  /** 平均价格 (CNY/晚) */
  avgPrice?: number;
  /** 评分 (0-5) */
  rating?: number;
  /** 城市 */
  city: string;
  /** 城市中文 */
  cityZh?: string;
  /** 区域 */
  district?: string;
  /** 地址 */
  address?: string;
  /** 纬度 */
  lat?: number;
  /** 经度 */
  lng?: number;
  /** 电话 */
  phone?: string;
  /** 酒店图片 URL */
  imageUrl?: string;
  /** 特色标签 */
  highlights?: string[];
  /** 简介 */
  description?: string;
  /** 博主推荐 */
  bloggerName?: string;
  bloggerReason?: string;
}

// ─── Component Props ─────────────────────────────────────────────

interface HotelCardProps {
  hotel: HotelData;
  onClick?: () => void;
  compact?: boolean;
}

// ─── Helper: Build price display string ──────────────────────────

function buildPriceDisplay(hotel: HotelData): string | null {
  if (hotel.priceMin && hotel.priceMax) {
    return `¥${hotel.priceMin}-${hotel.priceMax}`;
  }
  if (hotel.avgPrice) {
    return `¥${hotel.avgPrice}`;
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────

export function HotelCard({ hotel, onClick, compact = false }: HotelCardProps) {
  const config = HOTEL_CATEGORY_CONFIG[hotel.category];
  const priceDisplay = buildPriceDisplay(hotel);

  return (
    <div
      onClick={onClick}
      className={`w-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer group" : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      {/* ── Top Image ─────────────────────────────────── */}
      {hotel.imageUrl && !compact && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Category badge overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} shadow-sm`}
            >
              {config.icon} {config.label}
            </span>
          </div>
          {/* Price badge overlay */}
          {priceDisplay && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-sm">
                {priceDisplay}
                <span className="ml-0.5 text-white/70">/晚</span>
              </span>
            </div>
          )}
          {/* Rating badge overlay */}
          {hotel.rating != null && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold bg-white/90 text-yellow-600 shadow-sm backdrop-blur-sm">
                ★ {hotel.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Content ───────────────────────────────────── */}
      <div className={compact ? "p-3" : "p-4"}>
        {/* Category badge (compact / no-image mode) */}
        {(compact || !hotel.imageUrl) && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color} ${config.bg}`}
            >
              {config.icon} {config.label}
            </span>
            {hotel.rating != null && (
              <span className="text-yellow-500 text-sm font-medium">
                ★ {hotel.rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {/* Name */}
        <h3
          className={`font-bold text-gray-900 leading-tight ${compact ? "text-base" : "text-lg"}`}
        >
          {hotel.name}
        </h3>
        {hotel.nameEn && <p className="text-sm text-gray-500 mt-0.5">{hotel.nameEn}</p>}

        {/* Price row (compact / no-image mode) */}
        {(compact || !hotel.imageUrl) && priceDisplay && (
          <div className="mt-2">
            <span className="text-lg font-bold text-orange-600">{priceDisplay}</span>
            <span className="text-xs text-gray-400 ml-1">/晚</span>
          </div>
        )}

        {/* Location */}
        {hotel.address && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-1" title={hotel.address}>
            📍 {hotel.district ? `${hotel.district} · ` : ""}
            {hotel.address}
          </p>
        )}

        {/* Highlights / Tags */}
        {hotel.highlights && hotel.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {hotel.highlights.slice(0, compact ? 3 : 5).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full border border-gray-100"
              >
                {tag}
              </span>
            ))}
            {!compact && hotel.highlights.length > 5 && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                +{hotel.highlights.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Blogger recommendation */}
        {hotel.bloggerName && !compact && (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-700">
                {hotel.bloggerName.charAt(0)}
              </span>
              <span className="text-xs font-semibold text-gray-700">{hotel.bloggerName} 推荐</span>
            </div>
            {hotel.bloggerReason && (
              <p className="text-xs text-gray-600 leading-relaxed">{hotel.bloggerReason}</p>
            )}
          </div>
        )}

        {/* ── Action Buttons ──────────────────────────── */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {/* Map / Directions */}
          {(hotel.lat || hotel.address || hotel.name) && (
            <MapDirectionsLink
              lat={hotel.lat}
              lng={hotel.lng}
              name={hotel.name}
              address={hotel.address}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors touch-manipulation"
            />
          )}

          {/* Phone */}
          {hotel.phone && (
            <a
              href={`tel:${hotel.phone.replace(/\s/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors touch-manipulation"
            >
              <span>📞</span>
              <span className="hidden sm:inline">{hotel.phone}</span>
              <span className="sm:hidden">拨打</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelCard;
