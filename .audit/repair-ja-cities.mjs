// .audit/repair-ja-cities.mjs
// Phase A: deterministic structural repair of 35 ja city JSONs
// Phase B: batch-translate remaining English display strings to Japanese via DeepSeek
import fs from "node:fs";
import path from "node:path";

const DIR = "src/data/cities-i18n/ja";
const SRC = "src/data/cities";

const RESTYPE = {
  "ミシュラン": "michelin",
  "黒真珠": "blackpearl",
  "ローカル": "local",
  "カフェ": "cafe",
  "ストリート": "street",
  "国際料理": "international",
  "チェーン店": "chain",
  "本格的": "fine",
  "奢侈": "luxury",
  "ビュッフェ": "buffet",
  "高級レストラン": "fine-dining",
  "モダン": "modern",
  "ファーストフード": "fastfood",
};
const BUDGET = {
  "高級": "luxury",
  "格安": "budget",
  "ミッドレンジ": "mid",
  "mid": "mid",
  "undefined": "mid",
};
const IMPORTANCE = { "高": "high", "中程度": "medium", "低": "low" };
const PAY_ICON = {
  alipay: "alipay", "wechat-pay": "wechat", wechat: "wechat",
  cash: "cash", unionpay: "unionpay", "visa-mastercard": "card",
  "travelers-cheques": "exchange", "international-cards": "card",
  "tsingtao-beer-voucher": "cash", "applepay": "applepay",
};
const PAY_METHOD_FROM_ICON = {
  alipay: "Alipay", wechat: "WeChat Pay", cash: "Cash", unionpay: "UnionPay",
  card: "Credit Cards", exchange: "Foreign Exchange", applepay: "Apple Pay",
  wallet: "Mobile Wallet", "credit-card": "Credit Cards", "mobile-pay": "Mobile Payment",
};
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const IDLIKE = /^[a-z]+-\d+$/;

function loadEn(slug) {
  const p = path.join(SRC, slug + ".json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

let repaired = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const file = path.join(DIR, f);
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const slug = d.slug || f.replace(".json", "");
  const en = loadEn(slug);
  let changed = false;

  // 1) restaurant.type
  for (const r of d.restaurants || []) {
    if (RESTYPE[r.type]) { r.type = RESTYPE[r.type]; changed = true; }
    if (r.category === "undefined" || r.category === undefined) { delete r.category; changed = true; }
    if (IDLIKE.test(r.name || "") && r.nameEn) { r.name = r.nameEn; changed = true; }
  }
  // 2) hotel.budget
  for (const h of d.hotels || []) {
    if (BUDGET[h.budget] !== undefined) { h.budget = BUDGET[h.budget]; changed = true; }
    if (h.category === "undefined" || h.category === undefined) { delete h.category; changed = true; }
  }
  // 3) culturalTips importance
  for (const t of d.culturalTips || []) {
    if (IMPORTANCE[t.importance]) { t.importance = IMPORTANCE[t.importance]; changed = true; }
  }
  // 4) transport arrival type fix
  for (const a of d.transport?.arrival || []) {
    if (a.type === "自家用車") { a.type = "car"; changed = true; }
  }
  // 5) payment normalization
  for (const p of d.payment || []) {
    if (typeof p.method !== "string" || !p.method) {
      if (typeof p.nameEn === "string" && p.nameEn) {
        p.method = p.nameEn; changed = true;
      } else if (p.id && PAY_METHOD_FROM_ICON[PAY_ICON[p.id]]) {
        p.method = PAY_METHOD_FROM_ICON[PAY_ICON[p.id]]; changed = true;
      }
    }
    if (typeof p.icon !== "string" || !p.icon) {
      const icon = PAY_ICON[p.id] || (p.method ? String(p.method).toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : "");
      if (icon) { p.icon = icon; changed = true; }
    }
  }
  // 6) emergency contacts: restore nameEn/address/notes from en source; add nameJa
  const enContacts = en?.emergencyContacts || [];
  const byTypePhone = new Map();
  for (const ec of enContacts) byTypePhone.set(ec.type + "|" + ec.phone, ec);
  for (const c of d.emergencyContacts || []) {
    if (c.category === "undefined" || c.category === undefined) { delete c.category; changed = true; }
    const src = byTypePhone.get(c.type + "|" + c.phone);
    if (src) {
      if (!c.nameJa && typeof c.name === "string" && c.name) { c.nameJa = c.name; changed = true; }
      if (typeof src.nameEn === "string" && src.nameEn && c.nameEn !== src.nameEn) { c.nameEn = src.nameEn; changed = true; }
      if (typeof src.address === "string" && src.address && c.address !== src.address) { c.address = src.address; changed = true; }
      if (typeof src.notes === "string" && src.notes && c.notes !== src.notes) { c.notes = src.notes; changed = true; }
    } else {
      if (!c.nameJa && typeof c.name === "string" && c.name) { c.nameJa = c.name; changed = true; }
    }
  }
  // 7) city-level nameEn -> Japanese name when name is CJK
  if (d.name && CJK.test(d.name) && !CJK.test(d.nameEn || "")) { d.nameEn = d.name; changed = true; }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(d, null, 2) + "\n");
    repaired++;
  }
}
console.log("files structurally repaired:", repaired);
