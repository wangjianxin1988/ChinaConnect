// Guide component i18n helper.
// - ja: renders the Japanese translation of a Chinese label (from JA_GUIDE_OVERRIDES)
// - other langs: keeps the existing "English / 中文" bilingual display
import React from "react";
import { JA_GUIDE_OVERRIDES } from "@/data/guide/ja-overrides";

export function jaText(zh: string | undefined, lang?: string): string {
  if (!zh) return "";
  if (lang === "ja") return JA_GUIDE_OVERRIDES[zh] || zh;
  return zh;
}

export function Bi({ en, zh, lang }: { en: string; zh: string; lang?: string }) {
  if (lang === "ja") {
    return <>{JA_GUIDE_OVERRIDES[zh] || zh}</>;
  }
  return <>{en} / {zh}</>;
}

export default Bi;
