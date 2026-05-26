import type { MapMarker } from "@/lib/map-types";
import React, { useState, useEffect } from "react";
import type { DualMapLocation } from "./DualMap";

// Client-only wrapper for Leaflet maps
// Leaflet requires browser APIs (window, document) which don't exist during SSR
interface ClientOnlyMapProps {
  initialLocation: DualMapLocation;
  markers?: MapMarker[];
  height?: string;
  showControls?: boolean;
  showLayerControls?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

export function ClientOnlyMap(props: ClientOnlyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`w-full bg-slate-100 flex items-center justify-center animate-pulse ${props.className || ""}`}
        style={{ height: props.height || "400px" }}
      >
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">🗺️</div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // Dynamic import to avoid SSR issues with Leaflet
  const { DualMap } = require("./DualMap");
  return <DualMap {...props} />;
}

export default ClientOnlyMap;
