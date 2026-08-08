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

      // Replace <title> with the per-page localized title (works around prerendered static mode).
      // The previous version hard-coded "ChinaGuide AI" for every locale and every page,
      // which caused /ja/pricing/ to show an AI page title in the browser tab and SERP.
      const localizedTitle = (() => {
        // Strip trailing slash so `/pricing/` and `/pricing` match the same entry.
        const pagePath = path.replace(/^/(en|ja|ko|zh-CN|zh-TW|th|vi|ru|fr|de|ar|fa)/, "").replace(//+$/, "") || "/";
        const PAGE_TITLES = {
          "/": {
            en: "ChinaConnect - Your AI Guide to Exploring China",
            ja: "ChinaConnect - AIで中国を探索する",
            ko: "ChinaConnect - AI로 중국을 탐험하다",
            "zh-CN": "ChinaConnect - AI 助你探索中国",
            "zh-TW": "ChinaConnect - AI 助你探索中國",
            th: "ChinaConnect - คู่มือสำรวจจีนด้วย AI",
            vi: "ChinaConnect - Hướng dẫn khám phá Trung Quốc với AI",
            ru: "ChinaConnect - Ваш AI-гид по Китаю",
            fr: "ChinaConnect - Votre guide IA pour explorer la Chine",
            de: "ChinaConnect - Ihr KI-Guide für China",
            ar: "ChinaConnect - دليلك الذكي لاستكشاف الصين",
            fa: "ChinaConnect - راهنمای هوش مصنوعی شما برای سفر به چین",
          },
          "/ai": {
            en: "ChinaGuide AI - Your Intelligent China Travel Expert",
            ja: "ChinaGuide AI - 中国旅行のスマートアシスタント",
            ko: "ChinaGuide AI - 중국 여행 인텔리전트 어시스턴트",
            "zh-CN": "ChinaGuide AI - 你的智能中国旅行助手",
            "zh-TW": "ChinaGuide AI - 你的智能中國旅行助手",
            th: "ChinaGuide AI - ผู้ช่วยอัจฉริยะสำหรับการท่องเที่ยวจีน",
            vi: "ChinaGuide AI - Trợ lý du lịch Trung Quốc thông minh",
            ru: "ChinaGuide AI - Ваш интеллектуальный помощник по Китаю",
            fr: "ChinaGuide AI - Votre assistant intelligent pour la Chine",
            de: "ChinaGuide AI - Ihr intelligenter China-Reiseassistent",
            ar: "ChinaGuide AI - مساعدك الذكي للسفر إلى الصين",
            fa: "ChinaGuide AI - دستیار هوشمند سفر به چین",
          },
          "/pricing": {
            en: "Pricing Plans - ChinaConnect AI",
            ja: "料金プラン - ChinaConnect AI",
            ko: "요금제 - ChinaConnect AI",
            "zh-CN": "价格方案 - ChinaConnect AI",
            "zh-TW": "價格方案 - ChinaConnect AI",
            th: "แผนราคา - ChinaConnect AI",
            vi: "Bảng giá - ChinaConnect AI",
            ru: "Тарифы - ChinaConnect AI",
            fr: "Tarifs - ChinaConnect AI",
            de: "Preise - ChinaConnect AI",
            ar: "خطط الأسعار - ChinaConnect AI",
            fa: "طرح‌های قیمت‌گذاری - ChinaConnect AI",
          },
          "/emergency": {
            en: "Emergency Contacts & Phrases - ChinaConnect",
            ja: "緊急連絡先とフレーズ - ChinaConnect",
            ko: "긴급 연락처 & 표현 - ChinaConnect",
            "zh-CN": "紧急联系与短语 - ChinaConnect",
            "zh-TW": "緊急聯絡與短語 - ChinaConnect",
            th: "ข้อมูลฉุกเฉิน & วลี - ChinaConnect",
            vi: "Liên hệ khẩn cấp & cụm từ - ChinaConnect",
            ru: "Экстренные контакты и фразы - ChinaConnect",
            fr: "Contacts d'urgence et phrases - ChinaConnect",
            de: "Notfallkontakte & Redewendungen - ChinaConnect",
            ar: "جهات الاتصال الطارئة والعبارات - ChinaConnect",
            fa: "تماس‌های اضطراری و عبارات - ChinaConnect",
          },
          "/account": {
            en: "My Account - ChinaConnect",
            ja: "マイアカウント - ChinaConnect",
            ko: "내 계정 - ChinaConnect",
            "zh-CN": "我的账户 - ChinaConnect",
            "zh-TW": "我的帳戶 - ChinaConnect",
            th: "บัญชีของฉัน - ChinaConnect",
            vi: "Tài khoản của tôi - ChinaConnect",
            ru: "Мой аккаунт - ChinaConnect",
            fr: "Mon compte - ChinaConnect",
            de: "Mein Konto - ChinaConnect",
            ar: "حسابي - ChinaConnect",
            fa: "حساب من - ChinaConnect",
          },
          "/profile": {
            en: "My Profile - ChinaConnect",
            ja: "マイプロフィール - ChinaConnect",
            ko: "내 프로필 - ChinaConnect",
            "zh-CN": "我的资料 - ChinaConnect",
            "zh-TW": "我的資料 - ChinaConnect",
            th: "โปรไฟล์ของฉัน - ChinaConnect",
            vi: "Hồ sơ của tôi - ChinaConnect",
            ru: "Мой профиль - ChinaConnect",
            fr: "Mon profil - ChinaConnect",
            de: "Mein Profil - ChinaConnect",
            ar: "ملفي الشخصي - ChinaConnect",
            fa: "پروفایل من - ChinaConnect",
          },
          "/cities": {
            en: "Explore Cities - ChinaConnect",
            ja: "都市を探す - ChinaConnect",
            ko: "도시 탐험 - ChinaConnect",
            "zh-CN": "探索城市 - ChinaConnect",
            "zh-TW": "探索城市 - ChinaConnect",
            th: "สำรวจเมือง - ChinaConnect",
            vi: "Khám phá thành phố - ChinaConnect",
            ru: "Исследуйте города - ChinaConnect",
            fr: "Explorer les villes - ChinaConnect",
            de: "Städte erkunden - ChinaConnect",
            ar: "استكشاف المدن - ChinaConnect",
            fa: "کاوش شهرها - ChinaConnect",
          },
          "/food": {
            en: "Restaurant Guide - ChinaConnect",
            ja: "レストランガイド - ChinaConnect",
            ko: "레스토랑 가이드 - ChinaConnect",
            "zh-CN": "餐厅指南 - ChinaConnect",
            "zh-TW": "餐廳指南 - ChinaConnect",
            th: "คู่มือร้านอาหาร - ChinaConnect",
            vi: "Hướng dẫn nhà hàng - ChinaConnect",
            ru: "Гид по ресторанам - ChinaConnect",
            fr: "Guide des restaurants - ChinaConnect",
            de: "Restaurantführer - ChinaConnect",
            ar: "دليل المطاعم - ChinaConnect",
            fa: "راهنمای رستوران - ChinaConnect",
          },
          "/guide": {
            en: "Travel Guide - ChinaConnect",
            ja: "旅行ガイド - ChinaConnect",
            ko: "여행 가이드 - ChinaConnect",
            "zh-CN": "旅行指南 - ChinaConnect",
            "zh-TW": "旅行指南 - ChinaConnect",
            th: "คู่มือท่องเที่ยว - ChinaConnect",
            vi: "Hướng dẫn du lịch - ChinaConnect",
            ru: "Путеводитель - ChinaConnect",
            fr: "Guide de voyage - ChinaConnect",
            de: "Reiseführer - ChinaConnect",
            ar: "دليل السفر - ChinaConnect",
            fa: "راهنمای سفر - ChinaConnect",
          },
        };
        // City and restaurant sub-pages: keep the original Astro-rendered title (en),
        // but swap the trailing "- ChinaConnect" segment with the localized brand.
        const baseTitle = (PAGE_TITLES[pagePath] && PAGE_TITLES[pagePath][locale]) || null;
        if (baseTitle) return baseTitle;
        // Generic fallback: leave the English title in place for dynamic sub-pages
        // (city/[slug], guide/*, food/[id], user/[id]) - Astro already supplies an
        // English title; we keep it intact so the SERP is at least not wrong.
        return null;
      })();
      if (localizedTitle) {
        modifiedHtml = modifiedHtml.replace(
          /<title>[^<]*<\/title>/g,
          `<title>${localizedTitle}</title>`,
        );
        // Also patch og:title and twitter:title for social-share SEO
        modifiedHtml = modifiedHtml.replace(
          /<meta property="og:title" content="[^"]*"/g,
          `<meta property="og:title" content="${localizedTitle}"`,
        );
        modifiedHtml = modifiedHtml.replace(
          /<meta name="twitter:title" content="[^"]*"/g,
          `<meta name="twitter:title" content="${localizedTitle}"`,
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
