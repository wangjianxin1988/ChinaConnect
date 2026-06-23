// @ts-nocheck
// React SEO Head component for use in React pages within Astro

import type { SEOPageMeta } from "@/types/seo";
import { useEffect } from "react";

interface SEOHeadProps {
  meta: SEOPageMeta;
  ogImage?: string;
  defaultOgImage?: string;
  siteUrl?: string;
  siteName?: string;
  schemas?: Record<string, unknown>[];
}

const SITE_URL = "https://chinaconnect.xyz";
const SITE_NAME = "ChinaConnect";

// Supported languages for hreflang
const SUPPORTED_HREFLANGS = [
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

export function SEOHead({
  meta,
  ogImage,
  defaultOgImage = "/og-image.png",
  siteUrl = SITE_URL,
  siteName = SITE_NAME,
  schemas = [],
}: SEOHeadProps) {
  useEffect(() => {
    const fullOgImage = ogImage || `${siteUrl}${defaultOgImage}`;
    const canonicalUrl = meta.canonicalUrl || window.location.href;

    // Update document title
    document.title = meta.title;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement("meta");
        if (property) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update standard meta tags
    updateMeta("description", meta.description);

    if (meta.keywords && meta.keywords.length > 0) {
      updateMeta("keywords", meta.keywords.join(", "));
    }

    // Robots
    const robotsContent = meta.noIndex
      ? "noindex, nofollow"
      : meta.noFollow
        ? "index, nofollow"
        : "index, follow";
    updateMeta("robots", robotsContent);

    // Open Graph
    updateMeta("og:type", "website", true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:title", meta.title, true);
    updateMeta("og:description", meta.description, true);
    updateMeta("og:image", fullOgImage, true);
    updateMeta("og:image:width", "1200", true);
    updateMeta("og:image:height", "630", true);
    updateMeta("og:site_name", siteName, true);
    updateMeta("og:locale", "en_US", true);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", meta.title);
    updateMeta("twitter:description", meta.description);
    updateMeta("twitter:image", fullOgImage);
    updateMeta("twitter:url", canonicalUrl);
    updateMeta("twitter:site", "@chinaconnect");

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Update hreflang links - build proper hreflangs for all 12 languages
    const path = window.location.pathname.replace(/\/$/, "");

    // Remove existing hreflang links
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    for (const el of existingHreflangs) {
      el.remove();
    }

    // Add new hreflang links for all supported languages
    for (const lang of SUPPORTED_HREFLANGS) {
      let href: string;
      if (lang === "en") {
        // English is default - no prefix
        href = `${siteUrl}${path || "/"}`;
      } else {
        href = `${siteUrl}/${lang}${path || "/"}`;
      }

      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    }

    // Add x-default
    const xDefaultLink = document.createElement("link");
    xDefaultLink.rel = "alternate";
    xDefaultLink.hreflang = "x-default";
    xDefaultLink.href = `${siteUrl}${path || "/"}`;
    document.head.appendChild(xDefaultLink);

    // Inject JSON-LD schemas
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of existingScripts) {
      script.remove();
    }

    for (const schema of schemas) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Don't remove on unmount as other components may need the SEO data
    };
  }, [meta, ogImage, defaultOgImage, siteUrl, siteName, schemas]);

  return null;
}
