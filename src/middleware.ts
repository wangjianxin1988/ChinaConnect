/**
 * Astro Middleware — Auth Guard
 *
 * Checks session on protected routes (/account, /profile) and redirects
 * unauthenticated users to /auth/login.
 *
 * Injects `Astro.locals.user` and `Astro.locals.session` for
 * use in page components.
 *
 * NOTE: For static output, auth protection is handled client-side.
 * The middleware runs at build time for SSG and at request time for SSR/hybrid.
 * 
 * Cookie Detection:
 * - Supabase JS v2 defaults to localStorage for session storage
 * - This middleware checks cookies for backward compatibility
 * - For production, consider using @supabase/ssr for proper cookie support
 * - When no cookies are present (build-time or first visit), pages are allowed through
 * - Client-side JS handles the runtime auth check and redirect
 */

import { createClient } from "@supabase/supabase-js";
import { defineMiddleware } from "astro:middleware";

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/account"];
// Public auth pages that redirect to account if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect, cookies } = context;
  const pathname = url.pathname;

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Check if this is an auth page
  const isAuthPage = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Skip middleware for non-auth routes
  if (!isProtected && !isAuthPage) {
    return next();
  }

  // Read Supabase config from environment
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return next();
  }

  // Try to find auth tokens from cookies
  // Supabase JS v2 stores tokens in cookies like sb-<ref>-auth-token
  let accessToken: string | undefined;

  // Look for Supabase session cookie patterns
  // cookies.getAll() may not exist during static build — guard it
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
    // Static build — no cookies available
  }

  // Also check for simple cookie names used by some setups
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
      // Token invalid — treat as unauthenticated
    }
  }

  // Inject user into locals
  context.locals.user = user;
  context.locals.session = user ? { access_token: accessToken } : null;

  // If no cookies at all (build-time or first visit), let the page through
  // Client-side JS will handle the auth check and redirect
  if (!accessToken) {
    return next();
  }

  // Protected route with invalid/expired token: redirect to login
  if (isProtected && !user) {
    return redirect("/auth/login");
  }

  // Auth page with valid session: redirect to account
  if (isAuthPage && user) {
    return redirect("/account");
  }

  return next();
});
