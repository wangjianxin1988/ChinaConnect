// @ts-nocheck
import { useEffect, useRef, useState } from "react";

interface FoodMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

const TYPE_ICONS: Record<RestaurantType, string> = {
  michelin: "⭐",
  blackpearl: "💎",
  local: "🔥",
};

const TYPE_COLORS: Record<RestaurantType, string> = {
  michelin: "#1E3A5F",
  blackpearl: "#2D1B4E",
  local: "#B8383D",
};

export default function FoodMap({
  restaurants = [],
  center = [31.2304, 121.4737],
  zoom = 12,
  onRestaurantClick,
}: FoodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTypes, _setSelectedTypes] = useState<RestaurantType[]>([
    "michelin",
    "blackpearl",
    "local",
  ]);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const filtered = restaurants.filter((r) => selectedTypes.includes(r.type));

      filtered.forEach((restaurant) => {
        const label =
          restaurant.type === "michelin"
            ? `${TYPE_ICONS[restaurant.type]} ${restaurant.star}星`
            : restaurant.type === "blackpearl"
              ? `${TYPE_ICONS[restaurant.type]} ${restaurant.diamond}钻`
              : TYPE_ICONS[restaurant.type];

        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background:${TYPE_COLORS[restaurant.type]};color:white;padding:6px 10px;border-radius:16px;font-size:12px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);white-space:nowrap;display:inline-block;">${label}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([restaurant.lat, restaurant.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width:160px">
              <strong style="font-size:14px">${restaurant.name}</strong>
              ${restaurant.nameEn ? `<br/><span style="color:#888;font-size:12px">${restaurant.nameEn}</span>` : ""}
              <br/><span style="color:#f59e0b">★ ${restaurant.rating}</span>
              <span style="color:#888;font-size:12px;margin-left:8px">¥${restaurant.avgPrice}/人</span>
              ${restaurant.cuisine ? `<br/><span style="color:#666;font-size:12px">${restaurant.cuisine}</span>` : ""}
            </div>
          `)
          .on("click", () => onRestaurantClick?.(restaurant));

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [mapLoaded, restaurants, selectedTypes, onRestaurantClick]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
