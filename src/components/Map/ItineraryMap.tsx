/**
 * ItineraryMap Component
 * Displays an Amap (高德地图) with markers and routes for an itinerary.
 *
 * Features:
 * - Numbered markers for each day's locations
 * - Polylines connecting markers
 * - Info windows showing location details
 * - Auto-fit viewport
 */

import React, { useEffect, useRef, useState, useCallback } from "react";

// ============================================
// Types
// ============================================

interface ItineraryLocation {
  name: string;
  nameZh?: string;
  lat: number;
  lng: number;
  day: number;
  order: number;
  time?: string;
  activity?: string;
  cost?: string;
}

interface ItineraryMapProps {
  locations: ItineraryLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
}

// ============================================
// Amap Loader
// ============================================

let amapLoadPromise: Promise<void> | null = null;

function loadAmapAPI(): Promise<void> {
  if (amapLoadPromise) return amapLoadPromise;

  amapLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).AMap) {
      resolve();
      return;
    }

    // Get API key — hardcoded as fallback (Vite tree-shakes import.meta.env with optional chaining)
    const key = import.meta.env.PUBLIC_AMAP_KEY || "013d6b96800d73eeb66dcbf3dd3b068a";
    if (!key) {
      reject(new Error("PUBLIC_AMAP_KEY not configured. Get a key at https://console.amap.com/dev/key/app"));
      return;
    }

    // Load script
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Amap API"));
    document.head.appendChild(script);
  });

  return amapLoadPromise;
}

// ============================================
// Coordinate conversion (WGS-84 to GCJ-02)
// ============================================

const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function outOfChina(lat: number, lng: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320.0 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

function wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  if (outOfChina(lat, lng)) {
    return { lat, lng };
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
  dLng = (dLng * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);

  return {
    lat: lat + dLat,
    lng: lng + dLng,
  };
}

// ============================================
// Day colors
// ============================================

const DAY_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

function getDayColor(day: number): string {
  return DAY_COLORS[(day - 1) % DAY_COLORS.length];
}

// ============================================
// ItineraryMap Component
// ============================================

const ItineraryMap: React.FC<ItineraryMapProps> = ({
  locations,
  center,
  zoom = 12,
  height = "400px",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      await loadAmapAPI();

      const AMap = (window as unknown as Record<string, unknown>).AMap as {
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
        InfoWindow: new (options: Record<string, unknown>) => { open: (map: unknown, position: unknown) => void };
        Polyline: new (options: Record<string, unknown>) => unknown;
        Pixel: new (x: number, y: number) => unknown;
      };

      if (!AMap) {
        throw new Error("Amap API not loaded");
      }

      // Determine center
      let mapCenter: { lat: number; lng: number };
      if (center) {
        mapCenter = wgs84ToGcj02(center.lat, center.lng);
      } else if (locations.length > 0) {
        const firstLoc = locations[0];
        mapCenter = wgs84ToGcj02(firstLoc.lat, firstLoc.lng);
      } else {
        mapCenter = { lat: 39.9042, lng: 116.4074 }; // Beijing
      }

      // Create map
      const map = new AMap.Map(mapRef.current, {
        viewMode: "2D",
        zoom,
        center: [mapCenter.lng, mapCenter.lat],
        resizeEnable: true,
      });

      mapInstanceRef.current = map;

      // Group locations by day
      const dayGroups = new Map<number, ItineraryLocation[]>();
      for (const loc of locations) {
        const day = loc.day || 1;
        if (!dayGroups.has(day)) {
          dayGroups.set(day, []);
        }
        dayGroups.get(day)!.push(loc);
      }

      // Add markers and polylines for each day
      const allPoints: { lat: number; lng: number }[] = [];

      for (const [day, dayLocs] of dayGroups) {
        const color = getDayColor(day);
        const dayPoints: { lat: number; lng: number }[] = [];

        // Sort by order
        dayLocs.sort((a, b) => a.order - b.order);

        for (let i = 0; i < dayLocs.length; i++) {
          const loc = dayLocs[i];
          const gcj = wgs84ToGcj02(loc.lat, loc.lng);
          dayPoints.push(gcj);
          allPoints.push(gcj);

          // Create marker
          const markerContent = `
            <div style="
              width: 28px; height: 28px; border-radius: 50%;
              background: ${color}; color: white;
              display: flex; align-items: center; justify-content: center;
              font-size: 12px; font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">${day}-${i + 1}</div>
          `;

          const marker = new AMap.Marker({
            position: [gcj.lng, gcj.lat],
            content: markerContent,
            offset: new AMap.Pixel(-14, -14),
          });

          // Add click listener for info window
          const infoContent = `
            <div style="padding: 8px; min-width: 200px;">
              <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">
                Day ${day} - Stop ${i + 1}
              </div>
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
                ${loc.name}
              </div>
              ${loc.nameZh ? `<div style="font-size: 12px; color: #666; margin-bottom: 4px;">${loc.nameZh}</div>` : ""}
              ${loc.time ? `<div style="font-size: 12px; color: #888;">🕐 ${loc.time}</div>` : ""}
              ${loc.activity ? `<div style="font-size: 12px; color: #888;">🎯 ${loc.activity}</div>` : ""}
              ${loc.cost ? `<div style="font-size: 12px; color: #888;">💰 ${loc.cost}</div>` : ""}
            </div>
          `;

          // Use a closure to capture the correct values
          ((m: unknown, content: string) => {
            (m as { on: (event: string, handler: () => void) => void }).on("click", () => {
              const infoWindow = new AMap.InfoWindow({
                content,
                offset: new AMap.Pixel(0, -30),
              });
              (infoWindow as { open: (map: unknown, position: unknown) => void }).open(
                map,
                (m as { getPosition: () => { getLng: () => number; getLat: () => number } }).getPosition()
              );
            });
          })(marker, infoContent);

          (map as { add: (overlay: unknown) => void }).add(marker);
        }

        // Draw polyline for this day
        if (dayPoints.length > 1) {
          const polyline = new AMap.Polyline({
            path: dayPoints.map((p) => [p.lng, p.lat]),
            strokeColor: color,
            strokeWeight: 3,
            strokeOpacity: 0.7,
            lineJoin: "round",
            lineCap: "round",
          });
          (map as { add: (overlay: unknown) => void }).add(polyline);
        }
      }

      // Auto-fit viewport
      if (allPoints.length > 1) {
        const bounds = allPoints.reduce(
          (bounds, p) => {
            return {
              minLat: Math.min(bounds.minLat, p.lat),
              maxLat: Math.max(bounds.maxLat, p.lat),
              minLng: Math.min(bounds.minLng, p.lng),
              maxLng: Math.max(bounds.maxLng, p.lng),
            };
          },
          { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity }
        );

        (map as { setFitView: (overlays?: unknown, immediately?: boolean, margin?: number[]) => void }).setFitView(undefined, false, [50, 50, 50, 50]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load map");
    } finally {
      setIsLoading(false);
    }
  }, [locations, center, zoom]);

  useEffect(() => {
    initMap();

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        try {
          (mapInstanceRef.current as { destroy: () => void }).destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [initMap]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
          style={{ height }}
        >
          <div className="text-center p-4">
            <p className="text-red-500 text-sm mb-2">⚠️ {error}</p>
            <button
              onClick={initMap}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className={`rounded-lg ${error ? "hidden" : ""}`}
      />
    </div>
  );
};

export default ItineraryMap;
