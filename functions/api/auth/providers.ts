/**
 * Cloudflare Pages Function: GET /api/auth/providers
 * Reports which OAuth providers are enabled. Used by the login page to
 * grey out buttons that would otherwise error with "provider is not enabled".
 *
 * The Supabase auth providers endpoint requires the service-role key
 * (admin API), which we cannot use from a public Pages Function. Instead,
 * we use a build/runtime configurable allowlist via the
 * `OAUTH_PROVIDERS_ENABLED` env var (comma-separated, e.g. "google,github").
 *
 * If unset, we default to "none enabled" (safe default — better UX than
 * showing the raw Supabase 400 "provider is not enabled" error).
 */

interface Env {
  OAUTH_PROVIDERS_ENABLED?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const allowlist = (context.env.OAUTH_PROVIDERS_ENABLED || "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const enabled = (p: string) => allowlist.includes(p);

  return json({
    providers: {
      google: enabled("google"),
      github: enabled("github"),
      email: true,
    },
    configured: allowlist.length > 0,
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method Not Allowed", { status: 405 });
};