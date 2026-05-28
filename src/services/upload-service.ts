/**
 * upload-service - Photo upload to Supabase Storage
 * Supports URL input (no actual file upload needed for the Astro app)
 * Provides image URL validation and caching
 */

import { supabase } from "@/supabase/config";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
}

// Supported image extensions
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];

function isImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const ext = u.pathname.toLowerCase();
    return IMAGE_EXTENSIONS.some((e) => ext.endsWith(e));
  } catch {
    return false;
  }
}

/**
 * Add an image by URL. This validates the URL and returns it as-is
 * (since the app uses URL input rather than file uploads).
 * In production, this would upload to Supabase Storage.
 */
export async function addImageUrl(
  url: string,
  _options: UploadOptions = {},
): Promise<UploadResult> {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("URL cannot be empty");
  }

  // Basic URL validation
  try {
    new URL(trimmed);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Validate image extension
  if (!isImageUrl(trimmed)) {
    throw new Error("URL must point to an image file (.jpg, .png, .webp, etc.)");
  }

  // Optionally validate with a HEAD request
  try {
    const res = await fetch(trimmed, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      throw new Error(`Image returned HTTP ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      throw new Error("URL does not point to a valid image");
    }
  } catch (err) {
    // If HEAD fails, still accept it (some servers don't support HEAD)
    if (err instanceof Error && !err.message.includes("HTTP")) {
      console.warn("Image HEAD check failed:", err.message);
    }
  }

  const filename = trimmed.split("/").pop() || "image";

  return {
    url: trimmed,
    filename,
    size: 0, // unknown for URL-based images
  };
}

/**
 * Upload a File object to Supabase Storage (when file input is used).
 * Returns the public URL of the uploaded file.
 */
export async function uploadImageFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const { bucket = "travel-photos", folder = "diaries" } = options;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`Image must be smaller than ${MAX_SIZE / 1024 / 1024}MB`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    filename: file.name,
    size: file.size,
  };
}

/**
 * Delete an image from Supabase Storage by URL.
 */
export async function deleteImage(url: string, bucket = "travel-photos"): Promise<void> {
  // Extract the path from the Supabase URL
  const parts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (parts.length < 2) return; // not a Supabase URL

  const path = decodeURIComponent(parts[1]);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn("Failed to delete image from storage:", error.message);
  }
}

/**
 * Image cache - store recently used image URLs
 */
const IMAGE_CACHE_KEY = "chinaconnect-image-cache";
const IMAGE_CACHE_MAX = 50;

interface ImageCache {
  [url: string]: { addedAt: number };
}

export function getCachedImages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    if (!raw) return [];
    const cache: ImageCache = JSON.parse(raw);
    return Object.keys(cache).sort((a, b) => cache[b].addedAt - cache[a].addedAt);
  } catch {
    return [];
  }
}

export function addImageToCache(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    const cache: ImageCache = raw ? JSON.parse(raw) : {};

    cache[url] = { addedAt: Date.now() };

    // Trim to max size
    const entries = Object.entries(cache).sort((a, b) => b[1].addedAt - a[1].addedAt);
    const trimmed = Object.fromEntries(entries.slice(0, IMAGE_CACHE_MAX));

    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function removeImageFromCache(url: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(IMAGE_CACHE_KEY);
    if (!raw) return;
    const cache: ImageCache = JSON.parse(raw);
    delete cache[url];
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}
