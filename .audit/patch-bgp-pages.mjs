import fs from "node:fs";

function patch(file, key, enTitle, enDesc, titleFallback, descFallback, introHtml) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  // add translations import if missing
  if (!s.includes('from "@/i18n/translations"')) {
    s = s.replace('import { getLangFromUrl }', 'import { translations } from "@/i18n/translations";\nimport { getLangFromUrl }');
  }
  // title
  const titleRe = new RegExp("title=\"" + enTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\"");
  if (!titleRe.test(s)) { console.log(file, "TITLE PATTERN NOT FOUND:", enTitle); }
  s = s.replace(titleRe, `title={(translations[lang] || translations.en).businessGuidePage?.${key}Title || ${JSON.stringify(titleFallback)}}`);
  // description
  const descRe = new RegExp("description=\"" + enDesc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\"");
  if (!descRe.test(s)) { console.log(file, "DESC PATTERN NOT FOUND:", enDesc.slice(0, 50)); }
  s = s.replace(descRe, `description={(translations[lang] || translations.en).businessGuidePage?.${key}Description || ${JSON.stringify(descFallback)}}`);
  // intro paragraph: find the <p class="text-muted-foreground max-w-2xl"> block and attach data-i18n
  const introRe = /<p class="text-muted-foreground max-w-2xl">([\s\S]*?)<\/p>/;
  if (!introRe.test(s)) { console.log(file, "INTRO P NOT FOUND"); }
  s = s.replace(introRe, (m, inner) => {
    if (inner.includes(introHtml)) {
      return `<p class="text-muted-foreground max-w-2xl" data-i18n="businessGuidePage.${key}Description">${introHtml}</p>`;
    }
    return m;
  });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, s);
  fs.renameSync(tmp, file);
  console.log("patched", file);
}

const regIntro = "Comprehensive guide to registering a business entity in China as a foreign investor.\n        Choose between WFOE, Representative Office, and other structures.";
patch("src/pages/[lang]/guide/business/company-registration.astro", "registration",
  "China Company Registration Guide - ChinaConnect",
  "Step-by-step guide to registering a WFOE, Representative Office, or other entity in China as a foreign investor. Complete timeline and document checklist.",
  "China Company Registration Guide - ChinaConnect",
  "Step-by-step guide to registering a WFOE, Representative Office, or other entity in China as a foreign investor. Complete timeline and document checklist.",
  regIntro);

const etiIntro = "Master the unwritten rules of Chinese business culture. From business card exchange to dining etiquette —\n        practical guidance to help you earn respect and build lasting relationships.";
patch("src/pages/[lang]/guide/business/etiquette.astro", "etiquette",
  "Chinese Business Etiquette Guide - ChinaConnect",
  "Master Chinese business etiquette including business card exchange, dining, meetings, and gift giving. Practical do's and don'ts for foreign business professionals.",
  "Chinese Business Etiquette Guide - ChinaConnect",
  "Master Chinese business etiquette including business card exchange, dining, meetings, and gift giving. Practical do's and don'ts for foreign business professionals.",
  etiIntro);

const expoIntro = "Plan your business visits around China&apos;s most important trade shows.\n        From the Canton Fair to industry-specific exhibitions across major cities.";
patch("src/pages/[lang]/guide/business/expo-calendar.astro", "expo",
  "China Expo Calendar - ChinaConnect",
  "Complete calendar of major trade fairs and exhibitions in China including Canton Fair, auto shows, and industry events. Plan your business trip around key events.",
  "China Expo Calendar - ChinaConnect",
  "Complete calendar of major trade fairs and exhibitions in China including Canton Fair, auto shows, and industry events. Plan your business trip around key events.",
  expoIntro);

const invIntro = "Ready-to-use invitation letter templates for visa applications, trade visits, and business meetings.\n        Available in bilingual, English-only, and simplified formats.";
patch("src/pages/[lang]/guide/business/invitation-letter.astro", "invitation",
  "Business Invitation Letter Templates - ChinaConnect",
  "Download ready-to-use bilingual invitation letter templates for China visa applications and business visits. Fill in the fields and download instantly.",
  "Business Invitation Letter Templates - ChinaConnect",
  "Download ready-to-use bilingual invitation letter templates for China visa applications and business visits. Fill in the fields and download instantly.",
  invIntro);

const transIntro = "Book professional interpreters and translators for your business visits in China.\n        From consecutive interpreting at meetings to certified document translation for visa applications.";
patch("src/pages/[lang]/guide/business/translation.astro", "translation",
  "Translation & Interpreting Services - ChinaConnect",
  "Book vetted interpreters and translators for meetings, conferences, and negotiations in China.",
  "Translation & Interpreting Services - ChinaConnect",
  "Book vetted interpreters and translators for meetings, conferences, and negotiations in China.",
  transIntro);
