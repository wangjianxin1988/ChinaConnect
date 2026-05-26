import type { MapMarker } from "@/lib/map-types";
/**
 * Dynamic map loader - solves SSR issues with Leaflet
 * Leaflet requires browser APIs (window, document) which don't exist during SSR
 */
import React, { useState, useEffect } from "react";

interface DynamicMapProps {
  initialLocation: { lat: number; lng: number; name?: string };
  markers?: MapMarker[];
  height?: string;
  showControls?: boolean;
  showLayerControls?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

// Loading skeleton component
function MapSkeleton({ height }: { height?: string }) {
  return (
    <div
      className="w-full bg-slate-100 flex items-center justify-center animate-pulse"
      style={{ height: height || "400px" }}
    >
      <div className="text-center">
        <div className="text-gray-300 text-5xl mb-3">🗺️</div>
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    </div>
  );
}

// The actual map component (only loaded client-side via dynamic import)
export function DynamicMap(props: DynamicMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<DynamicMapProps> | null>(
    null,
  );

  useEffect(() => {
    // Mark as mounted first
    setIsMounted(true);

    // Dynamically import the DualMap component to avoid SSR issues
    import("./DualMap").then((module) => {
      setMapComponent(() => module.DualMap);
    });
  }, []);

  // Show skeleton during SSR and while loading the map component
  if (!isMounted || !MapComponent) {
    return <MapSkeleton height={props.height} />;
  }

  return <MapComponent {...props} />;
}

export default DynamicMap;
