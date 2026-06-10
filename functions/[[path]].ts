/**
 * Cloudflare Pages Function — i18n Route Handler
 * 
 * Handles locale-prefixed URLs (/ja/city/beijing/, /ko/city/beijing/, etc.)
 * by rewriting the request to the default locale page and setting the locale context.
 * 
 * This enables SEO-friendly URLs while serving the same content.
 * The client-side JavaScript handles the actual translation.
 */

import type { PagesFunction } from "@cloudflare/workers-types";

const SUPPORTED_LOCALES = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const DEFAULT_LOCALE = "en";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;
  
  // Check if the path starts with a locale prefix
  const localeMatch = path.match(/^\/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)(\/.*)?$/);
  
  if (localeMatch) {
    const locale = localeMatch[1];
    const remainingPath = localeMatch[2] || "/";
    
    // Rewrite to the default locale path
    const rewriteUrl = new URL(remainingPath, url.origin);
    
    // Fetch the default locale page
    const response = await context.env.ASSETS.fetch(rewriteUrl.toString());
    
    // If the response is successful, modify it to include the locale
    if (response.ok) {
      const html = await response.text();
      
      // Replace lang="en" with the correct locale
      const modifiedHtml = html.replace(
        /lang="en"/g,
        `lang="${locale}"`
      );
      
      // Add a script to set the locale in localStorage
      const localeScript = `<script>
        (function() {
          localStorage.setItem('chinaconnect_language', '${locale}');
          window.__LOCALE__ = '${locale}';
        })();
      </script>`;
      
      // Insert the locale script before </head>
      const finalHtml = modifiedHtml.replace('</head>', `${localeScript}</head>`);
      
      return new Response(finalHtml, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    // If the page doesn't exist, return 404
    return new Response('Not Found', { status: 404 });
  }
  
  // For non-locale URLs, just pass through
  return context.next();
};
