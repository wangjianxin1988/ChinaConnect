/**
 * BadgeDisplay Component
 * Displays user badges with categories and tiers
 */

import { cn } from "@/lib/utils";
import type { BadgeCategory, BadgeTier, EarnedBadge } from "@/types/user";

interface BadgeDisplayProps {
  badges: EarnedBadge[];
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  maxDisplay?: number;
  className?: string;
}

const tierColors: Record<BadgeTier, { bg: string; border: string; text: string; icon: string }> = {
  bronze: {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-700",
    icon: "text-amber-500",
  },
  silver: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    text: "text-gray-700",
    icon: "text-gray-500",
  },
  gold: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-700",
    icon: "text-yellow-500",
  },
  platinum: {
    bg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-700",
    icon: "text-purple-500",
  },
};

const categoryIcons: Record<BadgeCategory, string> = {
  exploration: "compass",
  food: "utensils",
  social: "users",
  achievement: "trophy",
  streak: "flame",
};

// Badge icon SVGs
const badgeIcons: Record<string, JSX.Element> = {
  "map-pin": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  compass: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  globe: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  plane: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  ),
  utensils: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  star: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  flame: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  calendar: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  trophy: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  crown: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  ),
  pen: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  book: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  feather: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  ),
  heart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

const sizeClasses = {
  sm: { badge: "h-8 w-8", icon: "h-4 w-4", text: "text-xs" },
  md: { badge: "h-12 w-12", icon: "h-6 w-6", text: "text-sm" },
  lg: { badge: "h-16 w-16", icon: "h-8 w-8", text: "text-base" },
};

export function BadgeDisplay({
  badges,
  size = "md",
  showDetails = false,
  maxDisplay,
  className,
}: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remaining = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

  if (badges.length === 0) {
    return (
      <div className={cn("text-gray-400 text-sm italic", className)}>No badges earned yet</div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} size={size} showDetails={showDetails} />
        ))}
        {remaining > 0 && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium",
              sizeClasses[size].badge,
              sizeClasses[size].text,
            )}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// BadgeItem Component
// ============================================

interface BadgeItemProps {
  badge: EarnedBadge;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

export function BadgeItem({ badge, size = "md", showDetails = false, className }: BadgeItemProps) {
  const colors = tierColors[badge.tier];
  const icon = badgeIcons[badge.icon] || badgeIcons.star;
  const classes = sizeClasses[size];

  const badgeElement = (
    <div className={cn("group relative flex flex-col items-center gap-1", className)}>
      {/* Badge icon container */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 bg-white p-1 shadow-sm transition-transform hover:scale-110",
          colors.bg,
          colors.border,
          classes.badge,
        )}
      >
        <div className={cn("text-current", colors.icon)}>{icon}</div>

        {/* Tier indicator */}
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border bg-white px-1 text-xs",
            colors.border,
          )}
        >
          {badge.tier.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Badge name (shown in details mode) */}
      {showDetails && (
        <span className={cn("font-medium text-center", colors.text, classes.text)}>
          {badge.name}
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
          <div className="font-semibold">{badge.name}</div>
          <div className="text-gray-300 text-xs">{badge.description}</div>
          {badge.earned_at && (
            <div className="text-gray-400 text-xs mt-1">
              Earned {new Date(badge.earned_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BadgeGrid Component (for badge showcase)
// ============================================

interface BadgeGridProps {
  badges: EarnedBadge[];
  category?: BadgeCategory;
  className?: string;
}

export function BadgeGrid({ badges, category, className }: BadgeGridProps) {
  const filteredBadges = category ? badges.filter((b) => b.category === category) : badges;

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4", className)}>
      {filteredBadges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} size="lg" showDetails />
      ))}
    </div>
  );
}

// ============================================
// BadgeSkeleton Component
// ============================================

interface BadgeSkeletonProps {
  count?: number;
  className?: string;
}

export function BadgeSkeleton({ count = 4, className }: BadgeSkeletonProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
      ))}
    </div>
  );
}
