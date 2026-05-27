/**
 * useMapProvider - IP-based map provider auto-detection hook
 * Uses Cloudflare CF-IPCountry header when available, with fallback to ipapi.co
 *
 * Cloudflare passes the visitor's country code via CF-IPCountry header when
 * the zone has Cloudflare's IP Geolocation feature enabled.
 *
 * This hook automatically selects:
 * - "amap" for China (CN) visitors
 * - "google" for all other countries
 */
import type { CountryDetection, MapProvider, UseMapProviderReturn } from "@/types/map";
import { useCallback, useEffect, useRef, useState } from "react";

/** Cloudflare CF-IPCountry header name (documented but detection uses meta tag approach) */
const _CF_IP_COUNTRY_HEADER = "CF-IPCountry";

/** Fallback IP geolocation API (ipapi.co) */
const IPAPI_URL = "https://ipapi.co/json/";

/** localStorage key for caching provider preference */
const PROVIDER_STORAGE_KEY = "chinaconnect-map-provider";

/** Country detection cache TTL (30 minutes) */
const CACHE_TTL_MS = 30 * 60 * 1000;

interface CachedDetection extends CountryDetection {
  cachedAt: number;
}

/**
 * Check if cached detection is still valid
 */
function isCacheValid(cached: CachedDetection): boolean {
  return Date.now() - cached.cachedAt < CACHE_TTL_MS;
}

/**
 * Get cached country detection from localStorage
 */
function getCachedDetection(): CachedDetection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("chinaconnect-country-detection");
    if (!raw) return null;
    const cached: CachedDetection = JSON.parse(raw);
    return isCacheValid(cached) ? cached : null;
  } catch {
    return null;
  }
}

/**
 * Save country detection to localStorage cache
 */
function saveDetectionToCache(detection: CountryDetection): void {
  if (typeof window === "undefined") return;
  try {
    const toCache: CachedDetection = { ...detection, cachedAt: Date.now() };
    localStorage.setItem("chinaconnect-country-detection", JSON.stringify(toCache));
  } catch {
    // Storage full or unavailable - ignore
  }
}

/**
 * Detect country from Cloudflare header (if available)
 * Returns null if Cloudflare header is not present
 */
function getCountryFromCloudflare(): string | null {
  if (typeof document === "undefined") return null;

  // Cloudflare passes country code via HTTP header
  const cfCountry = document.head
    .querySelector('meta[name="geo.country"]')
    ?.getAttribute("content");

  if (cfCountry) return cfCountry.toUpperCase();

  // Alternative: check headers if accessible via server-side rendering
  // For client-side, we can check the navigator object for CF data
  // @ts-expect-error - Cloudflare injects this
  const cfIpCountry = window.CF_IP_COUNTRY;
  if (cfIpCountry) return cfIpCountry.toUpperCase();

  return null;
}

/**
 * Detect country using ipapi.co fallback service
 */
async function detectCountryFromAPI(): Promise<CountryDetection> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(IPAPI_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const countryCode = (data.country_code || data.country || "US").toUpperCase();

    return {
      countryCode,
      countryName: data.country_name || "Unknown",
      isChina: countryCode === "CN",
      source: "ipapi",
    };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Detection timeout");
    }
    throw error;
  }
}

/**
 * Hook for automatic map provider selection based on user's geographic location
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { provider, toggleProvider, isDetecting } = useMapProvider();
 *
 *   return (
 *     <div>
 *       <p>Using: {provider === 'amap' ? '高德地图' : 'Google Maps'}</p>
 *       <button onClick={toggleProvider}>Switch</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMapProvider(): UseMapProviderReturn {
  const [provider, setProviderState] = useState<MapProvider>("google");
  const [isDetecting, setIsDetecting] = useState(true);
  const [countryDetection, setCountryDetection] = useState<CountryDetection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /** Get initial provider from localStorage or default */
  const getInitialProvider = useCallback((): MapProvider => {
    if (typeof window === "undefined") return "google";

    try {
      const saved = localStorage.getItem(PROVIDER_STORAGE_KEY);
      if (saved === "google" || saved === "amap") {
        return saved;
      }
    } catch {
      // localStorage unavailable
    }
    return "google";
  }, []);

  /** Persist provider choice to localStorage */
  const persistProvider = useCallback((p: MapProvider) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PROVIDER_STORAGE_KEY, p);
    } catch {
      // Storage full or unavailable
    }
  }, []);

  /** Main detection logic */
  const detectCountry = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsDetecting(true);
    setError(null);

    // 1. Check cache first
    const cached = getCachedDetection();
    if (cached) {
      setCountryDetection(cached);
      const detectedProvider: MapProvider = cached.isChina ? "amap" : "google";
      setProviderState(detectedProvider);
      setIsDetecting(false);
      return;
    }

    // 2. Try Cloudflare CF-IPCountry header first (fastest, no external call)
    const cfCountry = getCountryFromCloudflare();
    if (cfCountry) {
      const detection: CountryDetection = {
        countryCode: cfCountry,
        countryName: cfCountry === "CN" ? "China" : "Other",
        isChina: cfCountry === "CN",
        source: "cf-ipcountry",
      };
      setCountryDetection(detection);
      saveDetectionToCache(detection);

      const detectedProvider: MapProvider = detection.isChina ? "amap" : "google";
      setProviderState(detectedProvider);
      setIsDetecting(false);
      return;
    }

    // 3. Fallback to ipapi.co
    try {
      const detection = await detectCountryFromAPI();
      setCountryDetection(detection);
      saveDetectionToCache(detection);

      const detectedProvider: MapProvider = detection.isChina ? "amap" : "google";
      setProviderState(detectedProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Detection failed";
      setError(message);
      // Fallback to Google on error
      setProviderState("google");
    } finally {
      setIsDetecting(false);
    }
  }, []);

  /** Initial detection on mount */
  useEffect(() => {
    // Restore from localStorage first to avoid flash
    setProviderState(getInitialProvider());

    // Then run proper detection
    detectCountry();

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [detectCountry, getInitialProvider]);

  /** Set provider and persist */
  const setProvider = useCallback(
    (p: MapProvider) => {
      setProviderState(p);
      persistProvider(p);
    },
    [persistProvider],
  );

  /** Toggle between google and amap */
  const toggleProvider = useCallback(() => {
    setProviderState((prev) => {
      const next: MapProvider = prev === "google" ? "amap" : "google";
      persistProvider(next);
      return next;
    });
  }, [persistProvider]);

  /** Manual refetch */
  const refetch = useCallback(() => {
    // Clear cache and re-detect
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chinaconnect-country-detection");
      } catch {
        // ignore
      }
    }
    detectCountry();
  }, [detectCountry]);

  return {
    provider,
    setProvider,
    toggleProvider,
    isDetecting,
    countryDetection,
    error,
    refetch,
  };
}

export default useMapProvider;
