/**
 * Client-side i18n runtime.
 * Walks the DOM and replaces text content of any element with
 * `data-i18n="key"` (or `data-i18n-placeholder`, `data-i18n-title`, etc.)
 * with the translation for the current language.
 *
 * Translation sources (in priority order):
 *   1. window.__I18N__.translations[lang]  (the big NS object injected by BaseLayout)
 *   2. /locales/<lang>.json loaded from the bundled JSON
 */

type Translations = Record<string, string | Record<string, string>>;

const RTL_LANGS = ["ar", "fa"];

function getLang(): string {
  const stored =
    typeof localStorage !== "undefined" ? localStorage.getItem("chinaconnect_language") : null;
  if (stored) return stored;
  const html = document.documentElement;
  if (html.lang) return html.lang;
  return (navigator.language || "en").toLowerCase().split("-")[0];
}

function getDict(lang: string): Translations {
  const win = window as unknown as { __I18N__?: { translations?: Record<string, Translations> } };
  const t = win.__I18N__?.translations?.[lang];
  if (t) return t;
  return win.__I18N__?.translations?.en || {};
}

function lookup(t: Translations, key: string): string | undefined {
  const parts = key.split(".");
  let cur: string | Translations | undefined = t;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, string>)) {
      cur = (cur as Record<string, string>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

function apply(root: ParentNode, lang: string, t: Translations): void {
  // data-i18n
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const v = lookup(t, key);
    if (v) el.textContent = v;
  });
  // data-i18n-placeholder
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    const v = lookup(t, key);
    if (v) (el as HTMLInputElement).placeholder = v;
  });
  // data-i18n-title (attribute)
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (!key) return;
    const v = lookup(t, key);
    if (v) el.setAttribute("title", v);
  });
  // data-i18n-aria
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (!key) return;
    const v = lookup(t, key);
    if (v) el.setAttribute("aria-label", v);
  });

  // Apply LTR/RTL
  if (RTL_LANGS.includes(lang)) {
    document.documentElement.dir = "rtl";
  } else if (document.documentElement.dir === "rtl") {
    document.documentElement.dir = "ltr";
  }
}

export function applyI18n(): void {
  const lang = getLang();
  const dict = getDict(lang);
  apply(document, lang, dict);
}

export function setLanguage(lang: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("chinaconnect_language", lang);
  }
  document.documentElement.lang = lang;
  document.documentElement.dispatchEvent(new CustomEvent("languagechange", { detail: lang }));
  applyI18n();
}

// Auto-run on import
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => applyI18n());
  window.addEventListener("languagechange", () => applyI18n());
}
