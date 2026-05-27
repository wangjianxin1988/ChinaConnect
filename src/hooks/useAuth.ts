/**
 * useAuth Hook
 * React hook for authentication state and operations
 */

import {
  resetPassword as authResetPassword,
  signOut as authSignOut,
  updatePassword as authUpdatePassword,
  updateProfile as authUpdateProfile,
  getCurrentProfile,
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signInWithMagicLink,
  signInWithOAuth,
  signUpWithEmail,
  verifyMagicLink,
} from "@/services/auth";
import type { AuthProvider, SignUpData, User, UserProfile } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

// ============================================
// Hook Types
// ============================================

export interface UseAuthOptions {
  /** Auto-fetch profile on mount */
  autoLoadProfile?: boolean;
  /** Redirect URL for OAuth and magic link */
  redirectTo?: string;
}

export interface UseAuthReturn {
  // State
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signInWithProvider: (provider: AuthProvider) => Promise<void>;
  signInWithLink: (email: string) => Promise<{ sent: boolean; error: string | null }>;
  verifyEmailLink: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<
      Pick<UserProfile, "display_name" | "avatar_url" | "bio" | "nationality" | "native_language">
    >,
  ) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ sent: boolean; error: string | null }>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ============================================
// Hook Implementation
// ============================================

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { autoLoadProfile = true, redirectTo } = options;

  // State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        setIsLoading(true);

        // Check for magic link callback
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("token_hash") || urlParams.has("confirmation_token")) {
          const { user: magicLinkUser, error: magicError } = await verifyMagicLink();
          if (isMounted) {
            if (magicError) {
              setError(magicError.message);
            } else if (magicLinkUser) {
              setUser(magicLinkUser);
            }
          }
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Load current user
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);

          // Load profile if user exists
          if (currentUser && autoLoadProfile) {
            const { profile: userProfile, error: profileError } = await getCurrentProfile();
            if (isMounted) {
              if (profileError) {
                console.warn("Failed to load profile:", profileError);
              } else {
                setProfile(userProfile);
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load user");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = onAuthStateChange((authState) => {
      if (isMounted) {
        setUser(authState.user);
        setProfile(authState.profile);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [autoLoadProfile]);

  // ============================================
  // Computed
  // ============================================

  const isAuthenticated = !!user;

  // ============================================
  // Actions
  // ============================================

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { user: authUser, error: authError } = await signInWithEmail(email, password);

      if (authError) {
        setError(authError.message);
        return false;
      }

      if (authUser) {
        setUser(authUser);

        // Load profile
        const { profile: userProfile } = await getCurrentProfile();
        setProfile(userProfile);

        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { user: newUser, error: signUpError } = await signUpWithEmail(data);

      if (signUpError) {
        setError(signUpError.message);
        return false;
      }

      if (newUser) {
        setUser(newUser);
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: AuthProvider): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await signInWithOAuth(provider);
      // OAuth will redirect, so we don't set loading to false here
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth sign in failed");
      setIsLoading(false);
    }
  }, []);

  const signInWithLink = useCallback(
    async (email: string): Promise<{ sent: boolean; error: string | null }> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: linkError } = await signInWithMagicLink(email, redirectTo);

        if (linkError) {
          setError(linkError.message);
          return { sent: false, error: linkError.message };
        }

        return { sent: true, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send magic link";
        setError(message);
        return { sent: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [redirectTo],
  );

  const verifyEmailLink = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { user: verifiedUser, error: verifyError } = await verifyMagicLink();

      if (verifyError) {
        setError(verifyError.message);
        return false;
      }

      if (verifiedUser) {
        setUser(verifiedUser);

        // Load profile
        const { profile: userProfile } = await getCurrentProfile();
        setProfile(userProfile);

        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email verification failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: signOutError } = await authSignOut();

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<
        Pick<UserProfile, "display_name" | "avatar_url" | "bio" | "nationality" | "native_language">
      >,
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { profile: updatedProfile, error: updateError } = await authUpdateProfile(updates);

        if (updateError) {
          setError(updateError.message);
          return false;
        }

        if (updatedProfile) {
          setProfile(updatedProfile);
          return true;
        }

        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Profile update failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ sent: boolean; error: string | null }> => {
      try {
        setIsLoading(true);
        setError(null);

        const { error: resetError } = await authResetPassword(email);

        if (resetError) {
          setError(resetError.message);
          return { sent: false, error: resetError.message };
        }

        return { sent: true, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Password reset failed";
        setError(message);
        return { sent: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: passwordError } = await authUpdatePassword(newPassword);

      if (passwordError) {
        setError(passwordError.message);
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      if (!user) return;

      const { profile: userProfile, error } = await getCurrentProfile();
      if (!error && userProfile) {
        setProfile(userProfile);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, [user]);

  // ============================================
  // Return
  // ============================================

  return {
    // State
    user,
    profile,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    signIn,
    signUp,
    signInWithProvider,
    signInWithLink,
    verifyEmailLink,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
    refreshUser,
    refreshProfile,
  };
}
