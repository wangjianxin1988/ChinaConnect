import React from "react";
import { MapDirectionsLink } from "@/components/ui/MapDirectionsLink";

export interface AttractionData {
  id: string;
  name: string;
  nameEn: string;
  category: "historical" | "cultural" | "natural" | "modern";
  description: string;
  image?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  openingHours: string;
  ticketPrice: string;
  recommendedVisitTime?: string;
  highlights?: string[];
  tips?: string;
}

interface AttractionCardProps {
  attraction: AttractionData;
  index?: number;
  onSelectMapMarker?: (coords: { lat: number; lng: number }) => void;
}

const CATEGORY_STYLES: Record<AttractionData["category"], { label: string; className: string }> = {
  historical: { label: "Historical", className: "bg-amber-100 text-amber-700 border-amber-200" },
  cultural: { label: "Cultural", className: "bg-purple-100 text-purple-700 border-purple-200" },
  natural: { label: "Natural", className: "bg-green-100 text-green-700 border-green-200" },
  modern: { label: "Modern", className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const DEFAULT_CATEGORY_STYLE = {
  label: "Other",
  className: "bg-gray-100 text-gray-700 border-gray-200",
};

export function AttractionCard({ attraction, index, onSelectMapMarker }: AttractionCardProps) {
  const catStyle = CATEGORY_STYLES[attraction.category] || DEFAULT_CATEGORY_STYLE;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden card-hover">
      {/* Image */}
      {attraction.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={attraction.image}
            alt={attraction.nameEn}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {typeof index === "number" && (
            <div className="absolute top-3 left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
              {index + 1}
            </div>
          )}
        </div>
      )}

      <div className="flex">
        {!attraction.image && typeof index === "number" && (
          <div className="hidden md:flex flex-col items-center justify-center w-14 bg-blue-600 text-white shrink-0">
            <span className="text-2xl font-black leading-none">{index + 1}</span>
          </div>
        )}

        <div className="p-5 flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {attraction.nameEn}
                </h3>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${catStyle.className}`}
                >
                  {catStyle.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{attraction.name}</p>
            </div>

            {attraction.coordinates && (
              <button
                onClick={() => onSelectMapMarker?.(attraction.coordinates!)}
                className="shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Show on map"
                aria-label={`Show ${attraction.nameEn} on map`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{attraction.description}</p>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 text-base">⏰</span>
              <span className="text-gray-600">{attraction.openingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 text-base">🎫</span>
              <span className="text-gray-600 font-medium">
                {(() => {
                  const tp = attraction.ticketPrice;
                  if (!tp) return tp;
                  // Already has ¥ symbol (either prefix or suffix)
                  if (tp.includes("¥")) return tp;
                  // Free or text descriptions
                  if (/^(free|included|varies|免费)/i.test(tp)) return tp;
                  // Add ¥ prefix
                  return `¥${tp}`;
                })()}
              </span>
            </div>
            {attraction.recommendedVisitTime && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 text-base">⏱</span>
                <span className="text-gray-600">{attraction.recommendedVisitTime}</span>
              </div>
            )}
          </div>

          {/* Highlights */}
          {attraction.highlights && attraction.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {attraction.highlights.slice(0, 4).map((h, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs">
                  {h}
                </span>
              ))}
            </div>
          )}

          {/* Tips */}
          {attraction.tips && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <span className="text-amber-500 text-base shrink-0 mt-0.5">💡</span>
              <p className="text-amber-800 text-sm leading-relaxed">{attraction.tips}</p>
            </div>
          )}

          {/* Address + directions */}
          {attraction.address && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 truncate flex-1 mr-2" title={attraction.address}>
                📍 {attraction.address}
              </p>
              {attraction.coordinates && (
                <MapDirectionsLink
                  lat={attraction.coordinates.lat}
                  lng={attraction.coordinates.lng}
                  name={attraction.nameEn}
                  className="shrink-0 text-blue-600 hover:text-blue-700 text-xs font-medium hover:underline"
                >
                  Get Directions →
                </MapDirectionsLink>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttractionCard;
