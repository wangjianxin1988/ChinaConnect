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
  const isCJK = ["zh-CN", "zh-TW", "ja", "ko"].includes(l);
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
  if (l === "en") return "";
  const primary = cityDisplayName(city, l);
  if (primary === city.nameEn) return city.name || "";
  if (primary === city.name) return city.nameEn || "";
  return "";
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
