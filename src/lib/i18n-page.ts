// Shared i18n helper for .astro pages
import { translations } from "@/i18n/translations";

export function getLang(Astro: any): string {
  const fromParams = Astro?.params?.lang;
  if (typeof fromParams === "string" && fromParams) return fromParams;
  const url = Astro?.url?.pathname || "";
  const m = url.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\/?/);
  if (m) {
    const code = m[1].toLowerCase();
    if (code === "zhcn") return "zh-CN";
    if (code === "zhtw") return "zh-TW";
    return code;
  }
  return "en";
}

export function makeLookup(lang: string) {
  const _t = translations[lang as keyof typeof translations] || translations.en;
  return (key: string): string => {
    const parts = key.split(".");
    let cur: any = _t;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  };
}
