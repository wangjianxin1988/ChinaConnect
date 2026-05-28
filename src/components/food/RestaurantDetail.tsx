/**
 * Restaurant Detail Page with Full Features
 * - Restaurant details display
 * - Favorite/Bookmark functionality
 * - User reviews
 * - More filters
 */

import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  name_en?: string;
  cuisine: string;
  cuisine_zh?: string;
  rating?: number;
  review_count: number;
  avg_cost?: number;
  address?: string;
  address_zh?: string;
  lat?: number;
  lng?: number;
  images: string[];
  tags: string[];
  michelin_stars?: number;
  heizhenzhu_rank?: number;
  blogger_recommended?: boolean;
  blogger_name?: string;
  opening_hours?: Record<string, string>;
  avg_meal_duration?: number;
  booking_required?: boolean;
  phone?: string;
  description?: string;
  description_zh?: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
    level: string;
  };
}

interface RestaurantDetailProps {
  restaurant: Restaurant;
}

export function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Check if user is logged in and get user ID
  const getCurrentUserId = async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch {
      return null;
    }
  };

  // Check favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      try {
        const { data } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", userId)
          .eq("bookmark_type", "restaurant")
          .eq("reference_id", restaurant.id)
          .single();

        setIsFavorited(!!data);
      } catch {
        // Bookmark table may not exist in demo mode
      }
    };

    checkFavorite();
  }, [restaurant.id]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data } = await supabase
          .from("comments")
          .select("*, profiles:user_id(display_name, avatar_url, level)")
          .eq("post_id", restaurant.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (data) {
          setReviews(data as unknown as Review[]);
        }
      } catch {
        // Comments may not exist in demo mode
        setReviews([]);
      }
    };

    loadReviews();
  }, [restaurant.id]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      window.location.href = "/auth";
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("bookmark_type", "restaurant")
          .eq("reference_id", restaurant.id);
      } else {
        await supabase.from("bookmarks").insert({
          user_id: userId,
          bookmark_type: "restaurant",
          reference_id: restaurant.id,
        });
      }
      setIsFavorited(!isFavorited);
    } catch {
      // Demo mode - toggle locally
      setIsFavorited(!isFavorited);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const userId = await getCurrentUserId();
    if (!userId) {
      window.location.href = "/auth";
      return;
    }

    setIsLoading(true);
    try {
      // Use comments table to store reviews
      const { data } = await supabase
        .from("comments")
        .insert({
          post_id: restaurant.id,
          user_id: userId,
          content: newReview,
          is_best_answer: false,
        })
        .select("*, profiles:user_id(display_name, avatar_url, level)")
        .single();

      if (data) {
        setReviews([data as unknown as Review, ...reviews]);
        setNewReview("");
        setNewRating(5);
      }
    } catch {
      // Demo mode - add locally
      const mockReview: Review = {
        id: `review_${Date.now()}`,
        user_id: userId,
        rating: newRating,
        content: newReview,
        created_at: new Date().toISOString(),
        profiles: { display_name: "Demo User", level: "探索者" },
      };
      setReviews([mockReview, ...reviews]);
      setNewReview("");
      setNewRating(5);
    } finally {
      setIsLoading(false);
    }
  };

  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const remainingReviews = reviews.length - 3;

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="relative">
        {restaurant.images && restaurant.images.length > 0 ? (
          <>
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
              <img
                src={restaurant.images[activeImageIndex]}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            {restaurant.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {restaurant.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === activeImageIndex
                        ? "border-blue-500"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            {restaurant.name_en && <p className="text-gray-500">{restaurant.name_en}</p>}
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`p-3 rounded-full transition-all ${
              isFavorited
                ? "bg-red-100 text-red-500"
                : "bg-gray-100 text-gray-400 hover:text-red-500"
            }`}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Rating and Price */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {restaurant.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-lg">★</span>
              <span className="text-xl font-bold">{restaurant.rating}</span>
              <span className="text-gray-500">({restaurant.review_count} reviews)</span>
            </div>
          )}
          {restaurant.avg_cost && (
            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg">
              <span className="font-medium">¥{restaurant.avg_cost}</span>
              <span className="text-sm">/person</span>
            </div>
          )}
          {restaurant.michelin_stars && restaurant.michelin_stars > 0 && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
              ⭐ {restaurant.michelin_stars}-Star Michelin
            </div>
          )}
          {restaurant.heizhenzhu_rank && restaurant.heizhenzhu_rank > 0 && (
            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg">
              💎 {restaurant.heizhenzhu_rank} Black Pearl
            </div>
          )}
        </div>

        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Cuisine / 菜系</p>
            <p className="font-medium">{restaurant.cuisine}</p>
          </div>
          {restaurant.avg_meal_duration && (
            <div>
              <p className="text-sm text-gray-500">Avg Duration / 平均时长</p>
              <p className="font-medium">{restaurant.avg_meal_duration} min</p>
            </div>
          )}
          {restaurant.address && (
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Address / 地址</p>
              <p className="font-medium">{restaurant.address}</p>
            </div>
          )}
          {restaurant.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone / 电话</p>
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                {restaurant.phone}
              </a>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Booking / 预约</p>
            <p className="font-medium">
              {restaurant.booking_required ? "Required 必须" : "Not required 非必须"}
            </p>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
        )}

        {/* Blogger Recommendation */}
        {restaurant.blogger_recommended && restaurant.blogger_name && (
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
            <p className="text-sm text-gray-500">Blogger Recommended / 博主推荐</p>
            <p className="font-medium">by {restaurant.blogger_name}</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Reviews / 评论</h2>
          <span className="text-gray-500">{reviews.length} reviews</span>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleSubmitReview} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className={`text-2xl transition-colors ${
                  star <= newRating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your dining experience..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button type="submit" disabled={isLoading || !newReview.trim()}>
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">💬</span>
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            displayReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  {review.profiles?.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {review.profiles?.display_name?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">
                      {review.profiles?.display_name || "Anonymous"}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= review.rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Show More Button */}
        {remainingReviews > 0 && !showAllReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Show {remainingReviews} more reviews
          </button>
        )}
      </div>
    </div>
  );
}

export default RestaurantDetail;
