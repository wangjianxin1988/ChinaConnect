import { wgs84ToGcj02 } from "@/lib/coordinates";
import type { MapLayer, MapMarker, MapProvider } from "@/lib/map-types";
import L from "leaflet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue with webpack/vite
(L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon factory
function createMarkerIcon(type: MapMarker["type"]): L.DivIcon {
  const config = {
    attraction: { bg: "#f59e0b", icon: "🏛️" },
    restaurant: { bg: "#ef4444", icon: "🍜" },
    hotel: { bg: "#8b5cf6", icon: "🏨" },
    emergency: { bg: "#dc2626", icon: "🚨" },
    transport: { bg: "#10b981", icon: "🚇" },
  };

  const { bg, icon } = config[type] || config.attraction;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${bg};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          line-height: 1;
        ">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

// Component to handle map center updates
function MapCenterUpdater({
  center,
  zoom,
}: {
  center: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

// Component to force map resize after mount (fixes client:visible initialization issues)
function MapResizer() {
  const map = useMap();

  useEffect(() => {
    // Invalidate size after a short delay to ensure container dimensions are settled
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Tile layer URLs for different providers and layers.
// 2026-08: OSM/Google/Carto tile hosts are unreachable from China (000),
// so the global provider uses Esri (reachable worldwide incl. CN) and the
// China provider uses real Amap tiles (reachable in CN).
const TILE_LAYERS = {
  google: {
    standard:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  },
  amap: {
    standard: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    satellite: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    terrain: "https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  },
};

// Attribution text
const ATTRIBUTIONS = {
  google:
    '&copy; <a href="https://www.esri.com/en-us/home" target="_blank" rel="noopener noreferrer">Esri</a>, <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  amap: '&copy; <a href="https://www.amap.com/" target="_blank" rel="noopener noreferrer">高德地图</a>',
};

interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  provider: MapProvider;
  layer?: MapLayer;
  showControls?: boolean;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  /** Called when the current tile source fails repeatedly (auto provider fallback). */
  onTileError?: () => void;
}

export function LeafletMap({
  center,
  zoom = 13,
  markers = [],
  provider,
  layer = "standard",
  className = "",
  onMarkerClick,
  onTileError,
}: LeafletMapProps) {
  // Watch for repeated tile failures (e.g. a provider that is unreachable
  // over the user's network/IPv6) and let the parent fall back to the other
  // provider so the base map always renders.
  const tileErrorCount = useRef(0);
  const tileErrorReported = useRef(false);
  const handleTileError = useCallback(() => {
    if (tileErrorReported.current || !onTileError) return;
    tileErrorCount.current += 1;
    if (tileErrorCount.current >= 8) {
      tileErrorReported.current = true;
      onTileError();
    }
  }, [onTileError]);

  // Convert center coordinates for the provider
  const mapCenter = useMemo(() => {
    if (provider === "google") {
      return center;
    }
    return wgs84ToGcj02(center.lat, center.lng);
  }, [center, provider]);

  // Get tile layer URL
  const tileUrl = TILE_LAYERS[provider][layer];
  const attribution = ATTRIBUTIONS[provider];

  return (
    <div className={`leaflet-map-container h-full ${className}`}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={provider}
          url={tileUrl}
          attribution={attribution}
          subdomains={provider === "amap" ? "1234" : "abc"}
          maxZoom={19}
          eventHandlers={{ tileerror: handleTileError }}
        />

        {/* Center updater */}
        <MapCenterUpdater center={mapCenter} zoom={zoom} />

        {/* Resize handler for client:visible initialization */}
        <MapResizer />

        {/* Markers */}
        {markers.map((marker) => {
          const markerCoords =
            provider === "google"
              ? marker.coordinates
              : wgs84ToGcj02(marker.coordinates.lat, marker.coordinates.lng);

          return (
            <Marker
              key={marker.id}
              position={[markerCoords.lat, markerCoords.lng]}
              icon={createMarkerIcon(marker.type)}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-base">{marker.nameEn}</h3>
                  {marker.name !== marker.nameEn && (
                    <p className="text-sm text-gray-500">{marker.name}</p>
                  )}
                  {marker.description && (
                    <p className="text-sm text-gray-600 mt-2">{marker.description}</p>
                  )}
                  {marker.address && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Address:</span> {marker.address}
                    </p>
                  )}
                  {marker.phone && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Phone:</span>{" "}
                      <a href={`tel:${marker.phone}`} className="text-blue-600 hover:underline">
                        {marker.phone}
                      </a>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {marker.rating && (
                      <span className="text-sm text-yellow-500">★ {marker.rating}</span>
                    )}
                    {marker.priceRange && (
                      <span className="text-sm text-gray-500">{marker.priceRange}</span>
                    )}
                    {marker.category && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">
                        {marker.category}
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default LeafletMap;
