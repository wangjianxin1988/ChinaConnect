/**
 * Per-language display names for cities and city entities.
 * - zh-CN / zh-TW / ja: prefer the CJK name (kanji/hanzi is readable)
 * - en / fr / de / ru / vi / th / ar / fa: prefer nameEn (no Chinese on Latin/Arabic pages)
 * - ko: prefer nameKo when present, else nameEn (avoid showing hanzi to Korean users)
 */
export function cityDisplayName(
  city: { name?: string; nameEn?: string; nameJa?: string; nameKo?: string },
  lang?: string,
): string {
  const l = lang || "en";
  const isCJK = ["zh-CN", "zh-TW", "ja"].includes(l);
  if (l === "ja" && city.nameJa) return city.nameJa;
  if (l === "ko" && city.nameKo) return city.nameKo;
  if (isCJK && city.name) return city.name;
  return city.nameEn || city.name || "";
}

/**
 * Secondary label (e.g. English name under a Chinese title).
 * Never returns Chinese for the English page.
 */
export function citySecondaryName(
  city: { name?: string; nameEn?: string; nameJa?: string; nameKo?: string },
  lang?: string,
): string {
  const l = lang || "en";
  if (!["zh-CN", "zh-TW", "ja"].includes(l)) return "";
  const primary = cityDisplayName(city, l);
  const secondary = primary === city.nameEn ? city.name || "" : primary === city.name ? city.nameEn || "" : "";
  return secondary && secondary !== primary ? secondary : "";
}

/**
 * Generic entity (attraction/restaurant/hotel) display names.
 * Same rules as cityDisplayName: CJK-native languages use the name field,
 * Latin/Arabic languages use nameEn, ko prefers nameKo.
 */
export function entityDisplayName(
  e: { name?: string; nameEn?: string; nameJa?: string; nameKo?: string },
  lang?: string,
): string {
  return cityDisplayName(e as { name?: string; nameEn?: string }, lang);
}

/**
 * Secondary label for entities. Only kept for languages where the
 * Chinese name is native/readable (zh-CN, zh-TW, ja) and differs
 * from the primary name. Never shown on English/Latin/Arabic pages.
 */
export function entitySecondaryName(
  e: { name?: string; nameEn?: string; nameJa?: string; nameKo?: string },
  lang?: string,
): string {
  const l = lang || "en";
  if (!["zh-CN", "zh-TW", "ja"].includes(l)) return "";
  const primary = entityDisplayName(e, l);
  const secondary = primary === e.name ? e.nameEn || "" : "";
  return secondary && secondary !== primary ? secondary : "";
}

/**
 * Deep-clone city data with every entity's `name` replaced by `nameEn`
 * for non-CJK languages (en/fr/de/ru/vi/th/ar/fa/ko). CJK-native
 * languages (zh-CN/zh-TW/ja) keep the original `name` field.
 *
 * This keeps SSR HTML (astro-island props, JSON-LD, map markers)
 * Chinese-free on English/Latin/Arabic pages, while components that
 * already display `nameEn` are unaffected.
 */
export function pruneCityEntityNames<T>(city: T, lang?: string): T {
  const l = lang || "en";
  if (["zh-CN", "zh-TW", "ja"].includes(l)) return city;
  const clone = JSON.parse(JSON.stringify(city)) as any;
  const fix = (e: any) => {
    if (e && typeof e === "object") {
      if (typeof e.name === "string" && typeof e.nameEn === "string" && e.nameEn) {
        e.name = e.nameEn;
      }
      for (const v of Object.values(e)) {
        if (Array.isArray(v)) v.forEach(fix);
        else if (v && typeof v === "object") fix(v);
      }
    }
  };
  fix(clone);
  return clone;
}
