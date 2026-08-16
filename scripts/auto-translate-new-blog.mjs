// Translate newly added blog posts to all 11 non-English languages.
// Usage:
//   node scripts/auto-translate-new-blog.mjs                # check & translate all new
//   node scripts/auto-translate-new-blog.mjs my-post-slug    # specific slug
//
// This is invoked by the prebuild hook to ensure every blog post has translations
// for all 12 supported languages. The English source lives in src/data/blog/posts.json;
// translated files live in src/data/blog-i18n/<lang>/<slug>.json.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getMiniMaxConfig } from "./lib/minimax-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const { apiKey: KEY, baseUrl: HOST } = getMiniMaxConfig();
const MODEL = "MiniMax-Text-01";

const LANGS = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];
const TARGETS = {
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese (Taiwan)",
  th: "Thai",
  vi: "Vietnamese",
  ru: "Russian",
  fr: "French",
  de: "German",
  ar: "Modern Standard Arabic",
  fa: "Modern Persian (Farsi)",
};

const POSTS_FILE = path.join(ROOT, "src/data/blog/posts.json");
const I18N_DIR = path.join(ROOT, "src/data/blog-i18n");

const args = process.argv.slice(2);
const specific = args.length > 0 ? args : null;

function log(...a) { console.log("[auto-translate-blog]", ...a); }

function listEnPosts() {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, "utf8"));
  return posts.map((p) => p.slug);
}

function getEnPost(slug) {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, "utf8"));
  return posts.find((p) => p.slug === slug);
}

function getTranslatedSlugs(lang) {
  const dir = path.join(I18N_DIR, lang);
  if (!fs.existsSync(dir)) return new Set();
  return new Set(fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
}

function diffNewPosts() {
  const all = listEnPosts();
  const missingByLang = {};
  for (const lang of LANGS) {
    const translated = getTranslatedSlugs(lang);
    const missing = all.filter((s) => !translated.has(s));
    if (missing.length) missingByLang[lang] = missing;
  }
  return missingByLang;
}

async function translatePost(post, lang) {
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website aimed at foreign visitors.

Translate the following blog post metadata and content into ${TARGETS[lang]}.

POST METADATA (JSON object):
${JSON.stringify({
  slug: post.slug,
  title: post.title,
  description: post.description,
  category: post.category,
  tags: post.tags,
  author: post.author,
  content: post.content,
}, null, 2)}

RULES:
- Output ONLY a single JSON object. No markdown, no commentary.
- Translate EVERY field except slug, readingTime, publishedAt, coverImage.
- Keep numbers, prices, times, units, brand names, and the slug unchanged.
- For author, if it is a proper name keep it; if it is a role like "Editorial Team" translate it.
- For Markdown content, translate the text but keep the formatting characters (# ## - ** etc.) intact.
- Output keys: slug, title, description, category, tags (array), author, content.`;

  const body = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 8000,
  };

  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(25000),
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 200)}`);
  }

  const j = await res.json();
  const content = j.choices?.[0]?.message?.content || "";
  const cleaned = content.trim().replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in response");
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  const translatedFields = ["title", "description", "category", "author", "content"];
  for (const field of translatedFields) {
    if (typeof parsed[field] !== "string" || parsed[field].trim().length === 0) {
      throw new Error(`Missing translated field: ${field}`);
    }
  }
  if (!Array.isArray(parsed.tags) || parsed.tags.length !== post.tags.length) {
    throw new Error("Translated tags must preserve the source tag count");
  }

  return {
    ...post,
    ...parsed,
    slug: post.slug,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    featured: Boolean(post.featured),
  };
}

async function writeTranslation(lang, slug, payload) {
  const dir = path.join(I18N_DIR, lang);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  log(`wrote ${lang}/${slug}.json (${Object.keys(payload).length} fields)`);
}

async function run() {
  const missingByLang = diffNewPosts();
  const langsToProcess = specific
    ? LANGS.filter((l) => missingByLang[l] && missingByLang[l].some((s) => specific.includes(s)))
    : Object.keys(missingByLang);

  if (langsToProcess.length === 0) {
    log("all blog posts already translated");
    return;
  }

  const failures = [];
  for (const lang of langsToProcess) {
    const slugs = specific
      ? missingByLang[lang].filter((s) => specific.includes(s))
      : missingByLang[lang];
    if (slugs.length === 0) continue;
    log(`language=${lang} missing=${slugs.length}`);
    for (const slug of slugs) {
      const post = getEnPost(slug);
      if (!post) {
        log(`  skip ${slug}: not found in posts.json`);
        continue;
      }
      let translated = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const payload = await translatePost(post, lang);
          await writeTranslation(lang, slug, payload);
          translated = true;
          break;
        } catch (e) {
          log(`  ${slug} attempt ${attempt} failed: ${e.message}`);
          if (attempt === 3) log(`  ${slug} GIVE UP - manual fix needed`);
          else await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
      if (!translated) failures.push(`${lang}/${slug}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  if (failures.length > 0) {
    throw new Error(`Failed blog translations: ${failures.join(", ")}`);
  }
  log("done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});