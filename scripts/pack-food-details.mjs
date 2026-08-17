// @ts-check
/**
 * Post-build packer for localized food detail pages.
 *
 * Cloudflare Pages free plan caps each deployment at 20,000 files, but the
 * full 12-language restaurant detail set is ~21,600 HTML files. This script
 * keeps the English detail pages as static files and repackages the 11
 * localized language variants into:
 *   - dist/food-skeleton/{lang}.html   (shared per-language page chrome)
 *   - dist/food-delta/{lang}/{n}.json  (per-restaurant deltas, 26 chunks/lang)
 * The edge Worker (functions/[[path]].ts) reassembles the exact same HTML on
 * demand, so SEO/GEO/UX output is byte-identical to the static pages.
 *
 * Usage: node scripts/pack-food-details.mjs [--full-verify]
 */

import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const LANGS = ["ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const DIST = "dist";
const CHUNK_COUNT = 26;

const TOKENS = [
  "{{HTML_TAG}}", "{{TITLE}}", "{{OG_TITLE}}", "{{TW_TITLE}}",
  "{{OG_URL}}", "{{CANONICAL}}", "{{HREFLANG}}",
  "{{HEADER}}", "{{ISLAND}}", "{{SAMECITY}}",
];

// FNV-1a — must stay in sync with functions/[[path]].ts
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
const chunkOf = (id) => fnv1a(id) % CHUNK_COUNT;

function extractBetween(html, start, end) {
  const s = html.indexOf(start);
  if (s < 0) return { ok: false, value: "" };
  const e = html.indexOf(end, s + start.length);
  if (e < 0) return { ok: false, value: "" };
  return { ok: true, value: html.slice(s + start.length, e) };
}

function extractHeadTokens(html) {
  const grab = (re) => {
    const m = html.match(re);
    return m ? m[1] : "";
  };
  return {
    htmlTag: (html.match(/<html[^>]*>/) || [""])[0],
    title: grab(/<title>([\s\S]*?)<\/title>/),
    ogTitle: grab(/<meta property="og:title" content="([^"]*)"/),
    twTitle: grab(/<meta name="twitter:title" content="([^"]*)"/),
    ogUrl: grab(/<meta property="og:url" content="([^"]*)"/),
    canonical: grab(/<link rel="canonical" href="([^"]*)"/),
    hreflang: (html.match(/<link rel="alternate" hreflang="en"[\s\S]*?<link rel="alternate" hreflang="x-default"[^>]*>/) || [""])[0],
  };
}

function stripMarkers(html) {
  return html
    .replace(/<!--FOOD_HEADER_START-->|<!--FOOD_HEADER_END-->/g, "")
    .replace(/<!--FOOD_ISLAND_START-->|<!--FOOD_ISLAND_END-->/g, "")
    .replace(/<!--FOOD_SAMECITY_START-->|<!--FOOD_SAMECITY_END-->/g, "");
}

function buildSkeleton(html) {
  let s = html;
  s = s.replace(/<html[^>]*>/, "{{HTML_TAG}}");
  s = s.replace(/<title>[\s\S]*?<\/title>/, "<title>{{TITLE}}</title>");
  s = s.replace(/<title>[\s\S]*?<\/title>/g, "<title>{{TITLE}}</title>");
  s = s.replace(/<meta property="og:title" content="[^"]*"/, '<meta property="og:title" content="{{OG_TITLE}}"');
  s = s.replace(/<meta name="twitter:title" content="[^"]*"/, '<meta name="twitter:title" content="{{TW_TITLE}}"');
  s = s.replace(/<meta property="og:url" content="[^"]*"/, '<meta property="og:url" content="{{OG_URL}}"');
  s = s.replace(/<link rel="canonical" href="[^"]*"/, '<link rel="canonical" href="{{CANONICAL}}"');
  s = s.replace(/<link rel="alternate" hreflang="en"[\s\S]*?<link rel="alternate" hreflang="x-default"[^>]*>/, "{{HREFLANG}}");
  s = s.replace(/<!--FOOD_HEADER_START-->[\s\S]*?<!--FOOD_HEADER_END-->/, "{{HEADER}}");
  s = s.replace(/<!--FOOD_ISLAND_START-->[\s\S]*?<!--FOOD_ISLAND_END-->/, "{{ISLAND}}");
  s = s.replace(/<!--FOOD_SAMECITY_START-->[\s\S]*?<!--FOOD_SAMECITY_END-->/, "{{SAMECITY}}");
  for (const t of TOKENS) {
    if (!s.includes(t)) throw new Error("skeleton missing token " + t);
  }
  return s;
}

export function assemble(skeleton, entry) {
  let s = skeleton;
  const values = [
    entry.htmlTag, entry.title, entry.ogTitle, entry.twTitle,
    entry.ogUrl, entry.canonical, entry.hreflang,
    entry.header, entry.island, entry.sameCity || "",
  ];
  for (let i = 0; i < TOKENS.length; i++) {
    s = s.split(TOKENS[i]).join(values[i]);
  }
  return s;
}

async function main() {
  const fullVerify = process.argv.includes("--full-verify");
  let totalPages = 0;
  let totalChunks = 0;

  for (const lang of LANGS) {
    const langFoodDir = path.join(DIST, lang, "food");
    const ids = (await readdir(langFoodDir, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    if (ids.length === 0) {
      throw new Error("pack-food-details: no localized food pages under " + langFoodDir);
    }

    const chunks = Array.from({ length: CHUNK_COUNT }, () => ({}));
    let skeletonSource = null;
    let verifiedCount = 0;

    for (const id of ids) {
      const file = path.join(langFoodDir, id, "index.html");
      const html = await readFile(file, "utf-8");

      const head = extractHeadTokens(html);
      const header = extractBetween(html, "<!--FOOD_HEADER_START-->", "<!--FOOD_HEADER_END-->");
      const island = extractBetween(html, "<!--FOOD_ISLAND_START-->", "<!--FOOD_ISLAND_END-->");
      const sameCity = extractBetween(html, "<!--FOOD_SAMECITY_START-->", "<!--FOOD_SAMECITY_END-->");
      if (!header.ok || !island.ok) {
        throw new Error("pack-food-details: markers missing in " + lang + "/" + id + " (header=" + header.ok + ", island=" + island.ok + ")");
      }

      const entry = {
        htmlTag: head.htmlTag,
        title: head.title,
        ogTitle: head.ogTitle,
        twTitle: head.twTitle,
        ogUrl: head.ogUrl,
        canonical: head.canonical,
        hreflang: head.hreflang,
        header: header.value,
        island: island.value,
        sameCity: sameCity.ok ? sameCity.value : "",
      };

      chunks[chunkOf(id)][id] = entry;
      if (!skeletonSource) skeletonSource = html;
      totalPages++;
    }

    const skeleton = buildSkeleton(skeletonSource);
    await mkdir(path.join(DIST, "food-skeleton"), { recursive: true });
    await writeFile(path.join(DIST, "food-skeleton", lang + ".html"), skeleton, "utf-8");

    await mkdir(path.join(DIST, "food-delta", lang), { recursive: true });
    for (let ci = 0; ci < CHUNK_COUNT; ci++) {
      const data = JSON.stringify(chunks[ci]);
      if (data.length > 2) {
        await writeFile(path.join(DIST, "food-delta", lang, ci + ".json"), data, "utf-8");
        totalChunks++;
      }
    }

    // ---- verification: reassembly must equal the original (markers stripped) ----
    const verifyIds = [];
    if (fullVerify) {
      verifyIds.push(...ids);
    } else {
      verifyIds.push(
        ids[0],
        ids[Math.floor(ids.length / 2)],
        ids[ids.length - 1],
        ...ids.filter((_, i) => i % Math.max(1, Math.floor(ids.length / 12)) === 0).slice(0, 10),
      );
    }
    for (const id of verifyIds) {
      const original = await readFile(path.join(langFoodDir, id, "index.html"), "utf-8");
      const expected = stripMarkers(original);
      const assembled = assemble(skeleton, chunks[chunkOf(id)][id]);
      if (assembled !== expected) {
        let d = 0;
        while (d < Math.min(assembled.length, expected.length) && assembled[d] === expected[d]) d++;
        throw new Error(
          "pack-food-details: ASSEMBLY MISMATCH " + lang + "/" + id + " at byte " + d + "\n" +
          "expected: ..." + JSON.stringify(expected.slice(Math.max(0, d - 80), d + 120)) + "...\n" +
          "actual:   ..." + JSON.stringify(assembled.slice(Math.max(0, d - 80), d + 120)) + "...",
        );
      }
      verifiedCount++;
    }
    console.log("packed " + lang + ": " + ids.length + " pages, " + verifiedCount + " verified, skeleton + " + CHUNK_COUNT + " chunk slots");

    // ---- remove localized static pages (keep dist/{lang}/food/index.html list page) ----
    for (const d of await readdir(langFoodDir, { withFileTypes: true })) {
      if (d.isDirectory()) {
        await rm(path.join(langFoodDir, d.name), { recursive: true, force: true });
      }
    }
  }

  console.log("\npack-food-details OK: " + totalPages + " pages -> " + totalChunks + " delta chunks (+" + LANGS.length + " skeletons), verified " + (fullVerify ? "ALL" : "sample"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
