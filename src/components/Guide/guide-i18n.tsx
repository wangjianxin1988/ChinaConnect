// Guide component i18n helper.
// - ja: renders the Japanese translation of a Chinese label (from JA_GUIDE_OVERRIDES)
// - other langs: keeps the existing "English / 中文" bilingual display
import React from "react";
import { JA_GUIDE_OVERRIDES } from "@/data/guide/ja-overrides";

export function jaText(zh: string | undefined, lang?: string): string {
  if (!zh) return "";
  if (lang === "ja") return JA_GUIDE_OVERRIDES[zh] || zh;
  if (lang === "en") return ""; // English pages must not show Chinese
  return zh;
}

// Remove CJK characters from an English/bilingual display string (EN pages).
const CJK_RE = /[\u3400-\u9fff]/;
export function stripZh(s: string): string {
  return s
    .replace(/\s*[（(][^)）]*[\u3400-\u9fff][^)）]*[)）]\s*/g, " ") // "Name (中文)" -> "Name"
    .replace(/\s*\/\s*[\u3400-\u9fff]+/g, "") // "KFC/麦当劳" -> "KFC"
    .replace(/[\u3400-\u9fff]+/g, "") // any remaining CJK chars
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Render an EN/bilingual field for the current language.
// - ja: Japanese override (kept identical to jaText)
// - en: English only (CJK stripped)
// - other langs: as-is (Phase 2 will supply per-lang data)
export function guideText(s: string | undefined, lang?: string): string {
  if (!s) return "";
  if (lang === "ja") return JA_GUIDE_OVERRIDES[s] || s;
  if (lang === "en") return stripZh(s);
  return s;
}

export function Bi({ en, zh, lang }: { en: string; zh: string; lang?: string }) {
  if (lang === "ja") {
    return <>{JA_GUIDE_OVERRIDES[zh] || zh}</>;
  }
  if (lang === "en") {
    return <>{en}</>;
  }
  return <>{en} / {zh}</>;
}

export default Bi;
