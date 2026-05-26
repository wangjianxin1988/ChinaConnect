import type { Location } from "@/data/cities/types";
import React, { useState, useEffect } from "react";

interface CityMapProps {
  center: Location;
  markers?: Location[];
  height?: string;
  title?: string;
}

type MapProvider = "google" | "amap";

export function CityMap({ center, markers = [], height = "350px", title }: CityMapProps) {
  const [provider, setProvider] = useState<MapProvider>("google");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        if (data.country_code === "CN") {
          setProvider("amap");
        }
      } catch {
        // fallback to google
      } finally {
        setIsLoading(false);
      }
    };
    detectCountry();
  }, []);

  const toggleProvider = () => {
    setProvider((p) => (p === "google" ? "amap" : "google"));
  };

  // Build Google Maps embed URL
  const googleUrl = (() => {
    const base = "https://maps.google.com/maps";
    const params = new URLSearchParams({
      output: "embed",
      center: `${center.lat},${center.lng}`,
      zoom: "13",
      size: "1000x600",
    });
    markers.forEach((m) => {
      params.append("markers", `${m.lat},${m.lng}${m.name ? `|${m.name}` : ""}`);
    });
    return `${base}?${params.toString()}`;
  })();

  // Build Amap URL
  const amapEmbedUrl = (() => {
    const markerParts = markers
      .map((m) => `name:${m.name || ""},lng:${m.lng},lat:${m.lat}`)
      .join("|");
    const q = new URLSearchParams({
      position: `${center.lng},${center.lat}`,
      zoom: "13",
      src: "chinaconnect",
      coordinate: "gcj02",
      size: "500*350",
      ...(markerParts ? { markers: markerParts } : {}),
    });
    return `https://uri.amap.com/marker?${q.toString()}`;
  })();

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height }}
    >
      {provider === "google" ? (
        <iframe
          src={googleUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          title={title || "City Map"}
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <iframe
          src={amapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          title={title || "City Map (高德地图)"}
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

      {/* Provider toggle */}
      <button
        onClick={toggleProvider}
        className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-white/95 hover:bg-white text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md transition-all backdrop-blur-sm"
        aria-label={
          provider === "google" ? "Switch to China Map (高德地图)" : "Switch to Google Maps"
        }
      >
        <span>{provider === "google" ? "🇨🇳" : "🌍"}</span>
        <span>{provider === "google" ? "高德地图" : "Google Maps"}</span>
      </button>

      {/* Provider badge */}
      <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
        {provider === "google" ? "Google Maps" : "高德地图"}
      </div>
    </div>
  );
}

export default CityMap;
