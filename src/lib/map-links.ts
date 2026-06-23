/**
 * Map Navigation Link Utilities
 * Generates correct Google Maps / Amap URLs for directions
 * Auto-detects user location to choose the right map provider
 */

export interface MapCoords {
  lat: number;
  lng: number;
  name?: string;
}

/**
 * Generate a Google Maps search URL
 */
export function getGoogleMapsUrl(lat: number, lng: number, name?: string): string {
  const query = name ? `${lat},${lng}(${encodeURIComponent(name)})` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Generate an Amap (高德地图) marker URL
 * Note: Amap uses lng,lat order
 */
export function getAmapUrl(lat: number, lng: number, name?: string): string {
  const params = new URLSearchParams({
    position: `${lng},${lat}`,
    name: name || "",
    src: "chinaconnect",
    coordinate: "gcj02",
  });
  return `https://uri.amap.com/marker?${params.toString()}`;
}

/**
 * Generate a Google Maps directions URL (with destination)
 */
export function getGoogleDirectionsUrl(lat: number, lng: number, name?: string): string {
  const query = name ? `${lat},${lng}(${encodeURIComponent(name)})` : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

/**
 * Client-side: detect if user is likely in China based on browser language
 * Returns true if the user appears to be in China
 */
export function isLikelyChinaUser(): boolean {
  if (typeof window === "undefined") return false;
  const lang = navigator.language || "";
  const langs = navigator.languages || [];
  // Check for zh-CN or zh locale
  if (lang.startsWith("zh-CN") || lang.startsWith("zh-Hans")) return true;
  if (langs.some((l) => l.startsWith("zh-CN") || l.startsWith("zh-Hans"))) return true;
  // Check stored preference
  try {
    const pref = localStorage.getItem("mapProvider");
    if (pref === "amap") return true;
    if (pref === "google") return false;
  } catch {
    // localStorage not available
  }
  return false;
}

/**
 * Get the appropriate map URL based on user's likely location
 * For SSR, defaults to Google Maps; client-side auto-detects
 */
export function getMapUrl(lat: number, lng: number, name?: string): string {
  // Default to Google Maps (SSR safe)
  return getGoogleMapsUrl(lat, lng, name);
}

/**
 * Generate a Google Maps search URL by address
 */
export function getGoogleMapsAddressUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Generate an Amap search URL by address
 */
export function getAmapAddressUrl(address: string): string {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(address)}&src=chinaconnect`;
}

/**
 * Get both map URLs for client-side selection
 */
export function getBothMapUrls(lat: number, lng: number, name?: string) {
  return {
    google: getGoogleMapsUrl(lat, lng, name),
    amap: getAmapUrl(lat, lng, name),
  };
}

// ─── Native Map Schemes ──────────────────────────────────────────
// Prefer native map app schemes (geo: for Android, comgooglemaps:// for iOS,
// maps:// for Apple Maps) so taps open the user's installed map app directly.
// Falls back to the web URL above when the native scheme can't be used.

/**
 * Try to detect mobile OS at runtime. Returns "ios" | "android" | "other".
 * Safe to call on the client; on the server returns "other".
 */
export function detectMobileOS(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/**
 * Build a native map URL that the user's installed map app can open.
 * - iOS: comgooglemaps://?q=lat,lng&center=lat,lng (Google Maps if installed;
 *   iOS will fall back to Apple Maps automatically if Google Maps isn't there
 *   and we also expose a maps:// URL via getAppleMapsUrl below).
 * - Android: geo:lat,lng?q=lat,lng(Name) — any registered map handler
 *   (Google Maps / Amap / Baidu / Tencent) will pick it up.
 *
 * Returns empty string on server / desktop so the caller can fall back to web URL.
 */
export function getNativeMapUrl(
  lat: number,
  lng: number,
  name?: string,
  os?: "ios" | "android" | "other",
): string {
  const detected = os ?? detectMobileOS();
  const encodedName = name ? encodeURIComponent(name) : "";
  if (detected === "ios") {
    const namePart = encodedName ? `(${encodedName})` : "";
    return `comgooglemaps://?q=${lat},${lng}${namePart}&center=${lat},${lng}&zoom=16`;
  }
  if (detected === "android") {
    const q = encodedName ? `${lat},${lng}(${encodedName})` : `${lat},${lng}`;
    return `geo:${lat},${lng}?q=${q}`;
  }
  return "";
}

/**
 * Apple Maps universal URL — works on iOS even when Google Maps is not installed.
 * Use as a final fallback on iOS.
 */
export function getAppleMapsUrl(lat: number, lng: number, name?: string): string {
  const q = name ? encodeURIComponent(name) : `${lat},${lng}`;
  return `maps://?q=${q}&ll=${lat},${lng}`;
}
