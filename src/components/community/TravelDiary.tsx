/**
 * Travel Diary Component for ChinaConnect
 * Users can post图文旅行日记 with map route markers
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LevelBadge } from "@/components/user/LevelBadge";
import { addImageToCache, addImageUrl, getCachedImages } from "@/services/upload-service";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { POINTS } from "@/types/database";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";

type Post = Database["public"]["Tables"]["posts"]["Row"];

// Create new travel diary
interface TravelDiaryFormProps {
  userId: string;
  onPostCreated?: (post: Post) => void;
  className?: string;
}

export function TravelDiaryForm({ userId, onPostCreated, className = "" }: TravelDiaryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    city: "",
    tags: "",
    images: [] as string[],
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [cachedImages, setCachedImages] = useState<string[]>([]);

  // Load cached images when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setCachedImages(getCachedImages().slice(0, 12));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          type: "travel_diary",
          title: formData.title,
          content: formData.content,
          city: formData.city || null,
          tags: tagsArray,
          images: imageUrls,
          location: null, // Could add map integration here
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update user points
      await supabase.rpc("add_points", {
        p_user_id: userId,
        p_points: POINTS.POST,
        p_reason: "Posted travel diary",
      });

      onPostCreated?.(data as Post);
      setIsOpen(false);
      setFormData({ title: "", content: "", city: "", tags: "", images: [] });
      setImageUrls([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImageUrl = async (url: string) => {
    if (url.trim() && !imageUrls.includes(url)) {
      setIsValidatingUrl(true);
      setError(null);
      try {
        await addImageUrl(url);
        addImageToCache(url);
        setImageUrls((prev) => [...prev, url]);
        setCachedImages((prev) => [url, ...prev.filter((u) => u !== url)].slice(0, 12));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid image URL");
      } finally {
        setIsValidatingUrl(false);
      }
    }
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={className}>✈️ New Travel Diary</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Write Travel Diary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Give your travel diary a title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="Which city are you writing about?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Share your travel experience..."
              required
              rows={8}
            />
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-medium mb-1">Images (URLs)</label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Input
                  type="url"
                  id="diary-image-url"
                  placeholder="Paste image URL and press Enter"
                  disabled={isValidatingUrl}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      handleAddImageUrl(input.value);
                      input.value = "";
                    }
                  }}
                />
                {isValidatingUrl && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Cached/recent images */}
            {cachedImages.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-1">Recent images</div>
                <div className="flex gap-1 flex-wrap">
                  {cachedImages.map((url) => (
                    <button
                      key={url}
                      type="button"
                      title="Click to add"
                      onClick={() => handleAddImageUrl(url)}
                      className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {imageUrls.includes(url) && (
                        <div className="absolute inset-0 bg-blue-500/60 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">OK</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs">+</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imageUrls.map((url) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <Input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="food, culture, sightseeing"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-500">
              Earn <span className="text-green-600 font-semibold">+{POINTS.POST} points</span>
            </span>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish Diary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Travel Diary Card Component
interface TravelDiaryCardProps {
  post: Post & { profile?: Database["public"]["Tables"]["profiles"]["Row"] };
  onLike?: (postId: string) => void;
  className?: string;
}

export function TravelDiaryCard({ post, onLike, className = "" }: TravelDiaryCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    if (isLiked) return;

    try {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: post.user_id,
      });

      setIsLiked(true);
      onLike?.(post.id);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header Image */}
      {post.images && post.images.length > 0 && (
        <div className="relative h-48">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              +{post.images.length - 1} more
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-3">
          {post.profile?.avatar_url ? (
            <img src={post.profile.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
              {post.profile?.display_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-sm">{post.profile?.display_name || "Anonymous"}</div>
            {post.profile && <LevelBadge level={post.profile.level} size="sm" />}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Title and Content */}
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{post.content}</p>

        {/* Location */}
        {post.city && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">📍 {post.city}</div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            {isLiked ? "❤️" : "🤍"} {post.likes_count}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
          >
            💬 {post.comments_count}
          </button>
        </div>
      </div>
    </div>
  );
}

// Travel Diary Feed
interface TravelDiaryFeedProps {
  posts: (Post & { profile?: Database["public"]["Tables"]["profiles"]["Row"] })[];
  isLoading?: boolean;
  className?: string;
}

export function TravelDiaryFeed({ posts, isLoading, className = "" }: TravelDiaryFeedProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <span className="text-5xl mb-4 block">✈️</span>
        <h3 className="text-lg font-semibold mb-2">No travel diaries yet</h3>
        <p className="text-gray-500">Share your first travel experience!</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {posts.map((post) => (
        <TravelDiaryCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default TravelDiaryForm;
