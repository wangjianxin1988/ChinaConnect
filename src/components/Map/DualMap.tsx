import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useMap } from "@/hooks/useMap";
import type { MapLayer, MapMarker } from "@/lib/map-types";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { LeafletMap } from "./LeafletMap";

export interface DualMapLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface DualMapProps {
  initialLocation?: DualMapLocation;
  markers?: MapMarker[];
  height?: string;
  showControls?: boolean;
  showLayerControls?: boolean;
  defaultLayer?: MapLayer;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

const PROVIDER_BUTTON_STYLES = `
  bg-white px-4 py-2 rounded-lg shadow-md hover:bg-slate-50
  transition-colors text-sm font-medium flex items-center gap-2
  border border-slate-200
`;

const LAYER_BUTTON_STYLES = `
  px-3 py-1.5 rounded text-xs font-medium transition-colors
  border border-slate-200
`;

const LAYER_BUTTON_ACTIVE_STYLES = "bg-blue-600 text-white border-blue-600";

const LAYER_BUTTON_INACTIVE_STYLES = "bg-white text-gray-600 hover:bg-slate-50";

export function DualMap({
  initialLocation = { lat: 39.9042, lng: 116.4074, name: "Beijing" },
  markers = [],
  height = "400px",
  showControls = true,
  showLayerControls = true,
  defaultLayer = "standard",
  onMarkerClick,
  className = "",
}: DualMapProps) {
  const { provider, toggleProvider, setViewState, viewState, isDetectingLocation } = useMap({
    initialProvider: undefined, // Let hook auto-detect
    initialCenter: { lat: initialLocation.lat, lng: initialLocation.lng },
    initialZoom: 13,
    detectLocation: true,
  });

  // IP-based geo detection for initial provider override
  const { isChina, isDetecting: isDetectingGeo, refetch: refetchGeo } = useGeoLocation();

  const [currentLayer, setCurrentLayer] = useState<MapLayer>(defaultLayer);
  const [isClient, setIsClient] = useState(false);
  const [geoDetectedProvider, setGeoDetectedProvider] = useState<"google" | "amap" | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Apply geo-based provider override after detection
  useEffect(() => {
    if (!isDetectingGeo && isChina !== null) {
      setGeoDetectedProvider(isChina ? "amap" : "google");
    }
  }, [isDetectingGeo, isChina]);

  // Ensure geo detection doesn't block the map indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while detecting both geo and location, but cap at 3 seconds
  const isMapLoading = (isDetectingLocation || isDetectingGeo) && !loadingTimedOut;

  // Ensure we only render Leaflet on client side
  // (Leaflet requires DOM access)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update center when initialLocation changes
  useEffect(() => {
    setViewState({
      center: { lat: initialLocation.lat, lng: initialLocation.lng },
    });
  }, [initialLocation.lat, initialLocation.lng, setViewState]);

  const handleLayerChange = useCallback(
    (layer: MapLayer) => {
      setCurrentLayer(layer);
      setViewState({ layer });
    },
    [setViewState],
  );

  // Get provider display info
  const providerInfo = useMemo(() => {
    if (provider === "google") {
      return {
        name: "Google Maps",
        flag: "🌍",
        switchLabel: "切换到高德地图",
        switchFlag: "🇨🇳",
      };
    }
    return {
      name: "高德地图",
      flag: "🇨🇳",
      switchLabel: "Switch to Google",
      switchFlag: "🌍",
    };
  }, [provider]);

  // Determine which provider to highlight based on geo detection
  const _effectiveProvider = geoDetectedProvider ?? provider;

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg border border-slate-200 ${className}`}
      style={{ height }}
    >
      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-white/90 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-gray-500">Detecting location and region...</p>
            {geoDetectedProvider && (
              <p className="text-xs text-blue-600 mt-1">
                Auto-selected:{" "}
                {geoDetectedProvider === "amap" ? "高德地图 (China)" : "Google Maps (Global)"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Map Container - Leaflet requires client-side rendering */}
      <div className="w-full h-full">
        {isClient ? (
          <LeafletMap
            center={{ lat: initialLocation.lat, lng: initialLocation.lng }}
            zoom={viewState.zoom}
            markers={markers}
            provider={provider}
            layer={currentLayer}
            onMarkerClick={onMarkerClick}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[500]">
          {/* Provider Switch */}
          <button
            onClick={toggleProvider}
            className={PROVIDER_BUTTON_STYLES}
            title="Switch map provider"
          >
            <span className="text-base">{providerInfo.flag}</span>
            <span className="hidden sm:inline">{providerInfo.switchLabel}</span>
          </button>

          {/* Layer Controls */}
          {showLayerControls && (
            <div className="bg-white rounded-lg shadow-md p-2 flex gap-1 border border-slate-200">
              {(["standard", "satellite", "terrain"] as MapLayer[]).map((layer) => (
                <button
                  key={layer}
                  onClick={() => handleLayerChange(layer)}
                  className={`${LAYER_BUTTON_STYLES} ${
                    currentLayer === layer
                      ? LAYER_BUTTON_ACTIVE_STYLES
                      : LAYER_BUTTON_INACTIVE_STYLES
                  }`}
                >
                  {layer === "standard" && "🗺️"}
                  {layer === "satellite" && "🛰️"}
                  {layer === "terrain" && "⛰️"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Provider Indicator - shows both the active and geo-recommended provider */}
      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium z-[500]">
        {providerInfo.name}
        {geoDetectedProvider && geoDetectedProvider !== provider && (
          <span className="ml-1 text-blue-300">
            {" "}
            (auto: {geoDetectedProvider === "amap" ? "高德" : "Google"})
          </span>
        )}
      </div>

      {/* Location Name Badge (if provided) */}
      {initialLocation.name && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full shadow-md text-sm font-medium z-[500]">
          {initialLocation.name}
        </div>
      )}

      {/* Markers Count Badge */}
      {markers.length > 0 && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full shadow-md text-xs font-medium z-[500]">
          {markers.length} location{markers.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default DualMap;
