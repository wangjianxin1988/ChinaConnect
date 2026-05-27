import { useCallback, useEffect, useState } from "react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [cachedData, setCachedData] = useState<{
    cities: number;
    aiResponses: number;
    lastSync: string | null;
  } | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      // Hide banner after a short delay when back online
      setTimeout(() => setShowBanner(false), 2000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Expose update function for SW to call
    window.updateOfflineIndicator = (offline: boolean) => {
      setIsOffline(offline);
      setShowBanner(offline);
    };

    // Get cache status from SW
    const getCacheStatus = async () => {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        try {
          navigator.serviceWorker.controller.postMessage({
            type: "GET_CACHE_STATUS",
          });
          // Response will come via a message event
        } catch {
          // SW might not be ready
        }
      }
    };

    // Listen for cache status response
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CACHE_STATUS") {
        setCachedData({
          cities: event.data.caches["cached-cities"] || 0,
          aiResponses: event.data.caches["cached-ai-responses"] || 0,
          lastSync: event.data.caches["cached-cities"] ? new Date().toLocaleTimeString() : null,
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    // Try to get cache status after a delay
    setTimeout(getCacheStatus, 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
      window.updateOfflineIndicator = undefined;
    };
  }, []);

  // Don't show banner when online (will briefly show checkmark)
  if (!showBanner && !isOffline) {
    return null;
  }

  const handleRetry = useCallback(async () => {
    if (navigator.onLine) {
      // Trigger SW sync
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "SYNC_FAVORITES" });
      }
      setShowBanner(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  if (isOffline) {
    return (
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900"
        role="alert"
        aria-live="polite"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between py-2 px-4">
            {/* Offline indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-yellow-600 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <p className="text-sm font-medium">You're offline</p>
                {cachedData && cachedData.cities > 0 && (
                  <p className="text-xs text-yellow-700">
                    {cachedData.cities} cities available offline
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-yellow-800 hover:text-yellow-900 transition-colors"
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Offline capabilities info */}
          <div className="pb-3 px-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Cached cities
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Emergency contacts
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Restaurant list
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Back online indicator
  return (
    <output
      className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white animate-slide-down"
      aria-live="polite"
    >
      <div className="container-custom">
        <div className="flex items-center justify-center gap-2 py-2">
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Back online! Syncing data...</span>
        </div>
      </div>
    </output>
  );
}

export default OfflineIndicator;
