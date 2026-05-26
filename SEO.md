# SEO/GEO Infrastructure for ChinaConnect

## Overview

This module provides comprehensive SEO and geographic optimization for ChinaConnect, including structured data, sitemap generation, internationalization support, and AI crawler accessibility.

## Components

### 1. Schema.org Structured Data (`src/lib/schema.ts`)

Generates JSON-LD structured data for search engines:

| Schema Type | Usage | File |
|------------|-------|------|
| `LocalBusiness` | City pages | `generateLocalBusinessSchema()` |
| `Restaurant` | Restaurant detail pages | `generateRestaurantSchema()` |
| `TouristAttraction` | Restaurant detail pages | `generateTouristAttractionSchema()` |
| `FAQPage` | FAQ sections | `generateFAQSchema()` |
| `Event` | Food events | `generateEventSchema()` |
| `BreadcrumbList` | Navigation | `generateBreadcrumbSchema()` |
| `WebSite` | Search box | `generateWebsiteSchema()` |
| `Organization` | Brand info | `generateOrganizationSchema()` |

### 2. Sitemap Generator (`src/lib/sitemap.ts`)

Auto-generates XML sitemaps for Google and Baidu:

- **Static pages**: `/`, `/about`, `/search`, `/faq`, `/emergency`
- **City pages**: 6 cities (Beijing, Shanghai, Hangzhou, Chengdu, Guangzhou, Xi'an)
- **Cuisine categories**: Chinese, Western, Japanese, Southeast Asian, Other

Usage in Astro pages (requires adapter for SSR):

```astro
---
import { buildSitemapSections, generateSitemapXml } from '@/lib/sitemap';
const sections = buildSitemapSections();
const sitemapXml = generateSitemapXml(sections);
---
{sitemapXml}
```

### 3. Hreflang Internationalization (`src/lib/hreflang.ts`)

Manages multi-language URL versions:

- **English (default)**: `https://chinaconnect.com/beijing`
- **Chinese**: `https://chinaconnect.com/zh/beijing`
- **x-default**: Points to canonical URL

### 4. Robots.txt (`public/robots.txt`)

AI-friendly crawler configuration:

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://chinaconnect.com/sitemap.xml
```

### 5. SEO Head Component (`src/components/seo/`)

- `SEOHead.astro`: Astro component for static pages
- `SEOHead.tsx`: React component for React pages
- `JsonLd.tsx`: React component for JSON-LD injection

## Integration

### Using BaseLayout

All pages should use `BaseLayout.astro` which includes:

- Title, description, keywords meta tags
- Canonical URL
- Hreflang alternate links
- Open Graph tags
- Twitter Card tags
- Theme color

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout
  title="Page Title"
  description="Page description for SEO"
  meta={{
    keywords: ['keyword1', 'keyword2'],
    noIndex: false,
  }}
>
  <!-- Page content -->
</BaseLayout>
```

### Dynamic Sitemap

For Cloudflare Pages or similar static hosting:

1. Create a `_routes.json` for catch-all routing
2. Or use a Cloudflare Pages Function (`functions/sitemap.xml.ts`)

Example Cloudflare Pages Function:

```typescript
// functions/sitemap.xml.ts
import { buildSitemapSections, generateSitemapXml } from '../src/lib/sitemap';

export const onRequest: PagesFunction = async () => {
  const sections = buildSitemapSections();
  const xml = generateSitemapXml(sections);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
```

## Testing

See `TEST.md` for detailed testing documentation.

Quick test commands:

```bash
# Unit tests
pnpm test

# Build verification
pnpm build
```

## SEO Checklist

- [x] Schema.org structured data for all page types
- [x] Sitemap with all major pages
- [x] robots.txt with AI crawler access
- [x] Hreflang for en/zh locales
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] Meta keywords
- [x] robots meta tag

## File Structure

```
src/
├── components/seo/
│   ├── SEOHead.astro      # Astro SEO head
│   ├── SEOHead.tsx        # React SEO head
│   └── JsonLd.tsx         # JSON-LD injectors
├── lib/
│   ├── schema.ts          # Schema generators
│   ├── sitemap.ts         # Sitemap generator
│   ├── hreflang.ts        # Hreflang utilities
│   └── robots.ts          # Robots.txt generator
├── types/
│   └── seo.ts             # SEO type definitions
└── layouts/
    └── BaseLayout.astro  # Layout with SEO integration

public/
├── robots.txt             # AI-friendly robots.txt
└── favicon.svg            # Site favicon

tests/
├── unit/                  # Unit tests for all lib modules
├── integration/           # API integration tests
└── e2e/                   # E2E tests for SEO verification
```

## Known Limitations

1. **Dynamic Sitemap**: Requires server-side rendering for `/sitemap.xml` endpoint. Use Cloudflare Pages Function or similar for production.

2. **Baidu SEO**: Baidu sitemap endpoint is defined but not deployed. Add a Pages Function for `sitemap-baidu.xml` for Baidu Webmaster Tools submission.

3. **React Components**: Some React SEO components are provided but may require additional testing in specific React usage contexts within Astro.

## References

- [Google Structured Data Guidelines](https://developers.google.com/search/docs/structured-data/overview)
- [Baidu SEO Guidelines](https://ziyuan.baidu.com/guide/63)
- [Schema.org Documentation](https://schema.org/docs/schemas.html)
- [Hreflang Implementation Guide](https://developers.google.com/search/docs/advanced/crawl/hreflang)