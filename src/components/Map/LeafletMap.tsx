import { wgs84ToGcj02 } from "@/lib/coordinates";
import type { MapLayer, MapMarker, MapProvider } from "@/lib/map-types";
import L from "leaflet";
import React, { useEffect, useMemo } from "react";
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

// Tile layer URLs for different providers and layers
const TILE_LAYERS = {
  google: {
    standard: "https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}",
    satellite: "https://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}",
    terrain: "https://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}",
  },
  amap: {
    standard: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    satellite: "https://webst0{s}.is.autonavi.com/appmaptile?style=3&x={x}&y={y}&z={z}",
    // Amap doesn't have a direct terrain layer, use standard as fallback
    terrain: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  },
};

// Attribution text
const ATTRIBUTIONS = {
  google: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
  amap: '&copy; <a href="https://www.amap.com/">高德地图</a>',
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
}

export function LeafletMap({
  center,
  zoom = 13,
  markers = [],
  provider,
  layer = "standard",
  className = "",
  onMarkerClick,
}: LeafletMapProps) {
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
    <div className={`leaflet-map-container ${className}`}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={tileUrl}
          subdomains={provider === "google" ? "1234" : "1234"}
          attribution={attribution}
          maxZoom={19}
        />

        {/* Center updater */}
        <MapCenterUpdater center={mapCenter} zoom={zoom} />

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
