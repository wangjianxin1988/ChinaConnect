/**
 * UserAvatar Component
 * Displays user avatar with fallback to initials
 */

import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

interface UserAvatarProps {
  user:
    | (Pick<UserProfile, "display_name" | "avatar_url"> & Partial<Pick<UserProfile, "level">>)
    | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLevel?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const levelColors: Record<string, string> = {
  小白: "bg-gray-100 text-gray-600 border-gray-300",
  探索者: "bg-green-100 text-green-700 border-green-300",
  旅行家: "bg-blue-100 text-blue-700 border-blue-300",
  中国通: "bg-purple-100 text-purple-700 border-purple-300",
  传奇: "bg-amber-100 text-amber-700 border-amber-300",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Handle Supabase storage URLs
  if (url.startsWith("http")) return url;
  // Handle Supabase storage paths
  if (url.startsWith("avatars/") || url.startsWith("avatars")) {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  }
  return null;
}

export function UserAvatar({ user, size = "md", showLevel = false, className }: UserAvatarProps) {
  const initials = getInitials(user?.display_name);
  const avatarUrl = getAvatarUrl(user?.avatar_url);
  const level = user?.level || "小白";
  const levelColor = levelColors[level] || levelColors.小白;

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.display_name || "User avatar"}
          className={cn(
            "rounded-full object-cover border-2 bg-gray-50",
            sizeClasses[size],
            showLevel && levelColor.split(" ")[1],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 font-medium text-gray-600",
            sizeClasses[size],
            showLevel && levelColor,
          )}
        >
          {initials}
        </div>
      )}

      {/* Level indicator dot */}
      {showLevel && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            level === "小白" && "bg-gray-400",
            level === "探索者" && "bg-green-500",
            level === "旅行家" && "bg-blue-500",
            level === "中国通" && "bg-purple-500",
            level === "传奇" && "bg-amber-500",
          )}
          title={level}
        />
      )}
    </div>
  );
}

// ============================================
// UserAvatarGroup Component
// ============================================

interface UserAvatarGroupProps {
  users: Pick<UserProfile, "display_name" | "avatar_url">[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatarGroup({ users, max = 4, size = "sm", className }: UserAvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visibleUsers.map((user, index) => (
        <div
          key={index}
          className={cn("relative rounded-full border-2 border-white", index > 0 && "-ml-2")}
        >
          <UserAvatar user={user} size={size} />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            "relative -ml-2 flex items-center justify-center rounded-full border-2 border-white bg-gray-100 font-medium text-gray-600",
            sizeClasses[size],
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// ============================================
// UserAvatarSkeleton Component
// ============================================

interface UserAvatarSkeletonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatarSkeleton({ size = "md", className }: UserAvatarSkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-full bg-gray-200", sizeClasses[size], className)} />
  );
}
