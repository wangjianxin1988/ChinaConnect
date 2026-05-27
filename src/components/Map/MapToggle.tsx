/**
 * MapToggle - UI control for switching between Google Maps and Amap (Gaode)
 * Part of the ChinaConnect dual map engine
 */
import type { MapProvider, ProviderDisplayInfo } from "@/types/map";
import React from "react";

/** Provider display information */
const PROVIDER_INFO: Record<MapProvider, ProviderDisplayInfo> = {
  google: {
    name: "Google Maps",
    nativeName: "Google 地图",
    flag: "🌍",
    switchLabel: "切换到高德地图",
    switchFlag: "🇨🇳",
  },
  amap: {
    name: "高德地图",
    nativeName: "Amap (Gaode)",
    flag: "🇨🇳",
    switchLabel: "Switch to Google Maps",
    switchFlag: "🌍",
  },
};

export interface MapToggleProps {
  /** Current map provider */
  provider: MapProvider;
  /** Callback when user clicks toggle */
  onToggle: () => void;
  /** Show compact mode (icon only) */
  compact?: boolean;
  /** Additional CSS class */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * MapToggle - Button component to switch between map providers
 *
 * @example
 * ```tsx
 * <MapToggle
 *   provider="google"
 *   onToggle={() => setProvider(p => p === 'google' ? 'amap' : 'google')}
 * />
 *
 * // Compact mode for toolbar
 * <MapToggle provider="amap" onToggle={handleToggle} compact />
 * ```
 */
export function MapToggle({
  provider,
  onToggle,
  compact = false,
  className = "",
  ariaLabel,
}: MapToggleProps) {
  const info = PROVIDER_INFO[provider];
  const switchInfo = PROVIDER_INFO[provider === "google" ? "amap" : "google"];

  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          bg-white/95 hover:bg-white
          shadow-lg border border-gray-200
          transition-all duration-200
          hover:scale-105 active:scale-95
          ${className}
        `}
        title={`${info.name} - Click to switch to ${switchInfo.name}`}
        aria-label={ariaLabel || `Switch from ${info.name} to ${switchInfo.name}`}
      >
        <span className="text-lg" role="img" aria-hidden="true">
          {switchInfo.flag}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        flex items-center gap-2
        px-4 py-2 rounded-xl
        bg-white/95 hover:bg-white
        shadow-lg border border-gray-200
        transition-all duration-200
        hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        text-sm font-medium text-gray-700
        ${className}
      `}
      title={`Current: ${info.name} - Click to switch to ${switchInfo.name}`}
      aria-label={ariaLabel || `Switch from ${info.name} to ${switchInfo.name}`}
    >
      <span className="text-base" role="img" aria-hidden="true">
        {switchInfo.flag}
      </span>
      <span className="hidden sm:inline">{switchInfo.switchLabel}</span>
      <span className="sm:hidden">{switchInfo.flag}</span>
    </button>
  );
}

/**
 * MapToggleBadge - Small badge showing current provider
 */
export interface MapToggleBadgeProps {
  provider: MapProvider;
  className?: string;
}

export function MapToggleBadge({ provider, className = "" }: MapToggleBadgeProps) {
  const info = PROVIDER_INFO[provider];

  return (
    <output
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        bg-black/70 text-white text-xs font-medium
        backdrop-blur-sm
        ${className}
      `}
      aria-live="polite"
      aria-label={`Current map provider: ${info.name}`}
    >
      <span role="img" aria-hidden="true">
        {info.flag}
      </span>
      <span>{info.name}</span>
    </output>
  );
}

/**
 * MapToggleGroup - Full toggle with provider info and badge
 */
export interface MapToggleGroupProps {
  provider: MapProvider;
  onToggle: () => void;
  isDetecting?: boolean;
  showLayerControls?: boolean;
  currentLayer?: "standard" | "satellite" | "terrain";
  onLayerChange?: (layer: "standard" | "satellite" | "terrain") => void;
  className?: string;
}

const LAYER_BUTTON_BASE =
  "px-2.5 py-1 rounded text-xs font-medium transition-colors border border-gray-200";

const LAYER_BUTTON_ACTIVE = "bg-blue-600 text-white border-blue-600";

const LAYER_BUTTON_INACTIVE = "bg-white text-gray-600 hover:bg-gray-50";

export function MapToggleGroup({
  provider,
  onToggle,
  isDetecting = false,
  showLayerControls = true,
  currentLayer = "standard",
  onLayerChange,
  className = "",
}: MapToggleGroupProps) {
  const _info = PROVIDER_INFO[provider];

  const layers: Array<{ key: "standard" | "satellite" | "terrain"; icon: string }> = [
    { key: "standard", icon: "🗺️" },
    { key: "satellite", icon: "🛰️" },
    { key: "terrain", icon: "⛰️" },
  ];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Provider toggle row */}
      <div className="flex items-center gap-2">
        <MapToggle provider={provider} onToggle={onToggle} />

        {isDetecting && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>Detecting...</span>
          </div>
        )}

        <MapToggleBadge provider={provider} />
      </div>

      {/* Layer controls */}
      {showLayerControls && onLayerChange && (
        <div className="flex gap-1 bg-white/90 rounded-lg p-1.5 shadow-md border border-gray-200 backdrop-blur-sm">
          {layers.map(({ key, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onLayerChange(key)}
              className={`
                ${LAYER_BUTTON_BASE}
                ${currentLayer === key ? LAYER_BUTTON_ACTIVE : LAYER_BUTTON_INACTIVE}
              `}
              aria-pressed={currentLayer === key}
              aria-label={`Switch to ${key} layer`}
            >
              <span role="img" aria-hidden="true">
                {icon}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MapToggle;
