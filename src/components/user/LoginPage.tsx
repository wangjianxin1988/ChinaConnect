/**
 * LoginPage Component
 * Authentication page with email, magic link, and OAuth options
 * Supports Demo Mode for development/preview
 */

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DEMO_MODE } from "@/services/auth";
import { useState } from "react";

type AuthMode = "login" | "register" | "magic_link" | "forgot_password";

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);

  const {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signInWithLink,
    resetPassword,
    clearError,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "login") {
      await signIn(email, password);
    } else if (mode === "register") {
      await signUp({ email, password, displayName });
    } else if (mode === "magic_link") {
      const { sent, error } = await signInWithLink(email);
      if (sent) setMagicLinkSent(true);
    } else if (mode === "forgot_password") {
      const { sent } = await resetPassword(email);
      if (sent) setResetPasswordSent(true);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    await signInWithProvider(provider);
  };

  // Demo mode quick login
  const handleDemoLogin = async () => {
    clearError();
    await signIn("demo@chinaconnect.com", "demo123");
  };

  // Show loading state while redirecting
  if (user && !isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ChinaConnect</h1>
        <p className="text-gray-500 mt-1">Your AI-powered China travel companion</p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
          {[
            { id: "login", label: "Sign In" },
            { id: "register", label: "Register" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id as AuthMode);
                clearError();
              }}
              className={cn(
                "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                mode === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Magic Link / Forgot Password Tabs */}
        {(mode === "magic_link" || mode === "forgot_password") && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {mode === "magic_link"
                ? "Enter your email to receive a passwordless sign-in link."
                : "Enter your email to receive a password reset link."}
            </p>
          </div>
        )}

        {/* Success Messages */}
        {magicLinkSent && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">Check your email!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              We sent a magic link to {email}. Click the link to sign in.
            </p>
          </div>
        )}

        {resetPasswordSent && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">Check your email!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              We sent a password reset link to {email}. Click the link to reset your password.
            </p>
          </div>
        )}

        {/* Demo Mode Quick Login */}
        {DEMO_MODE && mode === "login" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 font-medium mb-2">
              Demo Mode Active
            </p>
            <p className="text-xs text-purple-600 mb-3">
              Try ChinaConnect with a demo account without signing up.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Loading..." : "Quick Demo Login"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Form */}
        {!magicLinkSent && !resetPasswordSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Register only) */}
            {mode === "register" && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Your name"
                  required={mode === "register"}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password (Login/Register only) */}
            {(mode === "login" || mode === "register") && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter your password"
                  required={mode === "login" || mode === "register"}
                  minLength={mode === "register" ? 6 : undefined}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : mode === "login" ? (
                "Sign In"
              ) : mode === "register" ? (
                "Create Account"
              ) : mode === "magic_link" ? (
                "Send Magic Link"
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {!magicLinkSent && !resetPasswordSent && (mode === "login" || mode === "register") && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuth("google")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                onClick={() => handleOAuth("github")}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                  />
                </svg>
                GitHub
              </button>
            </div>
          </>
        )}

        {/* Magic Link Toggle */}
        {!magicLinkSent && !resetPasswordSent && mode === "login" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode("magic_link")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Sign in with magic link instead
            </button>
          </div>
        )}

        {/* Back to Login */}
        {(mode === "magic_link" || mode === "forgot_password") && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
