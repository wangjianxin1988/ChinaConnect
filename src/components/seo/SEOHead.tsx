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

const SITE_URL = "https://chinaconnect.com";
const SITE_NAME = "ChinaConnect";

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

    // Update hreflang links
    const path = window.location.pathname;
    const hreflangs = [
      { hreflang: "en", href: `${siteUrl}${path.replace(/^\/(zh\//, "/")}` },
      { hreflang: "zh-CN", href: `${siteUrl}/zh${path.replace(/^\/(en\//, "/")}` },
      { hreflang: "x-default", href: canonicalUrl },
    ];

    // Remove existing hreflang links
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

    // Add new hreflang links
    hreflangs.forEach(({ hreflang, href }) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
    });

    // Inject JSON-LD schemas
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [meta, ogImage, defaultOgImage, siteUrl, siteName, schemas]);

  return null;
}

// Helper component to inject a single JSON-LD script
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.head.querySelector('script[type="application/ld+json"]');
      if (existing && existing.textContent === JSON.stringify(schema)) {
        existing.remove();
      }
    };
  }, [schema]);

  return null;
}

// Component for FAQPage schema
export function FAQJsonLd({ items }: { items: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd schema={schema} />;
}
