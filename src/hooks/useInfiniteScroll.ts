import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions<T> {
  items: T[];
  initialCount?: number;
  loadMoreCount?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  visibleItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  loading: boolean;
  sentinelRef: (node?: Element | null) => void;
  reset: () => void;
}

export function useInfiniteScroll<T>({
  items,
  initialCount = 10,
  loadMoreCount = 10,
  threshold = 0.1,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<Element | null>(null);

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    // Simulate slight delay for smooth UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreCount, items.length));
      setLoading(false);
    }, 150);
  }, [loading, hasMore, loadMoreCount, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  // Intersection Observer for sentinel element
  const sentinelRef = useCallback(
    (node?: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      sentinelNodeRef.current = node;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            loadMore();
          }
        },
        {
          root: null,
          rootMargin: "100px",
          threshold,
        },
      );

      observerRef.current.observe(node);
    },
    [hasMore, loading, loadMore, threshold],
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Reset when items change significantly
  useEffect(() => {
    if (visibleCount > items.length) {
      setVisibleCount(Math.min(initialCount, items.length));
    }
  }, [items.length, initialCount, visibleCount]);

  return {
    visibleItems: items.slice(0, visibleCount),
    hasMore,
    loadMore,
    loading,
    sentinelRef,
    reset,
  };
}
