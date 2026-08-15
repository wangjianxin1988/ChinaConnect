import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import posts from "../../src/data/blog/posts.json";

const languages = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const requiredTextFields = ["title", "description", "category", "author", "content"] as const;

describe("blog localization data", () => {
  it("uses unique slugs and complete source metadata", () => {
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);

    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(post.coverImage).toMatch(/^\//);
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.readingTime).toBeGreaterThan(0);
      expect(post.tags.length).toBeGreaterThan(0);
      for (const field of requiredTextFields) expect(post[field].trim().length).toBeGreaterThan(0);
    }
  });

  for (const language of languages) {
    it(`keeps complete metadata in ${language} translations`, () => {
      for (const source of posts) {
        const file = path.join(process.cwd(), "src/data/blog-i18n", language, `${source.slug}.json`);
        expect(fs.existsSync(file), `missing ${language}/${source.slug}.json`).toBe(true);

        const translated = JSON.parse(fs.readFileSync(file, "utf8"));
        expect(translated.slug).toBe(source.slug);
        expect(translated.coverImage).toBe(source.coverImage);
        expect(translated.publishedAt).toBe(source.publishedAt);
        expect(translated.readingTime).toBe(source.readingTime);
        expect(Boolean(translated.featured)).toBe(Boolean(source.featured));
        expect(translated.tags).toHaveLength(source.tags.length);
        for (const field of requiredTextFields) expect(translated[field].trim().length).toBeGreaterThan(0);
      }
    });
  }
});