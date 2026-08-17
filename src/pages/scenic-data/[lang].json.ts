// Static JSON payload for the scenic-spots hub page.
//
// The scenic-spots page server-renders only the first N cards (fast first
// paint + SEO baseline) and lazy-loads the full ~1,770-spot list from this
// per-language JSON via /scenic-data/{lang}.json. Keeping the payload as a
// separate static asset keeps the HTML small while the full dataset stays
// crawlable through the JS-rendered cards (same URLs as before).
import { getCityData } from "@/data/cities-i18n";
import { citySlugs } from "@/data/cities/index";
import type { APIRoute } from "astro";

const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];

export function getStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as string;
  const prefix = lang === "en" ? "" : `/${lang}`;
  const items: Array<Record<string, string>> = [];

  for (const slug of citySlugs) {
    const city = getCityData(slug, lang);
    if (!city) continue;
    const list = city.attractions || [];
    if (list.length === 0) continue;
    for (const a of list) {
      items.push({
        category: (a.category || "other").toString(),
        citySlug: city.slug,
        cityNameEn: city.nameEn || "",
        title: (a.nameEn || a.name || "").toString(),
        description: (a.description || "").toString(),
        image: (a.image || "").toString(),
        href: `${prefix}/city/${city.slug}#attractions`,
      });
    }
  }

  return new Response(JSON.stringify(items), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
