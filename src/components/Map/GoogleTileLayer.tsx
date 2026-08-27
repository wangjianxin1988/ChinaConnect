// @ts-nocheck
/**
 * GoogleTileLayer - Google Maps tile layer component for Leaflet
 * Uses WGS-84 coordinate system (native for Google Maps)
 */
import type { TileLayerConfig } from "@/types/map";
import React from "react";
import { TileLayer } from "react-leaflet";

/** Global tile layer URLs for different map types.
 * 2026-08: real Google tiles are unreachable from China, so the "google"
 * (global) provider serves Esri tiles which are reachable worldwide incl. CN.
 */
const GOOGLE_TILE_URLS = {
  standard:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
} as const;

/** Global map attribution text */
const GOOGLE_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/en-us/home" target="_blank" rel="noopener noreferrer">Esri</a>, <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

/** Global map subdomains (Esri has no per-tile subdomains) */
const GOOGLE_SUBDOMAINS = "";

/** Maximum zoom level for Google Maps */
const GOOGLE_MAX_ZOOM = 20;

/** Minimum zoom level for Google Maps */
const GOOGLE_MIN_ZOOM = 3;

export interface GoogleTileLayerProps {
  layer?: "standard" | "satellite" | "terrain";
  className?: string;
}

/**
 * GoogleTileLayer - Leaflet TileLayer for Google Maps tiles
 *
 * @example
 * ```tsx
 * <MapContainer center={[39.9042, 116.4074]} zoom={13}>
 *   <GoogleTileLayer layer="standard" />
 *   {/* markers... *\/}
 * </MapContainer>
 * ```
 */
export function GoogleTileLayer({ layer = "standard", className }: GoogleTileLayerProps) {
  const tileUrl = GOOGLE_TILE_URLS[layer];

  return (
    <TileLayer
      url={tileUrl}
      subdomains={GOOGLE_SUBDOMAINS}
      attribution={GOOGLE_ATTRIBUTION}
      maxZoom={GOOGLE_MAX_ZOOM}
      minZoom={GOOGLE_MIN_ZOOM}
      className={className}
    />
  );
}

/**
 * Get Google Maps tile layer configuration
 */
export function getGoogleTileConfig(layer: "standard" | "satellite" | "terrain"): TileLayerConfig {
  return {
    url: GOOGLE_TILE_URLS[layer],
    attribution: GOOGLE_ATTRIBUTION,
    subdomains: GOOGLE_SUBDOMAINS,
    maxZoom: GOOGLE_MAX_ZOOM,
    minZoom: GOOGLE_MIN_ZOOM,
  };
}

/**
 * Get all available Google Maps layer URLs
 */
export function getGoogleLayerUrls(): Record<string, string> {
  return { ...GOOGLE_TILE_URLS };
}

export default GoogleTileLayer;
