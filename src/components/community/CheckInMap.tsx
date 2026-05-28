/**
 * Check-In Map Component for ChinaConnect
 * Shows user check-ins on a map
 */

import type { CheckInMarker, MockCheckIn } from "@/data/community/mockData";
import { useEffect, useState } from "react";

// Map component using Leaflet
// Since we're using Astro, we need to handle SSR properly
interface CheckInMapProps {
  markers?: CheckInMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: CheckInMarker) => void;
  className?: string;
}

// Mock map view component (will be enhanced with Leaflet in client)
export function CheckInMap({
  markers = [],
  center = [31.2304, 121.4737], // Shanghai
  zoom = 5,
  height = "400px",
  onMarkerClick,
  className = "",
}: CheckInMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<CheckInMarker | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = (marker: CheckInMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Map Background - China centered */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden"
        style={{ minHeight: height }}
      >
        {/* Grid pattern for visual effect */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-gray-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Simple China outline approximation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
          <path
            d="M150,180 Q200,150 280,160 Q350,140 400,150 Q480,130 550,140 Q620,120 680,130 Q720,140 740,160 Q750,180 740,200 Q720,220 700,230 Q680,250 650,260 Q620,280 580,290 Q540,310 500,320 Q460,340 420,350 Q380,370 340,380 Q300,400 260,410 Q220,420 180,400 Q140,380 120,350 Q100,320 110,290 Q120,260 140,240 Q130,210 150,180 Z"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
          />
        </svg>

        {/* Markers */}
        {markers.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            isSelected={selectedMarker?.id === marker.id}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}
      </div>

      {/* Selected Marker Info Card */}
      {selectedMarker && (
        <MarkerInfoCard marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <div className="text-xs font-medium mb-2">Check-in Locations</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-300">User check-in</span>
        </div>
      </div>
    </div>
  );
}

// Individual marker component
function MapMarker({
  marker,
  isSelected,
  onClick,
}: {
  marker: CheckInMarker;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Calculate position based on lat/lng (rough approximation for display)
  // This maps China's lat/lng range to the visible area
  const x = ((marker.lng - 73) / 62) * 100; // 73-135 longitude
  const y = ((49 - marker.lat) / 36) * 100; // 18-49 latitude

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
        isSelected ? "z-20 scale-125" : "z-10 hover:scale-110 hover:z-15"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      title={`${marker.place_name} - ${marker.city}`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
          isSelected ? "bg-red-500" : "bg-blue-500"
        }`}
      >
        📍
      </div>
      {isSelected && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45" />
      )}
    </button>
  );
}

// Info card for selected marker
function MarkerInfoCard({
  marker,
  onClose,
}: {
  marker: CheckInMarker;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs animate-in fade-in slide-in-from-top-4 duration-200">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        {marker.user_avatar ? (
          <img src={marker.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            ?
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{marker.place_name}</div>
          <div className="text-xs text-gray-500 mb-2">📍 {marker.city}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            by <span className="font-medium">{marker.user_name}</span>
          </div>
        </div>
      </div>

      {marker.note && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-3">
          "{marker.note}"
        </p>
      )}

      {marker.rating && (
        <div className="mt-3 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < marker.rating ? "text-yellow-500" : "text-gray-300"}`}
            >
              ★
            </span>
          ))}
        </div>
      )}

      <a
        href={`/user/${marker.user_id}`}
        className="mt-3 block text-xs text-blue-600 hover:underline"
      >
        View user profile →
      </a>
    </div>
  );
}

// Check-in Stats Summary
interface CheckInStatsSummaryProps {
  checkIns: MockCheckIn[];
  markers?: CheckInMarker[];
  className?: string;
}

export function CheckInStatsSummary({
  checkIns,
  markers = [],
  className = "",
}: CheckInStatsSummaryProps) {
  const cities = new Set(checkIns.map((c) => c.city));
  const places = new Set(checkIns.map((c) => c.place_name));

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <StatBox value={checkIns.length} label="Total Check-ins" icon="📍" />
      <StatBox value={cities.size} label="Cities" icon="🏙️" />
      <StatBox value={places.size} label="Places" icon="📍" />
    </div>
  );
}

function StatBox({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default CheckInMap;
