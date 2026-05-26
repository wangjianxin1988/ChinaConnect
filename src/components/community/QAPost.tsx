/**
 * Q&A Post Component for ChinaConnect
 * Stack Overflow style Q&A for travel questions
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LevelBadge } from "@/components/user/LevelBadge";
import { supabase } from "@/supabase/config";
import type { Database } from "@/types/database";
import { POINTS } from "@/types/database";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./Dialog";
import { useBestAnswer } from "@/hooks/useBestAnswer";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type Comment = Database["public"]["Tables"]["comments"]["Row"];

interface QAPostProps {
  userId: string;
  initialPosts?: Post[];
  onPostCreated?: (post: Post) => void;
  className?: string;
}

// Create new Q&A post
export function QAPostForm({ userId, onPostCreated, className = "" }: QAPostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    city: "",
  });

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
          type: "qa",
          title: formData.title,
          content: formData.content,
          tags: tagsArray,
          city: formData.city || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update user points
      await supabase.rpc("add_points", {
        p_user_id: userId,
        p_points: POINTS.POST,
        p_reason: "Posted Q&A",
      });

      onPostCreated?.(data as Post);
      setIsOpen(false);
      setFormData({ title: "", content: "", tags: "", city: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>❓ Ask Question</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Question Title *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="What's your travel question?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Details *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Provide more details about your question..."
              required
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City (optional)</label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="e.g., Shanghai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="visa, transport, food"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-gray-500">
              Earn <span className="text-green-600 font-semibold">+{POINTS.POST} points</span>
            </span>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Q&A Post Card Component
interface QAPostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onMarkBestAnswer?: (commentId: string) => void;
  className?: string;
}

export function QAPostCard({ post, currentUserId, onLike, className = "" }: QAPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { getBestAnswer, markBest, isBestAnswer } = useBestAnswer();
  const bestAnswerId = getBestAnswer(post.id);

  const handleLike = async () => {
    if (isLiked) return;

    try {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUserId || post.user_id,
      });

      setIsLiked(true);
      onLike?.(post.id);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleMarkBest = () => {
    if (bestAnswerId) {
      // Cycle: if already marked, unmark
    }
    // The actual marking is done in AnswerCard
  };

  const isQuestionAuthor = !!currentUserId && currentUserId === post.user_id;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {post.city && <span className="flex items-center gap-1">📍 {post.city}</span>}
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
          ❓ Q&A
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
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
          💬 {post.comments_count} answers
        </button>
        {bestAnswerId && (
          <span className="flex items-center gap-1 text-sm text-green-600">Best Answer marked</span>
        )}
      </div>
    </div>
  );
}

// Answer Card Component
interface AnswerCardProps {
  answer: Comment & { profile?: Database["public"]["Tables"]["profiles"]["Row"] };
  isBestAnswer?: boolean;
  isQuestionAuthor?: boolean;
  onMarkBest?: (answerId: string) => void;
  onUnmarkBest?: (answerId: string) => void;
  className?: string;
}

export function AnswerCard({
  answer,
  isBestAnswer,
  isQuestionAuthor,
  onMarkBest,
  onUnmarkBest,
  className = "",
}: AnswerCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${
        isBestAnswer ? "border-2 border-green-500" : ""
      } ${className}`}
    >
      {isBestAnswer && (
        <div className="flex items-center gap-1 text-green-600 text-sm mb-2">⭐ Best Answer</div>
      )}

      <p className="text-gray-700 dark:text-gray-300 mb-4">{answer.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {answer.profile?.avatar_url ? (
            <img src={answer.profile.avatar_url} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
              {answer.profile?.display_name?.[0] || "?"}
            </div>
          )}
          <span className="text-sm font-medium">{answer.profile?.display_name || "Anonymous"}</span>
          {answer.profile && (
            <LevelBadge level={answer.profile.level} size="sm" showLabel={false} />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {new Date(answer.created_at).toLocaleDateString()}
          </span>
          {isQuestionAuthor && (
            isBestAnswer ? (
              <Button variant="ghost" size="sm" onClick={() => onUnmarkBest?.(answer.id)} className="text-green-600 hover:text-red-500 text-xs px-2 py-1">
                Unmark Best
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => onMarkBest?.(answer.id)} className="text-xs px-2 py-1">
                Mark as Best
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Q&A Feed Component
interface QAFeedProps {
  posts: Post[];
  isLoading?: boolean;
  className?: string;
}

export function QAFeed({ posts, isLoading, className = "" }: QAFeedProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <span className="text-5xl mb-4 block">❓</span>
        <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
        <p className="text-gray-500">Be the first to ask a question!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {posts.map((post) => (
        <QAPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default QAPostForm;
