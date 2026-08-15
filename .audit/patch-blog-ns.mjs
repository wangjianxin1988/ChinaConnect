import fs from "node:fs";
const path = "src/i18n/translations.ts";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const blocks = {
  en: '    blog: {\n      title: "Travel Blog",\n      subtitle: "Stories, tips, and guides from across China",\n      featuredPosts: "Featured Posts",\n      readingTime: "{n} min read",\n      allPosts: "All Posts",\n      noPosts: "No posts yet"\n    },\n',
  ja: '    blog: {\n      title: "中国旅行ブログ",\n      subtitle: "中国各地のストーリー、ヒント、ガイド",\n      featuredPosts: "注目の記事",\n      readingTime: "読了 {n} 分",\n      allPosts: "すべての記事",\n      noPosts: "まだ記事がありません"\n    },\n',
  ko: '    blog: {\n      title: "여행 블로그",\n      subtitle: "중국 전역의 이야기, 팁, 가이드",\n      featuredPosts: "추천 게시물",\n      readingTime: "{n}분 소요",\n      allPosts: "전체 게시물",\n      noPosts: "아직 게시물이 없습니다"\n    },\n',
  "zh-CN": '    blog: {\n      title: "旅行博客",\n      subtitle: "来自中国各地的故事、贴士和指南",\n      featuredPosts: "精选文章",\n      readingTime: "阅读 {n} 分钟",\n      allPosts: "全部文章",\n      noPosts: "暂无文章"\n    },\n',
  "zh-TW": '    blog: {\n      title: "旅行部落格",\n      subtitle: "來自中國各地的故事、貼士和指南",\n      featuredPosts: "精選文章",\n      readingTime: "閱讀 {n} 分鐘",\n      allPosts: "全部文章",\n      noPosts: "暫無文章"\n    },\n',
  th: '    blog: {\n      title: "บล็อกท่องเที่ยว",\n      subtitle: "เรื่องราว เคล็ดลับ และคำแนะนำจากทั่วจีน",\n      featuredPosts: "บทความแนะนำ",\n      readingTime: "อ่าน {n} นาที",\n      allPosts: "บทความทั้งหมด",\n      noPosts: "ยังไม่มีบทความ"\n    },\n',
  vi: '    blog: {\n      title: "Blog du lịch",\n      subtitle: "Câu chuyện, mẹo và hướng dẫn từ khắp Trung Quốc",\n      featuredPosts: "Bài viết nổi bật",\n      readingTime: "Đọc {n} phút",\n      allPosts: "Tất cả bài viết",\n      noPosts: "Chưa có bài viết"\n    },\n',
  ru: '    blog: {\n      title: "Блог о путешествиях",\n      subtitle: "Истории, советы и гиды по всему Китаю",\n      featuredPosts: "Рекомендуемые статьи",\n      readingTime: "Чтение {n} мин",\n      allPosts: "Все статьи",\n      noPosts: "Пока нет статей"\n    },\n',
  fr: '    blog: {\n      title: "Blog de voyage",\n      subtitle: "Histoires, conseils et guides à travers la Chine",\n      featuredPosts: "Articles à la une",\n      readingTime: "Lecture de {n} min",\n      allPosts: "Tous les articles",\n      noPosts: "Aucun article pour le moment"\n    },\n',
  de: '    blog: {\n      title: "Reiseblog",\n      subtitle: "Geschichten, Tipps und Ratgeber aus ganz China",\n      featuredPosts: "Empfohlene Beiträge",\n      readingTime: "{n} Min. Lesedauer",\n      allPosts: "Alle Beiträge",\n      noPosts: "Noch keine Beiträge"\n    },\n',
  ar: '    blog: {\n      title: "مدونة السفر",\n      subtitle: "قصص ونصائح وأدلة من جميع أنحاء الصين",\n      featuredPosts: "مقالات مميزة",\n      readingTime: "قراءة {n} دقائق",\n      allPosts: "جميع المقالات",\n      noPosts: "لا توجد مقالات بعد"\n    },\n',
  fa: '    blog: {\n      title: "وبلاگ سفر",\n      subtitle: "داستان‌ها، نکته‌ها و راهنماهای سراسر چین",\n      featuredPosts: "مقالات منتخب",\n      readingTime: "مطالعه {n} دقیقه",\n      allPosts: "همه مقالات",\n      noPosts: "هنوز مقاله‌ای نیست"\n    },\n',
};
let count = 0;
for (const [lang, block] of Object.entries(blocks)) {
  const key = /^[A-Za-z-]+$/.test(lang) && !lang.includes("-") ? lang : JSON.stringify(lang);
  const anchor = "\n  " + key + ": {";
  const bIdx = s.indexOf(anchor);
  if (bIdx < 0) { console.error("lang block not found:", lang); process.exit(1); }
  const bp = s.indexOf("    businessGuidePage: {", bIdx);
  if (bp < 0) { console.error("businessGuidePage not found after", lang); process.exit(1); }
  if (s.slice(bIdx, bp).includes("blog: {")) { console.log("already has blog:", lang); continue; }
  s = s.slice(0, bp) + block + s.slice(bp);
  count++;
}
console.log("inserted blog blocks:", count);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
