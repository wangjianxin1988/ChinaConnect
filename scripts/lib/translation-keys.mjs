const LANGUAGE_PATTERNS = Object.freeze({
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
  th: /[\u0e00-\u0e7f]/,
  ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/,
  fa: /[\u0600-\u06ff]/,
  "zh-CN": /[\u4e00-\u9fff]/,
  "zh-TW": /[\u4e00-\u9fff]/,
  fr: /[^\x00-\x7f]/i,
  de: /[^\x00-\x7f]/i,
  vi: /[^\x00-\x7f]/i,
});

const STRICT_LANGUAGES = new Set([
  "ja",
  "ko",
  "th",
  "ru",
  "ar",
  "fa",
  "zh-CN",
  "zh-TW",
]);

const SENSITIVE_TERMS =
  /\b(passport|embassy|consulate|arrest|police|hospital|emergency|phone|cash|bank|atm|credit card|debit card|mao|zedong)\b/gi;

export function toApiKey(dataPath) {
  return dataPath.replace(/\.(\d+)\./g, (_match, index) => `_${index}_`).replace(/\./g, "_");
}

export function toDataPath(apiKey) {
  return apiKey.replace(/_(\d+)_/g, (_match, index) => `.${index}.`).replace(/_/g, ".");
}

export function hasLanguageScript(value, lang) {
  return typeof value === "string" && (LANGUAGE_PATTERNS[lang]?.test(value) ?? false);
}

export function isTranslated(value, lang, sourceValue, sourceWasMasked = false) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (sourceWasMasked && value === sourceValue) return false;
  if (hasLanguageScript(value, lang)) return true;
  if (typeof sourceValue === "string" && value === sourceValue && sourceValue.length <= 24) return true;
  if (STRICT_LANGUAGES.has(lang)) return false;
  if (typeof sourceValue === "string" && value !== sourceValue) return true;
  return false;
}

export function maskSensitiveTerms(value) {
  const replacements = new Map();
  const text = String(value).replace(SENSITIVE_TERMS, (term) => {
    const token = `__KEEP_${replacements.size}__`;
    replacements.set(token, term);
    return token;
  });
  return { text, replacements };
}

export function restoreMaskedTerms(value, replacements) {
  let restored = String(value);
  for (const [token, term] of replacements || []) {
    restored = restored.replaceAll(token, term);
  }
  return restored;
}