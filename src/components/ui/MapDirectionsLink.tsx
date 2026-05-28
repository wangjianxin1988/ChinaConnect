/**
 * MapDirectionsLink Component
 * Auto-detects user location and renders the appropriate map link
 * Shows Google Maps for international users, Amap for Chinese users
 */

import React, { useEffect, useState } from "react";
import {
  getGoogleMapsUrl,
  getAmapUrl,
  getGoogleMapsAddressUrl,
  getAmapAddressUrl,
  isLikelyChinaUser,
} from "@/lib/map-links";

interface MapDirectionsLinkProps {
  lat?: number;
  lng?: number;
  name?: string;
  /** Search by address when coordinates are not available */
  address?: string;
  className?: string;
  children?: React.ReactNode;
  /** Force a specific provider */
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

  // Determine the URL based on available data
  let url: string;
  const hasCoords = typeof lat === "number" && typeof lng === "number" && lat !== 0 && lng !== 0;

  if (hasCoords) {
    url = useAmap ? getAmapUrl(lat!, lng!, name) : getGoogleMapsUrl(lat!, lng!, name);
  } else if (address) {
    url = useAmap ? getAmapAddressUrl(address) : getGoogleMapsAddressUrl(address);
  } else if (name) {
    url = useAmap ? getAmapAddressUrl(name) : getGoogleMapsAddressUrl(name);
  } else {
    return null;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children || (
        <>
          <span>📍</span>
          <span>{useAmap ? "导航" : "Directions"}</span>
        </>
      )}
    </a>
  );
}

export default MapDirectionsLink;
