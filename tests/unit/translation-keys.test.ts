import { describe, expect, it } from "vitest";

import {
  hasLanguageScript,
  isTranslated,
  maskSensitiveTerms,
  restoreMaskedTerms,
  toApiKey,
  toDataPath,
} from "../../scripts/lib/translation-keys.mjs";

describe("translation data keys", () => {
  it("converts nested data paths to flat model keys", () => {
    expect(toApiKey("restaurants.12.dishHighlights.3")).toBe("restaurants_12_dishHighlights_3");
  });

  it("converts flat model keys back to nested data paths", () => {
    expect(toDataPath("restaurants_12_dishHighlights_3")).toBe("restaurants.12.dishHighlights.3");
  });

  it("detects target-language scripts without mojibake", () => {
    expect(hasLanguageScript("福州の三坊七巷", "ja")).toBe(true);
    expect(hasLanguageScript("福州의 산팡치샹", "ko")).toBe(true);
    expect(hasLanguageScript("\u00c9l\u00e9gance fran\u00e7aise", "fr")).toBe(true);
    expect(hasLanguageScript("M\u00fcnchner Stra\u00dfe", "de")).toBe(true);
    expect(hasLanguageScript("Ph\u1ed1 H\u00e0ng B\u1ea1c", "vi")).toBe(true);
  });

  it("accepts unchanged short prices and proper names", () => {
    expect(isTranslated("500-2000\u00a5", "ja", "500-2000\u00a5")).toBe(true);
    expect(
      isTranslated("This is a long English sentence", "ja", "This is a long English sentence"),
    ).toBe(false);
  });

  it("masks sensitive prompt words and restores them after translation", () => {
    const masked = maskSensitiveTerms("Bring your passport to the embassy");
    expect(masked.text).toContain("__KEEP_0__");
    expect(restoreMaskedTerms("__KEEP_0__を__KEEP_1__へ持参", masked.replacements)).toBe(
      "passportをembassyへ持参",
    );
  });
});
