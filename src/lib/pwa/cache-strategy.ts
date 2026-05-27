// Cache Strategy implementations for ChinaConnect PWA

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheOptions {
  maxAge?: number; // milliseconds
  maxEntries?: number;
  storage?: "cache" | "indexeddb";
}

// Cache-first strategy - good for static assets
export async function cacheFirst<T>(
  request: Request | string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const cacheName = options.storage === "indexeddb" ? "chinaconnect-data" : "chinaconnect-static";
  const maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000; // Default 1 week

  const url = typeof request === "string" ? request : request.url;

  // Try cache first
  const cached = await getFromCache<T>(url, cacheName);
  if (cached && !isExpired(cached.timestamp, maxAge)) {
    return cached.data;
  }

  // Fetch fresh data
  try {
    const response = await fetchFn();

    // Store in cache
    await putInCache(
      url,
      {
        data: response,
        timestamp: Date.now(),
      },
      cacheName,
    );

    return response;
  } catch (error) {
    // Return stale data if available
    if (cached) {
      console.log("[Cache] Using stale data due to fetch error");
      return cached.data;
    }
    throw error;
  }
}

// Network-first strategy - good for dynamic content
export async function networkFirst<T>(
  request: Request | string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const cacheName = options.storage === "indexeddb" ? "chinaconnect-data" : "chinaconnect-dynamic";
  const _maxAge = options.maxAge || 24 * 60 * 60 * 1000; // Default 1 day

  const url = typeof request === "string" ? request : request.url;

  try {
    // Try network first
    const response = await fetchFn();

    // Store in cache
    await putInCache(
      url,
      {
        data: response,
        timestamp: Date.now(),
      },
      cacheName,
    );

    return response;
  } catch (error) {
    console.log("[Cache] Network failed, trying cache");

    // Try cache as fallback
    const cached = await getFromCache<T>(url, cacheName);
    if (cached) {
      return cached.data;
    }

    throw error;
  }
}

// Stale-while-revalidate - serves cached data while updating in background
export async function staleWhileRevalidate<T>(
  request: Request | string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const cacheName = options.storage === "indexeddb" ? "chinaconnect-data" : "chinaconnect-dynamic";
  const maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000; // Default 1 week

  const url = typeof request === "string" ? request : request.url;

  // Get cached data immediately
  const cached = await getFromCache<T>(url, cacheName);

  // Fetch in background regardless
  fetchFn()
    .then((response) => {
      putInCache(
        url,
        {
          data: response,
          timestamp: Date.now(),
        },
        cacheName,
      ).catch(() => {});
    })
    .catch(() => {
      // Ignore fetch errors in background
    });

  // Return cached data if available and not too old
  if (cached && !isExpired(cached.timestamp, maxAge * 2)) {
    return cached.data;
  }

  // If cached data is too old, wait for fresh data
  if (cached) {
    // Return stale but trigger async refresh
    const fresh = await fetchFn().catch(() => null);
    if (fresh) {
      await putInCache(url, { data: fresh, timestamp: Date.now() }, cacheName);
      return fresh;
    }
    return cached.data;
  }

  // No cache, wait for fresh data
  const response = await fetchFn();
  await putInCache(url, { data: response, timestamp: Date.now() }, cacheName);
  return response;
}

// Cache-only strategy - only returns cached data
export async function cacheOnly<T>(
  request: Request | string,
  options: CacheOptions = {},
): Promise<T | null> {
  const cacheName = options.storage === "indexeddb" ? "chinaconnect-data" : "chinaconnect-static";
  const url = typeof request === "string" ? request : request.url;

  const cached = await getFromCache<T>(url, cacheName);
  return cached?.data ?? null;
}

// Network-only strategy - only returns network data
export async function networkOnly<T>(fetchFn: () => Promise<T>): Promise<T> {
  return fetchFn();
}

// Helper functions

function isExpired(timestamp: number, maxAge: number): boolean {
  return Date.now() - timestamp > maxAge;
}

async function getFromCache<T>(url: string, cacheName: string): Promise<CacheEntry<T> | null> {
  try {
    // Try Cache API first
    if ("caches" in window) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      if (response) {
        const data = await response.json();
        return data;
      }
    }

    // Fall back to localStorage
    const key = `cache_${cacheName}_${encodeURIComponent(url)}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[Cache] Error reading from cache:", error);
  }

  return null;
}

async function putInCache<T>(url: string, entry: CacheEntry<T>, cacheName: string): Promise<void> {
  try {
    // Try Cache API first
    if ("caches" in window) {
      const cache = await caches.open(cacheName);
      const response = new Response(JSON.stringify(entry), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(url, response);
    }

    // Also store in localStorage for smaller items
    const key = `cache_${cacheName}_${encodeURIComponent(url)}`;
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error("[Cache] Error writing to cache:", error);

    // If quota exceeded, clear old entries
    if ((error as Error).name === "QuotaExceededError") {
      await clearOldCacheEntries(cacheName);
    }
  }
}

async function clearOldCacheEntries(cacheName: string, maxEntries = 100): Promise<void> {
  try {
    const prefix = `cache_${cacheName}_`;
    const entries: Array<{ key: string; entry: CacheEntry }> = [];

    // Collect all entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || "{}");
          entries.push({ key, entry });
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp, oldest first
    entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);

    // Remove oldest entries if over limit
    while (entries.length > maxEntries) {
      const oldest = entries.shift();
      if (oldest) {
        localStorage.removeItem(oldest.key);
      }
    }
  } catch (error) {
    console.error("[Cache] Error clearing old entries:", error);
  }
}

// IndexedDB-based cache for larger data

export async function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ChinaConnectCache", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "url" });
      }
    };
  });
}

export async function getFromIDBCache<T>(url: string): Promise<CacheEntry<T> | null> {
  try {
    const db = await openCacheDB();
    const tx = db.transaction("cache", "readonly");
    const store = tx.objectStore("cache");
    const request = store.get(url);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function putInIDBCache<T>(url: string, entry: CacheEntry<T>): Promise<void> {
  try {
    const db = await openCacheDB();
    const tx = db.transaction("cache", "readwrite");
    const store = tx.objectStore("cache");
    await store.put({ url, ...entry });
  } catch (error) {
    console.error("[Cache] IndexedDB error:", error);
  }
}

export default {
  cacheFirst,
  networkFirst,
  staleWhileRevalidate,
  cacheOnly,
  networkOnly,
  getFromCache,
  putInCache,
  openCacheDB,
  getFromIDBCache,
  putInIDBCache,
  clearOldCacheEntries,
};
