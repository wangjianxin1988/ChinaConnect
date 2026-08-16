// Blog posts loader - similar to cities-i18n
// Resolves /src/data/blog-i18n/<lang>/<slug>.json if exists, else falls back to /src/data/blog/posts.json (en source)

import enPosts from "./blog/posts.json";

const enIndex: Record<string, any> = {};
for (const p of enPosts) enIndex[p.slug] = p;

const i18nFiles = import.meta.glob("./blog-i18n/*/*.json", { eager: true }) as Record<string, any>;

const slugFromPath = (p: string): string | null => {
  const m = p.match(/([^/]+)\.json$/);
  return m ? m[1] : null;
};
const langFromPath = (p: string): string | null => {
  const m = p.match(/\/blog-i18n\/([^/]+)\//);
  return m ? m[1] : null;
};

const buildI18nIndex = (): Record<string, any> => {
  const idx: Record<string, any> = {};
  for (const [path, mod] of Object.entries(i18nFiles)) {
    const lang = langFromPath(path);
    const slug = slugFromPath(path);
    if (lang && slug) idx[lang + ":" + slug] = (mod as any).default ?? mod;
  }
  return idx;
};

let I18N_INDEX: Record<string, any> | null = null;
const getI18nIndex = (): Record<string, any> => {
  if (!I18N_INDEX) I18N_INDEX = buildI18nIndex();
  return I18N_INDEX;
};

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  coverImage: string;
  publishedAt: string;
  readingTime: number;
  featured?: boolean;
  content: string;
}

// Topic-matched fallback covers so every post (including future ones without an
// explicit coverImage) always renders a relevant image on blog cards/pages.
const CATEGORY_COVER_FALLBACKS: Record<string, string> = {
  "Travel Guide": "/img/blog/categories/travel-guide.webp",
  "Practical Guide": "/img/blog/categories/practical-guide.webp",
  "City Picks": "/img/blog/categories/city-picks.webp",
};

export function blogCoverImage(post: Pick<BlogPost, "coverImage" | "category">): string {
  if (post.coverImage) return post.coverImage;
  return CATEGORY_COVER_FALLBACKS[post.category] || "/img/blog/categories/travel-guide.webp";
}

export function getPost(slug: string, lang: string): BlogPost | null {
  const idx = getI18nIndex();
  if (lang && lang !== "en" && idx[lang + ":" + slug]) return idx[lang + ":" + slug];
  return enIndex[slug] ?? null;
}

export function getPosts(lang: string): BlogPost[] {
  const idx = getI18nIndex();
  if (lang === "en") return enPosts;
  // Use translated versions where available; fall back to English for missing
  return enPosts
    .map((en) => (idx[lang + ":" + en.slug] ?? en))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getAllPostSlugs(): string[] {
  return enPosts.map((p) => p.slug);
}

export function getFeaturedPosts(lang: string, limit = 3): BlogPost[] {
  return getPosts(lang).filter((p) => p.featured).slice(0, limit);
}