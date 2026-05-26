/**
 * Post Card Component for ChinaConnect
 * Unified card for all post types (travel diary, pit guide, QA, food discovery, route share)
 */

import { LevelBadge } from "@/components/user/LevelBadge";
import type { MockPost } from "@/data/community/mockData";
import type { Post } from "@/types/database";
import { useState } from "react";

type CombinedPost = Post | MockPost;

interface PostCardProps {
  post: CombinedPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  showFull?: boolean;
  className?: string;
}

// Get icon and color for post type
function getPostTypeInfo(type: string): {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
} {
  const typeMap: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
    travel_diary: {
      icon: "✈️",
      label: "Travel Diary",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    pit_guide: {
      icon: "⚠️",
      label: "Pit Guide",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    qa: {
      icon: "❓",
      label: "Q&A",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    food_discovery: {
      icon: "🍜",
      label: "Food",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
    route_share: {
      icon: "🗺️",
      label: "Route",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
  };
  return (
    typeMap[type] || {
      icon: "📝",
      label: "Post",
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-700",
    }
  );
}

// Format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "Just now";
}

export function PostCard({
  post,
  onLike,
  onComment,
  showFull = false,
  className = "",
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // Get type info
  const typeInfo = getPostTypeInfo(post.type);
  const profile = "profile" in post ? post.profile : null;
  const displayTitle = post.title || "Untitled";
  const displayContent = post.content || "";
  const displayCity = "city" in post ? post.city : null;
  const displayImages = post.images || [];
  const displayTags = post.tags || [];
  const likesCount = isLiked ? post.likes_count + 1 : post.likes_count;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiked) {
      setIsLiked(true);
      onLike?.(post.id);
    }
  };

  return (
    <article
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {/* Header Image (for travel diaries) */}
      {displayImages.length > 0 && (
        <div className="relative h-48 md:h-56">
          <img
            src={displayImages[0]}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/800x400?text=No+Image";
            }}
          />
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              +{displayImages.length - 1} more
            </div>
          )}
          {post.is_featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
              Featured
            </div>
          )}
          {post.is_best_answer && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Best Answer
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}
          >
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </span>
          <span className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          <a href={`/post/${post.id}`}>{displayTitle}</a>
        </h3>

        {/* Content */}
        <p
          className={`text-gray-600 dark:text-gray-300 text-sm mb-3 ${showFull ? "" : "line-clamp-3"}`}
        >
          {displayContent}
        </p>

        {/* Location */}
        {displayCity && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <span>📍</span>
            <span>{displayCity}</span>
          </div>
        )}

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {displayTags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-3 pt-3 border-t dark:border-gray-700">
          {profile ? (
            <>
              <a href={`/user/${profile.id}`} className="flex items-center gap-2 hover:opacity-80">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                    {profile.display_name?.[0] || "?"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">{profile.display_name || "Anonymous"}</div>
                  <LevelBadge level={profile.level} size="sm" />
                </div>
              </a>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                ?
              </div>
              <span className="text-sm text-gray-500">Unknown</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
            >
              {isLiked ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
              <span>{likesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => onComment?.(post.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.comments_count}</span>
            </button>

            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Post Card Skeleton for loading state
export function PostCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex items-center gap-3 pt-3 border-t dark:border-gray-700">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default PostCard;
