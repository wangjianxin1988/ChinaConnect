// Blog multi-language schema and helper.
// Usage:
//   import { blogPosts } from "@/i18n/blog";
//   const post = blogPosts[lang]?.find(p => p.slug === slug) ?? blogPosts.en.find(p => p.slug === slug);
import type { Language } from "./translations";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: "guide" | "food" | "travel" | "culture" | "city" | "announcement";
  tags: string[];
  coverImage?: string;
  body: string; // Markdown body
  readingMinutes: number;
}

// CI-enforced: every slug present in every language.
// Add new languages by extending the BlogRecord map.
export type BlogRecord = Record<Language, BlogPost[]>;

export const SUPPORTED_BLOG_LANGUAGES: Language[] = [
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
  "fa"
];

export const CATEGORY_LABELS: Record<BlogPost["category"], Record<Language, string>> = {
  guide: { en: "Guide", ja: "ガイド", ko: "가이드", "zh-CN": "指南", "zh-TW": "指南", th: "คำแนะนำ", vi: "Hướng dẫn", ru: "Гид", fr: "Guide", de: "Ratgeber", ar: "دليل", fa: "راهنما" },
  food: { en: "Food", ja: "グルメ", ko: "음식", "zh-CN": "美食", "zh-TW": "美食", th: "อาหาร", vi: "Ẩm thực", ru: "Еда", fr: "Cuisine", de: "Essen", ar: "طعام", fa: "غذا" },
  travel: { en: "Travel", ja: "旅行", ko: "여행", "zh-CN": "旅行", "zh-TW": "旅行", th: "การเดินทาง", vi: "Du lịch", ru: "Путешествия", fr: "Voyage", de: "Reisen", ar: "سفر", fa: "سفر" },
  culture: { en: "Culture", ja: "文化", ko: "문화", "zh-CN": "文化", "zh-TW": "文化", th: "วัฒนธรรม", vi: "Văn hóa", ru: "Культура", fr: "Culture", de: "Kultur", ar: "ثقافة", fa: "فرهنگ" },
  city: { en: "City", ja: "都市", ko: "도시", "zh-CN": "城市", "zh-TW": "城市", th: "เมือง", vi: "Thành phố", ru: "Город", fr: "Ville", de: "Stadt", ar: "مدينة", fa: "شهر" },
  announcement: { en: "Announcement", ja: "お知らせ", ko: "공지사항", "zh-CN": "公告", "zh-TW": "公告", th: "ประกาศ", vi: "Thông báo", ru: "Объявление", fr: "Annonce", de: "Ankündigung", ar: "إعلان", fa: "اعلامیه" }
};

// Sample empty record (CI will fail until populated).
// To add a blog post:
//   1. Add the same slug to every language entry (12 copies of slug)
//   2. Each entry must include: title, description, body, date, author, category, tags
//   3. body must be at least 200 characters
//   4. title and description must be non-empty
//   5. running pnpm check:i18n will validate coverage
export const blogPosts: BlogRecord = {
  en: [],
  ja: [],
  ko: [],
  "zh-CN": [],
  "zh-TW": [],
  th: [],
  vi: [],
  ru: [],
  fr: [],
  de: [],
  ar: [],
  fa: []
};

export function getBlogPost(lang: Language, slug: string): BlogPost | undefined {
  return blogPosts[lang]?.find((p) => p.slug === slug);
}

export function listBlogPosts(lang: Language): BlogPost[] {
  return (blogPosts[lang] ?? blogPosts.en).slice().sort((a, b) => b.date.localeCompare(a.date));
}