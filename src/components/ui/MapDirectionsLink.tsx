/**
 * MapDirectionsLink Component
 * - Renders a clickable link that opens the user's installed map app when possible.
 * - On iOS: tries comgooglemaps:// first, falls back to maps:// (Apple Maps).
 * - On Android: tries geo:lat,lng?q=... (Google Maps / Amap / Baidu / Tencent all handle it).
 * - On desktop or when native handler is missing: falls back to the Google Maps / Amap web URL.
 * - Auto-detects if the user is in China (prefer Amap) via isLikelyChinaUser().
 */
import {
  detectMobileOS,
  getAmapAddressUrl,
  getAmapUrl,
  getAppleMapsUrl,
  getGoogleMapsAddressUrl,
  getGoogleMapsUrl,
  getNativeMapUrl,
  isLikelyChinaUser,
} from "@/lib/map-links";
import React, { useEffect, useState } from "react";

interface MapDirectionsLinkProps {
  lat?: number;
  lng?: number;
  name?: string;
  /** Search by address when coordinates are not available */
  address?: string;
  className?: string;
  children?: React.ReactNode;
  /** Force a specific provider (skips auto-detect) */
  forceProvider?: "google" | "amap";
}

export function MapDirectionsLink({
  lat,
  lng,
  name,
  address,
  className = "",
  children,
  forceProvider,
}: MapDirectionsLinkProps) {
  const [useAmap, setUseAmap] = useState(false);
  useEffect(() => {
    if (forceProvider) {
      setUseAmap(forceProvider === "amap");
      return;
    }
    setUseAmap(isLikelyChinaUser());
  }, [forceProvider]);

  const hasCoords = typeof lat === "number" && typeof lng === "number" && lat !== 0 && lng !== 0;

  // Web URL — used as <a href> and as fallback if native scheme is not handled
  let webUrl: string;
  if (hasCoords) {
    webUrl = useAmap ? getAmapUrl(lat!, lng!, name) : getGoogleMapsUrl(lat!, lng!, name);
  } else if (address) {
    webUrl = useAmap ? getAmapAddressUrl(address) : getGoogleMapsAddressUrl(address);
  } else if (name) {
    webUrl = useAmap ? getAmapAddressUrl(name) : getGoogleMapsAddressUrl(name);
  } else {
    return null;
  }

  /**
   * Click handler: on mobile, attempt to open the native map app first.
   * If the user's browser can't handle the scheme (no app installed), it
   * usually does nothing — we then fall back to the web URL after a short delay.
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasCoords) return; // address-only: no native scheme available
    if (typeof window === "undefined") return;

    const os = detectMobileOS();
    if (os === "other") return; // desktop: let the <a href> do its thing

    const nativeUrl = getNativeMapUrl(lat!, lng!, name, os);
    if (!nativeUrl) return;

    // Try native scheme first. If the app is installed, the browser will hand off
    // and the page may not navigate at all. If not, the timeout below fires and
    // we open the web URL instead.
    e.preventDefault();
    const t = window.setTimeout(() => {
      window.location.assign(webUrl);
    }, 600);

    // Cleanup if the browser actually navigated to a scheme handler
    const onBlur = () => window.clearTimeout(t);
    window.addEventListener("blur", onBlur, { once: true });
    window.location.href = nativeUrl;
  };

  return (
    <a
      href={webUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children || (
        <>
          <span>🗺️</span>
          <span>{useAmap ? "导航" : "Directions"}</span>
        </>
      )}
    </a>
  );
}

export default MapDirectionsLink;
