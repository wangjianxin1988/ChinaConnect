/**
 * Cloudflare Pages Function: GET /api/auth/state
 * Returns the current Supabase auth session as JSON.
 * Reads the Supabase auth cookie set by the client SDK.
 */

interface Env {}

const COOKIE_NAMES = ["sb-access-token", "sb-refresh-token"];

function readCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(/;\s*/)) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function readAuthCookie(rawValue: string | undefined): { access_token?: string; refresh_token?: string } {
  if (!rawValue) return {};
  try {
    const decoded = rawValue.startsWith("base64-") ? atob(rawValue.slice(7)) : rawValue;
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    return { access_token: rawValue };
  }
  return {};
}

function getAccessToken(cookieHeader: string | null): string | undefined {
  const cookies = readCookies(cookieHeader);
  for (const [name, value] of Object.entries(cookies)) {
    if (name.includes("-auth-token") || name === "sb-access-token") {
      const parsed = readAuthCookie(value);
      if (parsed.access_token) return parsed.access_token;
    }
  }
  for (const name of COOKIE_NAMES) {
    if (cookies[name]) return cookies[name];
  }
  return undefined;
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
  const supabaseUrl = (context.env as Record<string, string | undefined>).PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = (context.env as Record<string, string | undefined>).PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ authenticated: false, demoMode: true });
  }

  const cookieHeader = context.request.headers.get("cookie");
  const accessToken = getAccessToken(cookieHeader);
  if (!accessToken) {
    return json({ authenticated: false });
  }

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!userRes.ok) {
      return json({ authenticated: false });
    }
    const user = (await userRes.json()) as {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    };
    const meta = user.user_metadata || {};
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.display_name === "string" && meta.display_name) ||
      (user.email ? user.email.split("@")[0] : "User");
    const avatarUrl =
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      null;

    let profile: { avatar_url: string | null; display_name: string | null; nationality: string | null; level: string | null; points: number | null } | null = null;
    try {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?user_id=eq.${user.id}&select=avatar_url,display_name,nationality,level,points&limit=1`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (profileRes.ok) {
        const arr = (await profileRes.json()) as Array<{ avatar_url: string | null; display_name: string | null; nationality: string | null; level: string | null; points: number | null }>;
        if (arr && arr.length > 0) profile = arr[0];
      }
    } catch {
      // profile is optional
    }

    return json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email ?? "",
        displayName,
        avatarUrl: avatarUrl ?? profile?.avatar_url ?? null,
        profile: profile
          ? {
              displayName: profile.display_name,
              nationality: profile.nationality,
              level: profile.level,
              points: profile.points,
            }
          : null,
      },
    });
  } catch (err) {
    return json({ authenticated: false, error: String(err) });
  }
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method Not Allowed", { status: 405 });
};
