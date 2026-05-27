/**
 * Community Widget Component for Flarum Integration
 *
 * Provides seamless integration between ChinaConnect and Flarum forum.
 * Supports both iframe embedding and redirect modes.
 *
 * @module flarum/CommunityWidget
 */

import { Button } from "@/components/ui/button";
import { generateSSOUrl, getFlarumSSOConfig } from "@/lib/flarum/sso-client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

/**
 * Integration mode options
 */
export type CommunityEmbedMode = "iframe" | "redirect" | "button";

/**
 * Component props
 */
export interface CommunityWidgetProps {
  /** Current authenticated user from Supabase */
  user: User | null;
  /** User profile data from ChinaConnect */
  profile?: {
    displayName?: string;
    avatarUrl?: string;
    userLevel?: string;
  };
  /** Embedding mode */
  mode?: CommunityEmbedMode;
  /** Flarum URL (defaults to env PUBLIC_FLARUM_URL) */
  forumUrl?: string;
  /** Initial path to redirect to after SSO */
  initialPath?: string;
  /** iFrame height */
  height?: string;
  /** CSS class name */
  className?: string;
  /** Show login prompt for non-authenticated users */
  showLoginPrompt?: boolean;
}

/**
 * SSO loading state
 */
interface SSOLoadingState {
  isLoading: boolean;
  error: string | null;
  redirectUrl: string | null;
}

/**
 * Community Widget Component
 *
 * Provides a unified interface to the Flarum community forum with SSO.
 *
 * @example
 * ```tsx
 * // With full features (SSO, iframe embed)
 * <CommunityWidget
 *   user={supabaseUser}
 *   profile={{ displayName: "John", userLevel: "探索者" }}
 *   mode="iframe"
 *   height="600px"
 * />
 *
 * // Simple button redirect
 * <CommunityWidget
 *   user={supabaseUser}
 *   mode="button"
 *   forumUrl="https://forum.example.com"
 * />
 * ```
 */
export function CommunityWidget({
  user,
  profile,
  mode = "iframe",
  forumUrl,
  initialPath = "",
  height = "600px",
  className = "",
  showLoginPrompt = true,
}: CommunityWidgetProps) {
  const [ssoState, setSsoState] = useState<SSOLoadingState>({
    isLoading: false,
    error: null,
    redirectUrl: null,
  });

  // Get Flarum config
  const flarumConfig = getFlarumSSOConfig();
  const effectiveForumUrl = forumUrl || flarumConfig?.baseUrl || "";

  // Generate SSO URL when user is authenticated and in redirect mode
  useEffect(() => {
    if (mode === "redirect" && user && flarumConfig) {
      generateSSOUrl(user, flarumConfig, profile)
        .then(({ url }) => {
          setSsoState({
            isLoading: false,
            error: null,
            redirectUrl: url + (initialPath ? `&return=${encodeURIComponent(initialPath)}` : ""),
          });
        })
        .catch((error) => {
          setSsoState({
            isLoading: false,
            error: error.message || "Failed to generate SSO URL",
            redirectUrl: null,
          });
        });
    }
  }, [mode, user, flarumConfig, profile, initialPath]);

  // Auto-redirect in redirect mode when URL is ready
  useEffect(() => {
    if (mode === "redirect" && ssoState.redirectUrl && !ssoState.isLoading) {
      window.location.href = ssoState.redirectUrl;
    }
  }, [mode, ssoState.redirectUrl, ssoState.isLoading]);

  // Not authenticated state
  if (!user) {
    if (!showLoginPrompt) {
      return null;
    }

    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ minHeight: height }}
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold mb-2">Join the Community</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to access the ChinaConnect community forum. Connect with fellow travelers, share
            experiences, and get answers to your questions.
          </p>
          <a href="/auth">
            <Button size="lg">Sign In to Access Forum</Button>
          </a>
        </div>
      </div>
    );
  }

  // Flarum not configured
  if (!effectiveForumUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 ${className}`}
        style={{ minHeight: height }}
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Forum Setup Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The community forum is not configured yet. Please contact the administrator to set up
            the Flarum integration.
          </p>
          <p className="text-sm text-gray-500">
            Required environment variables: PUBLIC_FLARUM_URL, FLARUM_SSO_SECRET, FLARUM_API_KEY
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (ssoState.error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 ${className}`}
        style={{ minHeight: height }}
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{ssoState.error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Redirect mode
  if (mode === "redirect") {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 ${className}`}
        style={{ minHeight: height }}
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4 animate-pulse">🔄</div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to Forum</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You are being redirected to the community forum with automatic login...
          </p>
          <p className="text-sm text-gray-500">
            If you are not redirected,{" "}
            <a
              href={ssoState.redirectUrl || effectiveForumUrl}
              className="text-blue-600 hover:underline"
            >
              click here
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Button mode
  if (mode === "button") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <a
          href={ssoState.redirectUrl || effectiveForumUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" disabled={ssoState.isLoading}>
            🌐 Open Community Forum
          </Button>
        </a>
        {profile?.userLevel && (
          <span className="text-sm text-gray-500">
            Logged in as {profile.displayName || "User"} ({profile.userLevel})
          </span>
        )}
      </div>
    );
  }

  // iFrame mode (default)
  const iframeSrc = ssoState.redirectUrl
    ? ssoState.redirectUrl
    : `${effectiveForumUrl}${initialPath ? `?return=${encodeURIComponent(initialPath)}` : ""}`;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Loading overlay */}
      {ssoState.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Connecting to forum...</p>
          </div>
        </div>
      )}

      {/* iFrame embed */}
      <iframe
        src={iframeSrc}
        title="ChinaConnect Community Forum"
        className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ minHeight: height }}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />

      {/* Fallback link */}
      <div className="absolute bottom-2 right-2">
        <a
          href={effectiveForumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Open in new tab ↗
        </a>
      </div>
    </div>
  );
}

/**
 * Simplified community button component
 * Useful for navigation bars or compact layouts
 */
export interface CommunityButtonProps {
  /** Current user */
  user: User | null;
  /** User profile */
  profile?: {
    displayName?: string;
    avatarUrl?: string;
    userLevel?: string;
  };
  /** Button variant */
  variant?: "default" | "outline" | "ghost";
  /** Button size */
  size?: "sm" | "lg";
  /** Additional CSS class */
  className?: string;
}

export function CommunityButton({
  user,
  profile,
  variant = "default",
  size = "sm",
  className = "",
}: CommunityButtonProps) {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const flarumConfig = getFlarumSSOConfig();
  const forumUrl = flarumConfig?.baseUrl || import.meta.env.PUBLIC_FLARUM_URL;

  useEffect(() => {
    if (user && flarumConfig) {
      generateSSOUrl(user, flarumConfig, profile)
        .then(({ url }) => setRedirectUrl(url))
        .catch(() => setRedirectUrl(forumUrl || "#"));
    } else {
      setRedirectUrl(forumUrl || "#");
    }
  }, [user, flarumConfig, profile, forumUrl]);

  const isDisabled = Boolean(!forumUrl || (user && !redirectUrl));

  return (
    <a
      href={user ? redirectUrl || "#" : "/auth"}
      target={user ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={className}
    >
      <Button variant={variant} size={size} disabled={isDisabled}>
        🌐 Community
      </Button>
    </a>
  );
}

export default CommunityWidget;
