/**
 * useReviews Hook
 * Manages restaurant reviews with localStorage persistence
 * Supports review list, add review, star ratings
 */

import { useCallback, useEffect, useState } from "react";

export interface Review {
  id: string;
  restaurantId: string;
  authorName: string;
  authorId?: string;
  rating: number; // 1-5
  content: string;
  createdAt: string;
  language?: "en" | "zh" | "ja" | "ko";
  helpful?: number;
}

export interface AddReviewInput {
  restaurantId: string;
  authorName: string;
  authorId?: string;
  rating: number;
  content: string;
  language?: "en" | "zh" | "ja" | "ko";
}

export interface UseReviewsReturn {
  reviews: Review[];
  getReviewsForRestaurant: (restaurantId: string) => Review[];
  getAverageRating: (restaurantId: string) => number;
  getReviewCount: (restaurantId: string) => number;
  addReview: (input: AddReviewInput) => Review;
  deleteReview: (reviewId: string) => void;
  clearReviews: () => void;
  totalReviews: number;
}

const STORAGE_KEY = "chinaconnect-reviews";

function generateId(): string {
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function loadReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReviews(reviews: Review[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  const getReviewsForRestaurant = useCallback(
    (restaurantId: string): Review[] => {
      return reviews
        .filter((r) => r.restaurantId === restaurantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [reviews],
  );

  const getAverageRating = useCallback(
    (restaurantId: string): number => {
      const restaurantReviews = getReviewsForRestaurant(restaurantId);
      if (restaurantReviews.length === 0) return 0;
      const sum = restaurantReviews.reduce((acc, r) => acc + r.rating, 0);
      return Math.round((sum / restaurantReviews.length) * 10) / 10;
    },
    [getReviewsForRestaurant],
  );

  const getReviewCount = useCallback(
    (restaurantId: string): number => {
      return reviews.filter((r) => r.restaurantId === restaurantId).length;
    },
    [reviews],
  );

  const addReview = useCallback((input: AddReviewInput): Review => {
    const newReview: Review = {
      id: generateId(),
      restaurantId: input.restaurantId,
      authorName: input.authorName,
      authorId: input.authorId,
      rating: Math.min(5, Math.max(1, input.rating)),
      content: input.content.trim(),
      createdAt: new Date().toISOString(),
      language: input.language,
      helpful: 0,
    };

    setReviews((prev) => {
      const updated = [newReview, ...prev];
      saveReviews(updated);
      return updated;
    });

    return newReview;
  }, []);

  const deleteReview = useCallback((reviewId: string): void => {
    setReviews((prev) => {
      const updated = prev.filter((r) => r.id !== reviewId);
      saveReviews(updated);
      return updated;
    });
  }, []);

  const clearReviews = useCallback((): void => {
    setReviews([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    reviews,
    getReviewsForRestaurant,
    getAverageRating,
    getReviewCount,
    addReview,
    deleteReview,
    clearReviews,
    totalReviews: reviews.length,
  };
}

// ============================================
// Star Rating Component (helper)
// ============================================

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps): React.ReactElement {
  const sizeMap = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
  const sizeClass = sizeMap[size];

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxStars }, (_, i) => {
          const star = i + 1;
          const filled = star <= rating;
          const halfFilled = star - 0.5 <= rating && star > rating;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(star)}
              className={`${sizeClass} ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            >
              {filled ? (
                <span className="text-yellow-400">★</span>
              ) : halfFilled ? (
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-gray-300">☆</span>
              )}
            </button>
          );
        })}
      </div>
      {showValue && <span className={`${sizeClass} text-gray-600 ml-1`}>{rating.toFixed(1)}</span>}
    </div>
  );
}
