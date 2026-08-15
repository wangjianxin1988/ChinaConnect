import fs from "node:fs";
const JA_ADD = {
  "guidePage.indexTitle": "中国旅行ガイド - ChinaConnect",
  "guidePage.visaDescription": "中国旅行のビザ申請完全ガイド。国籍別の要件、申請手続き、必要書類、観光客向けのヒント。",
  "guidePage.accommodationTitle": "宿泊ガイド - ChinaConnect",
  "guidePage.accommodationDescription": "中国旅行の宿泊完全ガイド。ホテルタイプ、予約のコツ、チェックインの流れ、滞在中に役立つフレーズ。",
  "guidePage.communicationTitle": "通信ガイド - ChinaConnect",
  "guidePage.communicationDescription": "SIMカード、eSIM、VPN設定、必須アプリで中国でもつながり続ける方法。",
  "guidePage.departureTitle": "出発ガイド - ChinaConnect",
  "guidePage.departureDescription": "税金還付、空港アクセス、免税ショッピング、中国出国時の完全チェックリスト。",
  "guidePage.diningTitle": "食事ガイド - ChinaConnect",
  "guidePage.diningDescription": "中国のローカル料理、注文のコツ、食品衛生、食事マナー。",
  "guidePage.emergencyTitle": "緊急時対応 - ChinaConnect",
  "guidePage.emergencyDescription": "パスポート紛失、医療緊急、盗難、詐欺、中国の大使館連絡先。",
  "guidePage.paymentDescription": "支付宝（Alipay）、微信支付（WeChat Pay）、現金、中国での税金還付手続き。",
  "guidePage.scamPreventionTitle": "詐欺防止ガイド - ChinaConnect",
  "guidePage.scamPreventionDescription": "中国でよくある詐欺や観光トラブルから身を守る方法。",
  "guidePage.transparencyTitle": "価格透明性 - ChinaConnect",
  "guidePage.transparencyDescription": "適正価格を知り、ぼったくりを回避し、中国で自信を持って値切る方法。",
  "guidePage.transportDescription": "空港到着、地下鉄、バス、タクシー、中国国内の都市間交通オプション。",
  "guidePage.attractionsDescription": "万里の長城から隠れた名所まで、中国の主要観光スポット。",
  "guidePage.culturalWarningsTitle": "文化的注意点 - ChinaConnect",
  "guidePage.culturalWarningsDescription": "中国訪問時に避けるべき文化の違い、タブー、マナー違反。",
  "businessGuidePage.expoDescription": "中国主要の見本市・展示会カレンダー。広州交易会から各都市の業界イベントまで、ビジネス出張の計画に。",
  "businessGuidePage.invitationDescription": "中国ビザ申請とビジネス訪問用のバイリンガル招待状テンプレートをダウンロード。",
  "businessGuidePage.registrationDescription": "外国投資家として中国で会社登録するためのステップバイステップガイド。WFOE、代表事務所などの選択肢。",
  "businessGuidePage.etiquetteDescription": "名刺交換から食事マナーまで、中国ビジネス文化をマスター。外国人向けの実践的な注意点。",
  "businessGuidePage.translationDescription": "会議、商談、交渉のためのプロの通訳・翻訳サービスを予約。",
};
const EN_ADD = {
  "guidePage.indexTitle": "Complete Travel Guide to China - ChinaConnect",
  "guidePage.visaDescription": "Complete visa application guide for China travel. Requirements by country, application process, required documents, and tips for tourists.",
  "guidePage.accommodationTitle": "Accommodation Guide - ChinaConnect",
  "guidePage.accommodationDescription": "Complete accommodation guide for China travel. Hotel types, booking tips, check-in process, and useful phrases for your stay.",
  "guidePage.communicationTitle": "Communication Guide - ChinaConnect",
  "guidePage.communicationDescription": "Stay connected in China with SIM cards, eSIM, VPN setup, and essential apps.",
  "guidePage.departureTitle": "Departure Guide - ChinaConnect",
  "guidePage.departureDescription": "Tax refunds, airport transport, duty-free shopping, and a complete departure checklist for leaving China.",
  "guidePage.diningTitle": "Dining Guide - ChinaConnect",
  "guidePage.diningDescription": "Local cuisines, ordering tips, food safety, and dining etiquette in China.",
  "guidePage.emergencyTitle": "Emergency Procedures - ChinaConnect",
  "guidePage.emergencyDescription": "Lost passport, medical emergencies, theft, scams, and embassy contacts in China.",
  "guidePage.paymentDescription": "Alipay, WeChat Pay, cash, and tax refund procedures in China.",
  "guidePage.scamPreventionTitle": "Scam Prevention Guide - ChinaConnect",
  "guidePage.scamPreventionDescription": "Protect yourself from common scams and tourist traps in China.",
  "guidePage.transparencyTitle": "Price Transparency - ChinaConnect",
  "guidePage.transparencyDescription": "Know fair prices, avoid being overcharged, and bargain with confidence in China.",
  "guidePage.transportDescription": "Airport arrival, metro, bus, taxi, and inter-city transport options in China.",
  "guidePage.attractionsDescription": "Top attractions across China - from the Great Wall to hidden gems.",
  "guidePage.culturalWarningsTitle": "Cultural Warnings - ChinaConnect",
  "guidePage.culturalWarningsDescription": "Cultural differences, taboos, and faux pas to avoid when visiting China.",
  "businessGuidePage.expoDescription": "Complete calendar of major trade fairs and exhibitions in China including Canton Fair, auto shows, and industry events.",
  "businessGuidePage.invitationDescription": "Download ready-to-use bilingual invitation letter templates for China visa applications and business visits.",
  "businessGuidePage.registrationDescription": "Step-by-step guide to registering a WFOE, Representative Office, or other entity in China as a foreign investor.",
  "businessGuidePage.etiquetteDescription": "Master Chinese business etiquette including business card exchange, dining, meetings, and gift giving.",
  "businessGuidePage.translationDescription": "Book vetted interpreters and translators for meetings, conferences, and negotiations in China.",
};
for (const [file, adds] of [["ja-translations.json", JA_ADD], ["en-translations.json", EN_ADD]]) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const [k, v] of Object.entries(adds)) {
    if (j[k] === undefined) { j[k] = v; n++; }
    else console.log("exists:", file, k);
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log(file, "added", n, "keys");
}
