const fs = require("fs");
const p = "src/pages/[lang]/guide/business/index.astro";
let s = fs.readFileSync(p, "utf8");
const orig = s;
// add titleJa/descriptionJa and fix hrefs in tools array
s = s.replace(
  '    title: "Invitation Letter Templates",\n    titleCn: "商务邀请函模板",',
  '    title: "Invitation Letter Templates",\n    titleJa: "招待状テンプレート",\n    titleCn: "商务邀请函模板",'
);
s = s.replace(
  '    description:\n      "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",',
  '    description:\n      "Download ready-to-use bilingual invitation letters for visa applications. Editable formats covering trade delegations, conference attendance, and partner visits.",\n    descriptionJa:\n      "ビザ申請用のすぐに使えるバイリンガル招待状をダウンロード。貿易代表団、会議出席、パートナー訪問に対応する編集可能な形式。",'
);
s = s.replace(
  '    title: "Expo & Event Calendar",\n    titleCn: "展会与活动日历",',
  '    title: "Expo & Event Calendar",\n    titleJa: "見本市・イベントカレンダー",\n    titleCn: "展会与活动日历",'
);
s = s.replace(
  '    description:\n      "Plan your trips around China\'s top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",',
  '    description:\n      "Plan your trips around China\'s top trade shows and industry events. Canton Fair, CIIE, design weeks, and hundreds of regional expos with dates and venues.",\n    descriptionJa:\n      "中国の主要な見本市や業界イベントに合わせて旅程を計画。広州交易会、CIIE、デザインウィーク、各地の展示会の日程と会場を掲載。",'
);
s = s.replace(
  '    title: "Company Registration Guide",\n    titleCn: "工商注册指南",',
  '    title: "Company Registration Guide",\n    titleJa: "会社設立ガイド",\n    titleCn: "工商注册指南",'
);
s = s.replace(
  '    description:\n      "Step-by-step guide to setting up a WFOE, JV, or representative office in China. Documents, timelines, costs, and the latest 2026 regulatory updates.",',
  '    description:\n      "Step-by-step guide to setting up a WFOE, JV, or representative office in China. Documents, timelines, costs, and the latest 2026 regulatory updates.",\n    descriptionJa:\n      "中国でのWFOE、JV、駐在員事務所設立のステップバイステップガイド。書類、スケジュール、費用、2026年最新の規制情報。",'
);
s = s.replace(
  '    title: "Business Etiquette Essentials",\n    titleCn: "商务礼仪要点",',
  '    title: "Business Etiquette Essentials",\n    titleJa: "ビジネスマナー要点",\n    titleCn: "商务礼仪要点",'
);
s = s.replace(
  '    description:\n      "Master Chinese business culture, dining etiquette, gift-giving customs, and meeting protocols. Avoid common mistakes and build lasting guanxi.",',
  '    description:\n      "Master Chinese business culture, dining etiquette, gift-giving customs, and meeting protocols. Avoid common mistakes and build lasting guanxi.",\n    descriptionJa:\n      "中国のビジネス文化、食事マナー、贈答の習慣、会議のプロトコルを習得。よくある失敗を避け、良好な関係を築く。",'
);
s = s.replace(
  '    title: "Translation & Interpreting",\n    titleCn: "翻译服务预约",',
  '    title: "Translation & Interpreting",\n    titleJa: "翻訳・通訳サービス",\n    titleCn: "翻译服务预约",'
);
s = s.replace(
  '    description:\n      "Book professional interpreters and translators for your business visits in China. Consecutive and simultaneous interpreting, certified document translation.",',
  '    description:\n      "Book professional interpreters and translators for your business visits in China. Consecutive and simultaneous interpreting, certified document translation.",\n    descriptionJa:\n      "中国出張向けのプロ通訳・翻訳者を予約。逐次通訳、同時通訳、公認文書翻訳に対応。",'
);
s = s.split('href: "/guide/business/').join('href: `/${lang}/guide/business/');
s = s.split('href="/guide"').join('href={`/${lang}/guide`}');
s = s.split('href="/guide#business-tools"').join('href={`/${lang}/guide#business-tools`}');
// render ja title/description
s = s.replace('{t.title}', '{lang === "ja" ? (t.titleJa || t.title) : t.title}');
s = s.replace('{t.description}', '{lang === "ja" ? (t.descriptionJa || t.description) : t.description}');
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
