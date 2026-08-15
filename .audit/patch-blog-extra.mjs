import fs from "node:fs";
const path = "src/i18n/translations.ts";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const extras = {
  en: ['      backToList: "Back to Blog",\n', '      author: "By {name}",\n'],
  ja: ['      backToList: "ブログに戻る",\n', '      author: "著者：{name}",\n'],
  ko: ['      backToList: "블로그로 돌아가기",\n', '      author: "작성자: {name}",\n'],
  "zh-CN": ['      backToList: "返回博客",\n', '      author: "作者：{name}",\n'],
  "zh-TW": ['      backToList: "返回部落格",\n', '      author: "作者：{name}",\n'],
  th: ['      backToList: "กลับไปที่บล็อก",\n', '      author: "โดย {name}",\n'],
  vi: ['      backToList: "Quay lại Blog",\n', '      author: "Tác giả: {name}",\n'],
  ru: ['      backToList: "Назад к блогу",\n', '      author: "Автор: {name}",\n'],
  fr: ['      backToList: "Retour au blog",\n', '      author: "Par {name}",\n'],
  de: ['      backToList: "Zurück zum Blog",\n', '      author: "Von {name}",\n'],
  ar: ['      backToList: "العودة إلى المدونة",\n', '      author: "بقلم {name}",\n'],
  fa: ['      backToList: "بازگشت به وبلاگ",\n', '      author: "نویسنده: {name}",\n'],
};
let count = 0;
for (const [lang, lines] of Object.entries(extras)) {
  const key = lang.includes("-") ? JSON.stringify(lang) : lang;
  const anchor = "\n  " + key + ": {";
  const bIdx = s.indexOf(anchor);
  if (bIdx < 0) { console.error("lang block not found:", lang); process.exit(1); }
  const blogStart = s.indexOf("    blog: {", bIdx);
  if (blogStart < 0) { console.error("blog ns not found:", lang); process.exit(1); }
  const blogEnd = s.indexOf("\n    },", blogStart) + 7;
  const block = s.slice(blogStart, blogEnd);
  let nb = block;
  for (const ln of lines) {
    const name = ln.trim().split(":")[0];
    if (nb.includes("      " + name + ":")) continue;
    nb = nb.replace(/\n    },$/, "\n" + ln + "    },");
  }
  if (nb !== block) { s = s.slice(0, blogStart) + nb + s.slice(blogEnd); count++; }
}
console.log("updated blog blocks:", count);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
