/**
 * Authentication Forms for ChinaConnect
 * Supports: Email/Password, Google OAuth, GitHub OAuth, Phone SMS
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  signInWithEmail,
  signInWithOAuth,
  signInWithPhone,
  signUpWithEmail,
  verifyPhoneOTP,
} from "@/supabase/config";
import type { Database } from "@/types/database";
import { useState } from "react";

type AuthMode = "login" | "register" | "phone";
type OAuthProvider = "google" | "github";

interface AuthFormProps {
  onSuccess?: (user: Database["public"]["Tables"]["profiles"]["Row"]) => void;
  onError?: (error: Error) => void;
  initialMode?: AuthMode;
}

export function AuthForms({ onSuccess, onError, initialMode = "login" }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const { user, error } = await signUpWithEmail(email, password, displayName);
        if (error) throw error;
        if (user) {
          onSuccess?.(user);
        }
      } else {
        const { user, error } = await signInWithEmail(email, password);
        if (error) throw error;
        if (user) {
          // Fetch full profile
          const profile = user as unknown as Database["public"]["Tables"]["profiles"]["Row"];
          onSuccess?.(profile);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthAuth = async (provider: OAuthProvider) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
      // OAuth will redirect, so no need to call onSuccess here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "OAuth failed";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!otpSent) {
        // Send OTP
        const { error } = await signInWithPhone(phone);
        if (error) throw error;
        setOtpSent(true);
      } else {
        // Verify OTP
        const { user, error } = await verifyPhoneOTP(phone, otp);
        if (error) throw error;
        if (user) {
          const profile = user as unknown as Database["public"]["Tables"]["profiles"]["Row"];
          onSuccess?.(profile);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Phone authentication failed";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === "login" && "Welcome Back"}
        {mode === "register" && "Create Account"}
        {mode === "phone" && (otpSent ? "Enter OTP" : "Phone Login")}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {/* Email/Password Form */}
      {mode !== "phone" && (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      )}

      {/* Phone Form */}
      {mode === "phone" && (
        <form onSubmit={handlePhoneAuth} className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+86 138 8888 8888"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </>
          )}
        </form>
      )}

      {/* OAuth Buttons */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthAuth("google")}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthAuth("github")}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="mt-6 text-center text-sm">
        {mode === "login" && (
          <>
            <span className="text-gray-500">Don't have an account? </span>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setMode("register")}
            >
              Sign up
            </button>
            <span className="text-gray-500"> | </span>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setMode("phone")}
            >
              Phone login
            </button>
          </>
        )}
        {mode === "register" && (
          <>
            <span className="text-gray-500">Already have an account? </span>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
          </>
        )}
        {mode === "phone" && (
          <>
            <span className="text-gray-500">Prefer email? </span>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                setMode("login");
                setOtpSent(false);
              }}
            >
              Email login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthForms;
