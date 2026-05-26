/**
 * Coordinate conversion utilities for WGS-84 (Google Maps) and GCJ-02 (Amap/高德地图)
 * China mainland uses GCJ-02 coordinate system, which is a deviation from WGS-84
 */

const PI = Math.PI;
const A = 6378245.0; // Semi-major axis of WGS-84
const EE = 0.00669342162296594323; // Eccentricity squared

/**
 * Check if a coordinate is within China mainland bounds
 * This is an approximation to avoid unnecessary conversions
 */
export function isInChinaBounds(lat: number, lng: number): boolean {
  return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
}

/**
 * Convert WGS-84 to GCJ-02 (for use with Amap/高德地图)
 */
export function wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  if (!isInChinaBounds(lat, lng)) {
    return { lat, lng };
  }
  return transform(wgs84ToGcj02Trans(lat, lng));
}

/**
 * Convert GCJ-02 to WGS-84 (for use with Google Maps)
 */
export function gcj02ToWgs84(lat: number, lng: number): { lat: number; lng: number } {
  if (!isInChinaBounds(lat, lng)) {
    return { lat, lng };
  }
  return transform(gcj02ToWgs84Trans(lat, lng));
}

// Internal transformation functions
function transform(delta: { lat: number; lng: number }): { lat: number; lng: number } {
  return { lat: delta.lat, lng: delta.lng };
}

function wgs84ToGcj02Trans(lat: number, lng: number): { lat: number; lng: number } {
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat + dLat, lng: lng + dLng };
}

function gcj02ToWgs84Trans(lat: number, lng: number): { lat: number; lng: number } {
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat - dLat, lng: lng - dLng };
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}
