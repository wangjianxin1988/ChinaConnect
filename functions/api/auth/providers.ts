/**
 * Cloudflare Pages Function: GET /api/auth/providers
 * Reports which OAuth providers are enabled. Used by the login page to
 * grey out buttons that would otherwise error with "provider is not enabled".
 *
 * Primary source of truth: the public Supabase GoTrue endpoint
 * GET {PUBLIC_SUPABASE_URL}/auth/v1/settings (requires the anon key, which is
 * public by design). It reflects the real provider config live, so enabling a
 * provider in the Supabase dashboard lights the button up with no redeploy.
 *
 * Fallback: the `OAUTH_PROVIDERS_ENABLED` env var (comma-separated, e.g.
 * "google,github"). If both are unavailable, defaults to "none enabled"
 * (safe default — better UX than showing the raw Supabase 400 error).
 */

interface Env {
  OAUTH_PROVIDERS_ENABLED?: string;
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
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

interface SettingsResponse {
  external?: Record<string, boolean>;
  disable_signup?: boolean;
}

async function probeSupabase(env: Env): Promise<SettingsResponse | null> {
  const url = env.PUBLIC_SUPABASE_URL;
  const anonKey = env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as SettingsResponse;
    if (!body || typeof body.external !== "object" || body.external === null) return null;
    return body;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const live = await probeSupabase(env);
  if (live && live.external) {
    const ext = live.external;
    return json({
      providers: {
        google: ext.google === true,
        github: ext.github === true,
        email: ext.email !== false,
      },
      configured: ext.google === true || ext.github === true,
      source: "supabase",
      disableSignup: live.disable_signup === true,
    });
  }

  // Fallback allowlist (kept for environments without a reachable Supabase).
  const allowlist = (env.OAUTH_PROVIDERS_ENABLED || "")
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
    source: "allowlist",
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method Not Allowed", { status: 405 });
};
