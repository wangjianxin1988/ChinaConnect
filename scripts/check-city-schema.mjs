/**
 * 新城市上线前的数据契约校验。
 *
 * 背景：2026-10-18 香格里拉上线，CI 连续两次 build 失败，都是因为新城市 JSON 与
 * 已有 35 城的 schema 不一致（emergencyContacts 是 dict、transport 缺 arrival/local），
 * 而页面代码直接对这些字段做 .map/.filter，静态生成时崩溃。
 *
 * 这个脚本把 src/pages/city/[slug].astro 里真实用到的所有 .map/.filter 表达式
 * 对着目标城市数据跑一遍，任何一个抛错就是上线阻塞项。
 *
 * 用法：node scripts/verify-city-schema.mjs shangri-la
 *       node scripts/verify-city-schema.mjs shangri-la --langs   # 含 11 语言
 */
import fs from "fs";
import path from "path";

const slug = process.argv[2];
if (!slug) {
  console.error("用法: node scripts/verify-city-schema.mjs <city-slug> [--langs]");
  process.exit(2);
}
const withLangs = process.argv.includes("--langs");
const LANGS = ["ja", "ko", "th", "vi", "ru", "fr", "de", "ar", "fa", "zh-CN", "zh-TW"];

function loadCity(lang) {
  const p =
    lang === "en"
      ? path.resolve("src/data/cities", `${slug}.json`)
      : path.resolve("src/data/cities-i18n", lang, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** 页面 city/[slug].astro 里真实出现的表达式（改页面时同步这里） */
const CHECKS = [
  // 基础数组
  ["attractions", (c) => c.attractions.length],
  ["attractions.slice(0,5).map", (c) => c.attractions.slice(0, 5).map((x) => x)],
  ["restaurants.slice(0,5).map", (c) => c.restaurants.slice(0, 5).map((x) => x)],
  ["highlights.slice(0,3).map", (c) => c.highlights.slice(0, 3).map((x) => x)],
  ["highlights.map", (c) => c.highlights.map((x) => x)],

  // climate
  ["climate.bestMonths.map", (c) => c.climate.bestMonths.map((x) => x)],

  // transport —— 2026-10-18 两次 build 失败的根因
  ["transport.arrival.map", (c) => c.transport.arrival.map((x) => x)],
  ["transport.local.metro||[]", (c) => (c.transport.local.metro || []).map((x) => x)],
  ["transport.local.bus||[]", (c) => (c.transport.local.bus || []).map((x) => x)],
  ["transport.local.taxi||[]", (c) => (c.transport.local.taxi || []).map((x) => x)],
  ["transport.local.bike||[]", (c) => (c.transport.local.bike || []).map((x) => x)],

  // payment
  ["payment.map", (c) => c.payment.map((x) => x)],
  ["payment[].howToUse.map", (c) => c.payment.forEach((m) => m.howToUse.map((x) => x))],
  ["payment[].tips.map", (c) => c.payment.forEach((m) => m.tips.map((x) => x))],

  // emergency
  ["emergencyContacts.filter(hospital)", (c) => c.emergencyContacts.filter((x) => x.type === "hospital")],
  ["emergencyContacts.filter(embassy)", (c) => c.emergencyContacts.filter((x) => x.type === "embassy")],
  ["emergencyContacts.filter(others)", (c) => c.emergencyContacts.filter((x) => x.type !== "hospital" && x.type !== "embassy")],

  // culturalTips
  ["culturalTips.length", (c) => c.culturalTips.length],
  ["culturalTips[].title+content", (c) => c.culturalTips.forEach((t) => `${t.title}${t.content}`)],

  // 卡片/地图用到的嵌套数组
  ["attractions[].highlights.slice", (c) => c.attractions.forEach((a) => (a.highlights || []).slice(0, 4))],
  ["restaurants[].dishHighlights", (c) => c.restaurants.forEach((r) => (r.dishHighlights || []).map((x) => x))],
  ["restaurants[].tags", (c) => c.restaurants.forEach((r) => (r.tags || []).map((x) => x))],
];

function runChecks(lang) {
  const city = loadCity(lang);
  if (!city) return { lang, missing: true, fails: [] };
  const fails = [];
  for (const [label, fn] of CHECKS) {
    try {
      fn(city);
    } catch (e) {
      fails.push({ label, err: e.message });
    }
  }
  return { lang, missing: false, fails };
}

const langs = withLangs ? ["en", ...LANGS] : ["en"];
let total = 0;
console.log(`校验城市: ${slug}\n`);
for (const lang of langs) {
  const r = runChecks(lang);
  if (r.missing) {
    console.log(`  ${lang.padEnd(7)} 文件缺失`);
    total++;
    continue;
  }
  if (r.fails.length === 0) {
    console.log(`  ${lang.padEnd(7)} ✅ ${CHECKS.length} 项通过`);
  } else {
    total += r.fails.length;
    console.log(`  ${lang.padEnd(7)} ❌ ${r.fails.length}/${CHECKS.length} 项失败:`);
    for (const f of r.fails) console.log(`            ${f.label}: ${f.err}`);
  }
}

console.log(total === 0 ? "\n✅ 全部通过，可以上线" : `\n❌ 共 ${total} 项阻塞，先修数据再上线`);
process.exit(total === 0 ? 0 : 1);
