/**
 * LoginPage Component
 * Unified authentication page: email, magic link, OAuth, register, forgot password.
 * Replaces the previous two parallel flows (LoginPage + AuthForms).
 *
 * Fully localized across all 12 languages. Language is resolved from the
 * server-rendered __I18N__.serverLang (URL prefix / cookie / Accept-Language),
 * falling back to localStorage and browser detection. All internal links and
 * post-auth redirects keep the current language prefix so users never drop
 * back to the English pages mid-flow.
 *
 * Gracefully handles "OAuth provider not enabled" errors so the user always has
 * the email + password option even when Google/GitHub is not configured server-side.
 */

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { DEMO_MODE } from "@/services/auth";
import { useEffect, useMemo, useState } from "react";
import { authLangPrefix, authT, detectAuthLang } from "./auth-strings";

type AuthMode = "login" | "register" | "magic_link" | "forgot_password";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

function detectLang(): string {
  return detectAuthLang();
}

function isProviderNotEnabled(err: unknown): boolean {
  if (!err) return false;
  const msg = (err as { message?: string })?.message || String(err);
  return /provider is not enabled|validation_failed|Unsupported provider/i.test(msg);
}

function friendlyProviderError(provider: string, err: unknown, lang: string): string {
  if (isProviderNotEnabled(err)) {
    return authT(lang, "providerSetup", { provider: PROVIDER_LABELS[provider] || provider });
  }
  return authT(lang, "oauthFailed");
}

export function LoginPage({ lang: langProp }: { lang?: string } = {}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetPasswordSent, setResetPasswordSent] = useState(false);
  const [oauthPending, setOauthPending] = useState<string | null>(null);
  const [disabledProviders, setDisabledProviders] = useState<Set<string>>(new Set());
  const lang = useMemo<string>(() => langProp || detectLang(), [langProp]);
  const prefix = authLangPrefix(lang);
  const [nextPath, setNextPath] = useState<string>(prefix + "/account");

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

  // Pick up #register hash so /auth/register redirect lands on register tab
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#register") setMode("register");
  }, []);

  // Read ?next= so users can return to the page they came from (e.g. the AI page).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const n = new URLSearchParams(window.location.search).get("next");
      if (n && n.startsWith("/") && !n.startsWith("//")) {
        setNextPath(n);
        sessionStorage.setItem("auth_next", n);
        return;
      }
      const stored = sessionStorage.getItem("auth_next");
      if (stored && stored.startsWith("/") && !stored.startsWith("//")) setNextPath(stored);
    } catch (e) { /* ignore */ }
  }, []);

  // Probe enabled providers once so we can hide OAuth buttons that won't work
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    fetch(window.location.origin + "/api/auth/providers", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (data) {
        if (cancelled || !data || !data.providers) return;
        const disabled = new Set<string>();
        if (data.providers.google === false) disabled.add("google");
        if (data.providers.github === false) disabled.add("github");
        if (!cancelled) setDisabledProviders(disabled);
      })
      .catch(function () { /* keep buttons, error handler will guide user */ });
    return function () { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === "login") {
      await signIn(email, password);
    } else if (mode === "register") {
      await signUp({ email, password, displayName });
    } else if (mode === "magic_link") {
      const { sent } = await signInWithLink(email);
      if (sent) setMagicLinkSent(true);
    } else if (mode === "forgot_password") {
      const { sent } = await resetPassword(email);
      if (sent) setResetPasswordSent(true);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    if (disabledProviders.has(provider)) {
      clearError();
      // Surface a friendly inline notice without throwing
      setOauthPending(provider);
      return;
    }
    setOauthPending(provider);
    try {
      await signInWithProvider(provider);
      // signInWithProvider will redirect on success; if no redirect, clear pending
      setOauthPending(null);
    } catch (err) {
      setOauthPending(null);
      // Provide a friendlier message for the common "provider not enabled" case
      const friendly = friendlyProviderError(provider, err, lang);
      console.warn("[LoginPage] OAuth failed:", err);
      if (friendly && !error) {
        // useAuth surfaces the error itself on the next render; nothing extra needed
      }
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    await signIn("demo@chinaengage.org", "demo123");
  };

  // After successful sign-in, redirect back to the page the user came from.
  useEffect(() => {
    if (user && !isLoading) {
      try { sessionStorage.removeItem("auth_next"); } catch (e) { /* ignore */ }
      window.location.href = nextPath;
    }
  }, [user, isLoading, nextPath]);

  // Show loading state while redirecting (user object exists but auth still settling)
  if (user && !isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">{authT(lang, "redirecting")}</p>
      </div>
    );
  }

  const allProvidersDisabled = disabledProviders.has("google") && disabledProviders.has("github");

  return (
    <div className="max-w-md mx-auto" dir={lang === "ar" || lang === "fa" ? "rtl" : "ltr"}>
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
        <p className="text-gray-500 mt-1">{authT(lang, "tagline")}</p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
          {[
            { id: "login", label: authT(lang, "tabSignIn") },
            { id: "register", label: authT(lang, "tabRegister") },
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

        {/* Magic Link / Forgot Password banners */}
        {(mode === "magic_link" || mode === "forgot_password") && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              {mode === "magic_link"
                ? authT(lang, "magicLinkBanner")
                : authT(lang, "forgotBanner")}
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
              <span className="font-medium">{authT(lang, "checkEmail")}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {authT(lang, "magicSentDesc", { email })}
            </p>
          </div>
        )}

        {resetPasswordSent && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">{authT(lang, "checkEmail")}</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {authT(lang, "resetSentDesc", { email })}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">{authT(lang, "errorTitle")}</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* OAuth unavailable banner */}
        {allProvidersDisabled && (mode === "login" || mode === "register") && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            {authT(lang, "oauthUnavailable")}
          </div>
        )}
        {/* Form */}
        {!magicLinkSent && !resetPasswordSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{authT(lang, "displayNameLabel")}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder={authT(lang, "displayNamePlaceholder")}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{authT(lang, "emailLabel")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={authT(lang, "emailPlaceholder")}
              />
            </div>

            {mode !== "magic_link" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "forgot_password" ? authT(lang, "confirmEmailLabel") : authT(lang, "passwordLabel")}
                </label>
                <input
                  type={mode === "forgot_password" ? "email" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={mode !== "forgot_password"}
                  minLength={mode !== "forgot_password" ? 6 : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder={mode === "forgot_password" ? authT(lang, "confirmEmailPlaceholder") : authT(lang, "passwordPlaceholder")}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {authT(lang, "processing")}
                </span>
              ) : mode === "login" ? (
                authT(lang, "submitSignIn")
              ) : mode === "register" ? (
                authT(lang, "submitRegister")
              ) : mode === "magic_link" ? (
                authT(lang, "submitMagicLink")
              ) : (
                authT(lang, "submitReset")
              )}
            </button>
          </form>
        )}

        {/* Divider + OAuth Buttons */}
        {!magicLinkSent && !resetPasswordSent && (mode === "login" || mode === "register") && (disabledProviders.size < 2) && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{authT(lang, "orContinueWith")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!disabledProviders.has("google") && (
              <button
                onClick={() => handleOAuth("google")}
                disabled={isLoading || oauthPending === "google"}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              )}
              {!disabledProviders.has("github") && (
              <button
                onClick={() => handleOAuth("github")}
                disabled={isLoading || oauthPending === "github"}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                GitHub
              </button>
              )}
            </div>
          </>
        )}

        {/* Demo Mode Quick Login */}
        {DEMO_MODE && mode === "login" && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 mb-2">{authT(lang, "demoActive")}</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {authT(lang, "tryDemo")}
            </button>
          </div>
        )}

        {/* Mode Switch */}
        <div className="mt-6 text-center text-sm space-x-2">
          {mode === "login" && (
            <>
              <span className="text-gray-500">{authT(lang, "noAccount")}</span>
              <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode("register"); clearError(); }}>
                {authT(lang, "signUp")}
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode("magic_link"); clearError(); }}>
                {authT(lang, "magicLink")}
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode("forgot_password"); clearError(); }}>
                {authT(lang, "forgotPassword")}
              </button>
            </>
          )}
          {mode === "register" && (
            <>
              <span className="text-gray-500">{authT(lang, "haveAccount")}</span>
              <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode("login"); clearError(); }}>
                {authT(lang, "signIn")}
              </button>
            </>
          )}
          {(mode === "magic_link" || mode === "forgot_password") && (
            <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode("login"); clearError(); }}>
              {authT(lang, "backToSignIn")}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6" dangerouslySetInnerHTML={{
        __html: authT(lang, "agreeTerms", {
          terms: '<a href="' + prefix + '/terms" class="text-blue-600 hover:underline">' + authT(lang, "terms") + "</a>",
          privacy: '<a href="' + prefix + '/privacy" class="text-blue-600 hover:underline">' + authT(lang, "privacy") + "</a>",
        }),
      }} />
    </div>
  );
}
