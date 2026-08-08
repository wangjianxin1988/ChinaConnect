/**
 * Cloudflare Pages Function: POST /api/auth/signout
 * Clears Supabase auth cookies and (best-effort) invalidates the session server-side.
 */

interface Env {}

function parseCookies(header: string | null): Array<{ name: string; value: string }> {
  if (!header) return [];
  const out: Array<{ name: string; value: string }> = [];
  for (const part of header.split(/;\s*/)) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!name) continue;
    out.push({ name, value: decodeURIComponent(value) });
  }
  return out;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const supabaseUrl = (context.env as Record<string, string | undefined>).PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = (context.env as Record<string, string | undefined>).PUBLIC_SUPABASE_ANON_KEY || "";

  const cookies = parseCookies(context.request.headers.get("cookie"));
  const toClear = cookies.filter((c) =>
    c.name.startsWith("sb-") ||
    c.name.includes("-auth-token") ||
    c.name === "sb-access-token" ||
    c.name === "sb-refresh-token",
  );

  // Best-effort server-side sign-out
  if (supabaseUrl && supabaseAnonKey) {
    try {
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
    } catch {
      // ignore - client will also clear its session
    }
  }

  const headers = new Headers({
    "Content-Type": "application/json",
  });
  for (const c of toClear) {
    headers.append(
      "Set-Cookie",
      `${c.name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    );
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  return new Response("Method Not Allowed", { status: 405 });
};
