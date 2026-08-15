const LANGUAGE_PATTERNS = Object.freeze({
  ja: /[\u3040-\u30ff\u4e00-\u9fff]/,
  ko: /[\uac00-\ud7af]/,
  th: /[\u0e00-\u0e7f]/,
  ru: /[\u0400-\u04ff]/,
  ar: /[\u0600-\u06ff]/,
  fa: /[\u0600-\u06ff]/,
  "zh-CN": /[\u4e00-\u9fff]/,
  "zh-TW": /[\u4e00-\u9fff]/,
  fr: /[\u00c0-\u00ff\u0152\u0153]/i,
  de: /[\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u1e9e]/,
  vi: /[\u00c0-\u1ef9]/i,
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

// Scripts that indicate a value is NOT a Latin-script translation (fr/de/vi etc.).
const FOREIGN_SCRIPTS =
  /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;

export function isTranslated(value, lang, sourceValue, sourceWasMasked = false) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (sourceWasMasked && value === sourceValue) return false;
  if (hasLanguageScript(value, lang)) return true;
  if (typeof sourceValue === "string" && value === sourceValue && sourceValue.length <= 24) return true;
  if (STRICT_LANGUAGES.has(lang)) return false;
  if (FOREIGN_SCRIPTS.test(value)) return false;
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