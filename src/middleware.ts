// @ts-nocheck
/**
 * Astro Middleware — Auth Guard + Language Detection
 *
 * 1. Auth: Checks session on protected routes
 * 2. Language: Detects user language from query param, cookie, or Accept-Language header
 *    Injects into locals for server-side rendering
 */

import { createClient } from "@supabase/supabase-js";
import { defineMiddleware } from "astro:middleware";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/account"];
// Public auth pages that redirect to account if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

// Supported languages
const SUPPORTED = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"] as const;
type Language = (typeof SUPPORTED)[number];

/**
 * Detect language from Accept-Language header
 */
function detectFromHeader(acceptLang: string | null): Language | null {
  if (!acceptLang) return null;

  // Parse Accept-Language: "ja,en-US;q=0.9,zh-CN;q=0.8"
  const langs = acceptLang
    .split(",")
    .map((part) => {
      const [code, q] = part.trim().split(";q=");
      return { code: code.trim(), q: q ? Number.parseFloat(q) : 1.0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of langs) {
    // Exact match
    if ((SUPPORTED as readonly string[]).includes(code)) return code as Language;
    // Prefix match: "ja-JP" → "ja"
    const prefix = code.split("-")[0];
    if ((SUPPORTED as readonly string[]).includes(prefix)) return prefix as Language;
    // Special: "zh" → "zh-CN", "zh-TW"/"zh-Hant" → "zh-TW"
    if (prefix === "zh") {
      if (code.includes("TW") || code.includes("Hant") || code.includes("HK")) return "zh-TW";
      return "zh-CN";
    }
  }
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect, cookies } = context;
  const pathname = url.pathname;
  const params = url.searchParams;

  // =========================================================================
  // Language Detection (runs on ALL routes)
  // Priority: ?lang=XX query param > cookie > Accept-Language header
  // =========================================================================

  let detectedLang: Language = "en";

  // 1. Query parameter (highest priority, also used for hreflang)
  const queryLang = params.get("lang");
  if (queryLang && (SUPPORTED as readonly string[]).includes(queryLang)) {
    detectedLang = queryLang as Language;
  } else {
    // 2. Cookie
    const cookieLang = cookies.get("chinaconnect_language")?.value;
    if (cookieLang && (SUPPORTED as readonly string[]).includes(cookieLang)) {
      detectedLang = cookieLang as Language;
    } else {
      // 3. Accept-Language header (server-side detection)
      const acceptLang = context.request.headers.get("Accept-Language");
      const headerLang = detectFromHeader(acceptLang);
      if (headerLang) {
        detectedLang = headerLang;
      }
    }
  }

  // Inject language into locals for use in pages
  context.locals.lang = detectedLang;

  // If lang was set via query param, persist to cookie
  if (queryLang && (SUPPORTED as readonly string[]).includes(queryLang)) {
    cookies.set("chinaconnect_language", queryLang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  // =========================================================================
  // Auth Guard (existing logic)
  // =========================================================================

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected && !isAuthPage) {
    return next();
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return next();
  }

  let accessToken: string | undefined;

  try {
    const allCookiesList = typeof cookies.getAll === "function" ? cookies.getAll() : [];
    for (const cookie of allCookiesList) {
      if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
        try {
          const parsed = JSON.parse(cookie.value);
          accessToken = parsed.access_token;
        } catch {
          accessToken = cookie.value;
        }
        break;
      }
    }
  } catch {
    // Static build
  }

  if (!accessToken) {
    accessToken = cookies.get("sb-access-token")?.value;
  }

  let user = null;

  if (accessToken) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) {
        user = data.user;
      }
    } catch {
      // Token invalid
    }
  }

  context.locals.user = user;
  context.locals.session = user ? { access_token: accessToken } : null;

  if (!accessToken) {
    return next();
  }

  if (isProtected && !user) {
    return redirect("/auth/login");
  }

  if (isAuthPage && user) {
    return redirect("/account");
  }

  return next();
});
