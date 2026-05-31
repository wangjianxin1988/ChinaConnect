/**
 * AuthButton React Component
 * Drop into the navbar to show Login button or user avatar dropdown.
 * Uses Supabase auth state via the shared auth module.
 */

import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  signOut,
} from "@/lib/auth/supabase-auth";
import { useCallback, useEffect, useRef, useState } from "react";

interface UserState {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export function AuthButton({ className }: { className?: string }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load user on mount
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!mounted || !currentUser) {
          if (mounted) setIsLoading(false);
          return;
        }

        const { profile } = await getUserProfile(currentUser.id);
        if (!mounted) return;

        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
          displayName:
            profile?.display_name ||
            currentUser.email?.split("@")[0] ||
            "User",
          avatarUrl: profile?.avatar_url || null,
        });
      } catch (err) {
        console.error("[AuthButton] Failed to load user:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, authUser) => {
      if (event === "SIGNED_IN" && authUser) {
        const { profile } = await getUserProfile(authUser.id);
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          displayName:
            profile?.display_name ||
            authUser.email?.split("@")[0] ||
            "User",
          avatarUrl: profile?.avatar_url || null,
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = useCallback(async () => {
    setMenuOpen(false);
    await signOut();
    setUser(null);
    window.location.href = "/";
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("w-9 h-9 rounded-full bg-gray-200 animate-pulse", className)} />
    );
  }

  // Not authenticated — show Login button
  if (!user) {
    return (
      <a
        href="/auth/login"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors",
          className,
        )}
      >
        Sign In
      </a>
    );
  }

  // Authenticated — show avatar + dropdown
  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {user.displayName}
        </span>
        <svg
          className={cn("w-4 h-4 text-gray-400 transition-transform", menuOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <a
            href="/account"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </a>
          <a
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </a>

          <div className="border-t border-gray-100 my-1" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthButton;
