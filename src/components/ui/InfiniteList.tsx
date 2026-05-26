import React from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  initialCount?: number;
  loadMoreCount?: number;
  className?: string;
  emptyMessage?: string;
}

export function InfiniteList<T>({
  items,
  renderItem,
  initialCount = 10,
  loadMoreCount = 10,
  className = "space-y-4",
  emptyMessage = "No items to display",
}: InfiniteListProps<T>) {
  const { visibleItems, hasMore, loading, sentinelRef } = useInfiniteScroll<T>({
    items,
    initialCount,
    loadMoreCount,
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>

      {/* Sentinel element for intersection observer */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="py-8 flex flex-col items-center"
        >
          {loading ? (
            <>
              <div className="flex items-center gap-3 text-gray-500">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm font-medium">Loading more...</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Showing {visibleItems.length} of {items.length} items
              </div>
            </>
          ) : (
            <div className="h-8" /> // Placeholder for sentinel
          )}
        </div>
      )}

      {!hasMore && items.length > initialCount && (
        <div className="py-6 text-center text-sm text-gray-400">
          You've reached the end · {items.length} items total
        </div>
      )}
    </>
  );
}
