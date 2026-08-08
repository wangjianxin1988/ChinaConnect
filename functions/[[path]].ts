/**
 * Cloudflare Pages Function — i18n Route Handler + Pages Subdomain Redirect
 * + GSC Verification File Handler
 *
 * Handles locale-prefixed URLs (/ja/city/beijing/, /ko/city/beijing/, etc.)
 * by rewriting the request to the default locale page and setting the locale context.
 *
 * Also redirects chinaconnect.pages.dev -> chinaengage.org so all traffic flows
 * through the canonical custom domain (Cloudflare Pages project subdomains cannot
 * be deleted -- they can only be redirected).
 *
 * Serves GSC verification HTML files (google*.html) at their exact path with
 * 200, preventing CF Pages from stripping the .html extension via 308.
 */

import type { PagesFunction } from "@cloudflare/workers-types";

const SUPPORTED_LOCALES = [
  "en",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
  "th",
  "vi",
  "ru",
  "fr",
  "de",
  "ar",
  "fa",
];
const DEFAULT_LOCALE = "en";
const PAGES_SUBDOMAIN = "chinaconnect.pages.dev";
const CANONICAL_HOST = "chinaengage.org";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  // Redirect Pages subdomain traffic to canonical custom domain
  if (host === PAGES_SUBDOMAIN || host.endsWith("." + PAGES_SUBDOMAIN)) {
    const target = new URL(path + url.search, `https://${CANONICAL_HOST}`);
    return Response.redirect(target.toString(), 301);
  }

  // GSC verification files: serve at exact path (e.g. /google2e85169c355abc2e.html)
  // CF Pages would 308-strip the .html extension otherwise; GSC requires exact path.
  if (/^\/google[a-f0-9]+\.html$/.test(path)) {
    const fileUrl = new URL(path, url.origin).toString();
    const fileRes = await context.env.ASSETS.fetch(fileUrl);
    if (fileRes.ok) {
      return new Response(fileRes.body, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  // Check if the path starts with a locale prefix
  const localeMatch = path.match(/^\/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)(\/.*)?$/);

  if (localeMatch) {
    const locale = localeMatch[1];
    const remainingPath = localeMatch[2] || "/";

    const rewriteUrl = new URL(remainingPath, url.origin);
    const response = await context.env.ASSETS.fetch(rewriteUrl.toString());

    if (response.ok) {
      const html = await response.text();

      let modifiedHtml = html.replace(/lang="en"/g, `lang="${locale}"`);

      // Replace <title> with the localized title when available (works around prerendered static mode)
      const localizedTitle = (() => {
        if (locale === "zh-CN") return "ChinaGuide AI - 你的智能中国旅行助手";
        if (locale === "zh-TW") return "ChinaGuide AI - 你的智能中國旅行助手";
        return null;
      })();
      if (localizedTitle) {
        modifiedHtml = modifiedHtml.replace(
          /<title>[^<]*<\/title>/g,
          `<title>${localizedTitle}</title>`,
        );
      }

      const localeScript = `<script>
        (function() {
          localStorage.setItem('chinaconnect_language', '${locale}');
          window.__LOCALE__ = '${locale}';
        })();
      </script>`;

      const finalHtml = modifiedHtml.replace("</head>", `${localeScript}</head>`);

      return new Response(finalHtml, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
          "Set-Cookie": `chinaconnect_language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`,
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  return context.next();
};
