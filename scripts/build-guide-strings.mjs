// Collect all translatable strings from guide data modules + guide component literals.
// Data: src/data/guide/*.ts + business/*.ts + cultural-warnings/price-transparency/scam-prevention
// Components: inline Bi/jaText/guideText/localized literals + `lang === "ja" ? "ZH" : "EN"` ternaries.
import fs from "node:fs";
import path from "node:path";

const DATA_DIRS = ["src/data/guide", "src/data/guide/business"];
const EXTRA_FILES = [
  "src/data/cultural-warnings.ts",
  "src/data/price-transparency.ts",
  "src/data/scam-prevention.ts",
];
const COMPONENT_DIR = "src/components/Guide";
const EXCLUDE = /^(https?:\/\/|tel:|mailto:|\/img\/|\/icons\/|data:image|\{|\}|<[^>]+>)/i;
const NON_TEXT = /^[\d\s.,¥$€£₩₹₽+\-():/%×·•&'"]+$/;
const EMOJI_ONLY = /^[\p{Extended_Pictographic}\u200d\ufe0f\s]+$/u;

function isTranslatable(s) {
  if (!s || s.trim().length === 0) return false;
  if (EXCLUDE.test(s)) return false;
  if (NON_TEXT.test(s)) return false;
  if (EMOJI_ONLY.test(s)) return false;
  return true;
}

// Object fields that are internal identifiers / not user-facing display text.
const SKIP_FIELDS = new Set([
  "id", "key", "slug", "href", "url", "phone", "email", "code",
  "icon", "emoji", "colorClass", "bg", "text", "border",
]);
// Tailwind-style CSS class strings must never be treated as translatable.
const CSS_CLASS_RE =
  /^(?:[a-z]+(?:-[a-z0-9]+)+|hover:|focus:|dark:|md:|lg:|sm:|px-\d|py-\d)(?:\s+(?:[a-z]+(?:-[a-z0-9]+)+|hover:|focus:|dark:|md:|lg:|sm:))*$/;

function walk(value, out) {
  if (typeof value === "string") {
    if (!CSS_CLASS_RE.test(value)) out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (SKIP_FIELDS.has(key)) continue;
      walk(value[key], out);
    }
    return;
  }
}

const files = [];
for (const dir of DATA_DIRS) {
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".ts") || name === "ja-overrides.ts") continue;
    if (/^overrides-[\w-]+\.ts$/.test(name)) continue; // generated per-lang dicts, not source data
    files.push(path.join(dir, name));
  }
}
for (const f of EXTRA_FILES) files.push(f);

const all = [];
for (const file of files) {
  const mod = await import(new URL(`../${file}`, import.meta.url).href);
  for (const key of Object.keys(mod)) {
    walk(mod[key], all);
  }
}

// Component inline literals
const INLINE = /(?:localized\(\s*"([^"]*)"\s*,\s*"([^"]*)"|<Bi\s+en="([^"]*)"\s+zh="([^"]*)"|jaText\(\s*"([^"]+)"|guideText\(\s*"([^"]+)"|lang\s*===\s*"ja"\s*\?\s*"([^"]*)"\s*:\s*"([^"]*)")/g;
const compFiles = fs.readdirSync(COMPONENT_DIR).filter((n) => n.endsWith(".tsx"));
for (const name of compFiles) {
  const text = fs.readFileSync(path.join(COMPONENT_DIR, name), "utf8");
  for (const m of text.matchAll(INLINE)) {
    const [, le, lz, be, bz, jt, gt, tzh, ten] = m;
    if (le !== undefined && lz !== undefined) all.push(le, lz);
    if (be !== undefined && bz !== undefined) all.push(be, bz);
    if (jt !== undefined) all.push(jt);
    if (gt !== undefined) all.push(gt);
    if (tzh !== undefined && ten !== undefined) all.push(tzh, ten);
  }
}


// Curated extra strings used by guide components that regex extraction cannot catch
// (multiline ternaries / hand-written localized() calls / template placeholders).
const EXTRAS = [
  "The China Import and Export Fair (Canton Fair) is the oldest, largest, and most successful trade fair in China. Held every spring and autumn in Guangzhou.",
  "中国輸出入商品交易会（広州交易会）は、中国で最も歴史が古く、最大規模で最も成功した見本市です。毎年春と秋に広州で開催されます。",
  "Book consecutive interpreters at least 3–5 days in advance",
  "逐次通訳は少なくとも3〜5日前までに予約",
  "Book simultaneous interpreters at least 1–2 weeks in advance (equipment prep required)",
  "同時通訳は少なくとも1〜2週間前までに予約（機材準備が必要）",
  "For certified legal translation, add 3–5 days for notarization if needed",
  "公認法務翻訳の場合、認証に3〜5日追加",
  "Always request a CV or portfolio before confirming an interpreter",
  "通訳者確定前に履歴書や実績ポートフォリオを必ず確認",
  "Confirm if transportation and accommodation are included in the quote",
  "交通費・宿泊費が見積もりに含まれるか確認",
  "This guide is for informational purposes only. Registration requirements change frequently and vary by city, industry, and nationality. Always consult a licensed Chinese corporate service provider or lawyer before starting the registration process.",
  "本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。",
  "Showing {count} events",
  "全{count}件のイベントを表示中",
  "Requirements:",
  "Weeks Before Travel (4-6 weeks)",
  "Complete these 4-6 weeks before departure",
  "Quick Tips",
  "クイックヒント",
  "Setup difficulty: ",
  "セットアップ難易度：",
  "reliability",
  " speed",
];

all.push(...EXTRAS);
const unique = [...new Set(all.filter(isTranslatable))];
console.log("files:", files.length, "components:", compFiles.length, "total strings:", all.length, "unique translatable:", unique.length);
fs.writeFileSync(".audit/guide-strings.json", JSON.stringify({ files, strings: unique }, null, 1), "utf8");
