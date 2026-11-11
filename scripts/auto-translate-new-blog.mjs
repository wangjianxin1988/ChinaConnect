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
import { getTranslateProvider } from "./lib/translate-provider.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// 2026-08-31 信哥要求:翻译全部切到 DeepSeek（原 MiniMax key 已失效 HTTP 401）
try { process.loadEnvFile(); } catch (e) { if (e?.code !== "ENOENT") throw e; }
const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();

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

// ---------------------------------------------------------------------------
// 2026-10-18: a 1500-2500 word post could not be translated in one JSON call — the
// model had to echo the whole article back inside a JSON string, blew past max_tokens,
// the JSON arrived truncated and every language failed with "No JSON in response".
// Split into: metadata (small JSON) + content (plain markdown, chunked by section).
// ---------------------------------------------------------------------------

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function chat(prompt, maxTokens = 8000, timeoutMs = 180000) {
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content || "";
}

// Split markdown on "## " headings, then hard-split any section that is still too long
// on blank lines. Tables and code blocks never straddle a heading, so they stay intact.
function splitMarkdown(md, maxChars = 1600) {
  const sections = md.split(/\n(?=## )/);
  const chunks = [];
  let cur = "";
  for (const s of sections) {
    if (cur && cur.length + s.length + 1 > maxChars) { chunks.push(cur); cur = s; }
    else cur = cur ? cur + "\n" + s : s;
  }
  if (cur) chunks.push(cur);

  const out = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChars * 1.6) { out.push(chunk); continue; }
    const paras = chunk.split(/\n\n/);
    let buf = "";
    for (const para of paras) {
      if (buf && buf.length + para.length + 2 > maxChars) { out.push(buf); buf = para; }
      else buf = buf ? buf + "\n\n" + para : para;
    }
    if (buf) out.push(buf);
  }
  return out.filter((x) => x.trim().length > 0);
}

async function translateMetadata(post, lang) {
  const src = {
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    author: post.author,
  };
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a China travel site for foreign visitors.
Translate the values below into ${TARGETS[lang]}.

SOURCE:
${JSON.stringify(src, null, 2)}

RULES:
- Output ONLY a single JSON object with exactly these keys: title, description, category, tags, author.
- No markdown, no commentary, no code fences.
- tags must stay an array with exactly ${post.tags.length} entries, each translated.
- Keep numbers, prices, and the brand name ChinaConnect unchanged.
- For author: keep proper names as-is; translate role titles like "Editorial Team".`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const content = await chat(prompt, 2000, 90000);
      const cleaned = content.trim().replace(/^```[a-z]*\n?/i, "").replace(/\n?```\s*$/, "");
      const s = cleaned.indexOf("{");
      const e = cleaned.lastIndexOf("}");
      if (s === -1 || e === -1) throw new Error("No JSON in metadata response");
      const parsed = JSON.parse(cleaned.slice(s, e + 1));
      for (const f of ["title", "description", "category", "author"]) {
        if (typeof parsed[f] !== "string" || !parsed[f].trim()) throw new Error(`missing ${f}`);
      }
      if (!Array.isArray(parsed.tags) || parsed.tags.length !== post.tags.length) {
        throw new Error("tags length mismatch");
      }
      return parsed;
    } catch (e) {
      if (attempt === 3) throw new Error(`metadata failed: ${e.message}`);
      await sleep(800 * attempt);
    }
  }
}

async function translateContentChunk(chunk, lang, idx, total) {
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a China travel site for foreign visitors.
Translate the following Markdown section into ${TARGETS[lang]}. This is part ${idx} of ${total}.

RULES:
- Output ONLY the translated Markdown. No JSON, no code fences, no commentary.
- Preserve ALL Markdown syntax exactly: # ## ### headings, - bullets, **bold**, | tables |, [links](url), --- rules, > quotes.
- Keep URLs and prices (¥45) unchanged. Keep all figures identical.
- Write dates and times in the natural form of the target language - never leave an English month name in the output (Japanese: 2026年12月31日; Simplified Chinese: 2026年12月31日; Arabic: 31 ديسمبر 2026).
- Translate the country name "China" into the target language (Japanese: 中国, Chinese: 中国, Arabic: الصين) except inside URLs or the brand name ChinaConnect.
- Translate government body names (National Immigration Administration, Ministry of Foreign Affairs, State Council) into the target language.
- Render all other proper nouns (city, airline, company names) in the script of the target language where a conventional form exists.
- Do not add, merge, or remove sections. Do not summarise. Translate every sentence.
- Do not restate these instructions.

CONTENT:
${chunk}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const out = await chat(prompt, 8000, 180000);
      let t = out.trim().replace(/^```(?:markdown|md)?\n?/i, "").replace(/\n?```\s*$/, "");
      if (t.length < chunk.length * 0.25) throw new Error(`translation suspiciously short (${t.length} vs ${chunk.length})`);
      return t;
    } catch (e) {
      if (attempt === 3) throw new Error(`chunk ${idx}/${total} failed: ${e.message}`);
      await sleep(800 * attempt);
    }
  }
}

async function translatePost(post, lang) {
  const meta = await translateMetadata(post, lang);
  const chunks = splitMarkdown(post.content);
  log(`  [${lang}] "${post.slug}" content → ${chunks.length} chunk(s)`);

  const translated = [];
  for (let i = 0; i < chunks.length; i++) {
    translated.push(await translateContentChunk(chunks[i], lang, i + 1, chunks.length));
    log(`  [${lang}] chunk ${i + 1}/${chunks.length} ok`);
  }

  return {
    ...post,
    title: meta.title,
    description: meta.description,
    category: meta.category,
    tags: meta.tags,
    author: meta.author,
    content: translated.join("\n"),
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
  // 2026-10-18: translating languages serially took ~38 min per post (7 chunks each,
  // ~3.5 min per language). Run them in waves instead.
  const CONCURRENCY = Number(process.env.BLOG_TRANSLATE_CONCURRENCY || 3);

  async function processLang(lang) {
    const slugs = specific
      ? missingByLang[lang].filter((s) => specific.includes(s))
      : missingByLang[lang];
    if (slugs.length === 0) return;
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

  for (let i = 0; i < langsToProcess.length; i += CONCURRENCY) {
    const wave = langsToProcess.slice(i, i + CONCURRENCY);
    await Promise.all(wave.map((lang) =>
      processLang(lang).catch((e) => {
        log(`[${lang}] failed: ${e?.message || e}`);
        failures.push(`${lang}/*`);
      })
    ));
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