/**
 * ResetPasswordPage Component
 * Set-a-new-password page reached from the Supabase password-recovery email.
 * Localized across all 12 languages; keeps the language prefix on all links
 * and redirects so the flow never drops back to English.
 */

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import { authLangPrefix, authT, detectAuthLang } from "./auth-strings";

function detectLang(): string {
  return detectAuthLang();
}

export function ResetPasswordPage({ lang: langProp }: { lang?: string } = {}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const lang = useMemo<string>(() => langProp || detectLang(), [langProp]);
  const prefix = authLangPrefix(lang);

  const { updatePassword, error, isLoading, clearError } = useAuth({ autoLoadProfile: false });

  // When the recovery token is consumed, send the user to their account page.
  useEffect(() => {
    if (done && !isLoading) {
      try { sessionStorage.removeItem("auth_next"); } catch (e) { /* ignore */ }
      window.location.href = prefix + "/account";
    }
  }, [done, isLoading, prefix]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (password.length < 8) {
      setFormError(authT(lang, "passwordPlaceholder"));
      return;
    }
    if (password !== confirm) {
      setFormError(authT(lang, "resetInvalid"));
      return;
    }

    const ok = await updatePassword(password);
    if (ok) {
      setDone(true);
    } else if (!error) {
      setFormError(authT(lang, "updateFailed"));
    }
  };

  return (
    <div className="max-w-md mx-auto" dir={lang === "ar" || lang === "fa" ? "rtl" : "ltr"}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{authT(lang, "resetTitle")}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {done ? (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="font-medium">{authT(lang, "resetDone")}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{authT(lang, "newPasswordLabel")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={authT(lang, "newPasswordPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{authT(lang, "confirmPasswordLabel")}</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder={authT(lang, "newPasswordPlaceholder")}
              />
            </div>

            {(formError || error) && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {formError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? authT(lang, "processing") : authT(lang, "resetSubmit")}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        <a href={prefix + "/auth/login"} className="text-blue-600 hover:underline">
          {authT(lang, "resetLinkToLogin")}
        </a>
      </p>
    </div>
  );
}
