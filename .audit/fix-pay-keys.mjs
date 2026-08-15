import fs from "node:fs";

// ---- 1. payKey additions in city page ----
const p1 = "src/pages/[lang]/city/[slug].astro";
let s1 = fs.readFileSync(p1, "utf8");
const oldFn = '  if (m === "foreign exchange") return "pay_foreign_exchange";\n  return "";';
const newFn = `  if (m === "foreign exchange") return "pay_foreign_exchange";
  if (m === "traveler's cheques" || m === "traveler checks") return "pay_travelers_checks";
  if (m === "international cards") return "pay_international_cards";
  if (m === "changsha tong card") return "pay_changsha_tong";
  if (m === "wuhan tong card") return "pay_wuhan_tong";
  if (m === "beer voucher") return "pay_beer_voucher";
  if (m === "apple pay / contactless") return "pay_apple_pay_contactless";
  if (m === "apple pay / google pay") return "pay_apple_google_pay";
  if (m === "mobile payment via digital wallet") return "pay_mobile_wallet";
  if (m === "mobile wallets (apple pay/google pay)") return "pay_mobile_wallets";
  if (m === "visa/mastercard") return "pay_visa_mastercard";
  return "";`;
if (s1.includes(oldFn)) { s1 = s1.split(oldFn).join(newFn); console.log("payKey extended"); }
else console.error("NOT FOUND: payKey fn");
// Pro Tips heading
const oldPT = '<span>💡</span> Pro Tips';
const newPT = '<span>💡</span> <span data-i18n="cityPage.proTips">{_lookup("cityPage.proTips")}</span>';
if (s1.includes(oldPT)) { s1 = s1.split(oldPT).join(newPT); console.log("Pro Tips fixed"); }
else console.error("NOT FOUND: Pro Tips");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);

// ---- 2. COMP_STRINGS pay keys ----
const p2 = "src/i18n/components-strings.ts";
let s2 = fs.readFileSync(p2, "utf8");
const LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"];
const PAY = {
  pay_travelers_checks: ["Traveler's Checks", "トラベラーズチェック"],
  pay_international_cards: ["International Cards", "国際カード"],
  pay_changsha_tong: ["Changsha Tong Card", "長沙通カード"],
  pay_wuhan_tong: ["Wuhan Tong Card", "武漢通カード"],
  pay_beer_voucher: ["Beer Voucher", "ビール引換券"],
  pay_apple_pay_contactless: ["Apple Pay / Contactless", "Apple Pay / 非接触決済"],
  pay_apple_google_pay: ["Apple Pay / Google Pay", "Apple Pay / Google Pay"],
  pay_mobile_wallet: ["Mobile Payment via Digital Wallet", "デジタルウォレットによるモバイル決済"],
  pay_mobile_wallets: ["Mobile Wallets (Apple Pay/Google Pay)", "モバイルウォレット（Apple Pay/Google Pay）"],
  pay_visa_mastercard: ["Visa/Mastercard", "Visa/マスターカード"],
};
// insert after pay_credit_cards block end (line with "  pay_apps_recommended: {")
const anchor = "  pay_apps_recommended: {";
let block = "";
for (const [key, [en, ja]] of Object.entries(PAY)) {
  block += `  ${key}: {\n`;
  for (const L of LANGS) {
    const v = L === "en" ? en : L === "ja" ? ja : en;
    block += `    ${L}: ${JSON.stringify(v)},\n`;
  }
  block += `  },\n`;
}
if (s2.includes(anchor)) { s2 = s2.split(anchor).join(block + anchor); console.log("COMP_STRINGS pay keys added:", Object.keys(PAY).length); }
else console.error("NOT FOUND: pay_apps_recommended anchor");
fs.writeFileSync(p2 + ".tmp", s2);
fs.renameSync(p2 + ".tmp", p2);
