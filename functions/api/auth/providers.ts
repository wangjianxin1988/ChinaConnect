/**
 * Cloudflare Pages Function: GET /api/auth/providers
 * Reports which OAuth providers are enabled. Used by the login page to
 * grey out buttons that would otherwise error with "provider is not enabled".
 */

interface Env {}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async () => {
  // Without admin API access we cannot introspect enabled providers server-side
  // in the Pages Function runtime. We default to `unknown` and let the client
  // detect "not enabled" errors and show a friendly fallback message.
  return json({
    providers: { google: "unknown", github: "unknown", email: true },
    unknown: true,
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method Not Allowed", { status: 405 });
};
