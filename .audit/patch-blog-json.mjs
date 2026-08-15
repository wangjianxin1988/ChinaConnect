import fs from "node:fs";
const LANG_FILES = {
  en: "en-translations.json", ja: "ja-translations.json", ko: "ko-translations.json",
  th: "th-translations.json", vi: "vi-translations.json", ru: "ru-translations.json",
  fr: "fr-translations.json", de: "de-translations.json", ar: "ar-translations.json",
  fa: "fa-translations.json", "zh-CN": "zh-CN-translations.json", "zh-TW": "zh-TW-translations.json",
};
const BLOG = {
  en: ["Travel Blog", "Stories, tips, and guides from across China", "Featured Posts", "{n} min read", "All Posts", "No posts yet", "Back to Blog", "By {name}"],
  ja: ["中国旅行ブログ", "中国各地のストーリー、ヒント、ガイド", "注目の記事", "読了 {n} 分", "すべての記事", "まだ記事がありません", "ブログに戻る", "著者：{name}"],
  ko: ["여행 블로그", "중국 전역의 이야기, 팁, 가이드", "추천 게시물", "{n}분 소요", "전체 게시물", "아직 게시물이 없습니다", "블로그로 돌아가기", "작성자: {name}"],
  "zh-CN": ["旅行博客", "来自中国各地的故事、贴士和指南", "精选文章", "阅读 {n} 分钟", "全部文章", "暂无文章", "返回博客", "作者：{name}"],
  "zh-TW": ["旅行部落格", "來自中國各地的故事、貼士和指南", "精選文章", "閱讀 {n} 分鐘", "全部文章", "暫無文章", "返回部落格", "作者：{name}"],
  th: ["บล็อกท่องเที่ยว", "เรื่องราว เคล็ดลับ และคำแนะนำจากทั่วจีน", "บทความแนะนำ", "อ่าน {n} นาที", "บทความทั้งหมด", "ยังไม่มีบทความ", "กลับไปที่บล็อก", "โดย {name}"],
  vi: ["Blog du lịch", "Câu chuyện, mẹo và hướng dẫn từ khắp Trung Quốc", "Bài viết nổi bật", "Đọc {n} phút", "Tất cả bài viết", "Chưa có bài viết", "Quay lại Blog", "Tác giả: {name}"],
  ru: ["Блог о путешествиях", "Истории, советы и гиды по всему Китаю", "Рекомендуемые статьи", "Чтение {n} мин", "Все статьи", "Пока нет статей", "Назад к блогу", "Автор: {name}"],
  fr: ["Blog de voyage", "Histoires, conseils et guides à travers la Chine", "Articles à la une", "Lecture de {n} min", "Tous les articles", "Aucun article pour le moment", "Retour au blog", "Par {name}"],
  de: ["Reiseblog", "Geschichten, Tipps und Ratgeber aus ganz China", "Empfohlene Beiträge", "{n} Min. Lesedauer", "Alle Beiträge", "Noch keine Beiträge", "Zurück zum Blog", "Von {name}"],
  ar: ["مدونة السفر", "قصص ونصائح وأدلة من جميع أنحاء الصين", "مقالات مميزة", "قراءة {n} دقائق", "جميع المقالات", "لا توجد مقالات بعد", "العودة إلى المدونة", "بقلم {name}"],
  fa: ["وبلاگ سفر", "داستان‌ها، نکته‌ها و راهنماهای سراسر چین", "مقالات منتخب", "مطالعه {n} دقیقه", "همه مقالات", "هنوز مقاله‌ای نیست", "بازگشت به وبلاگ", "نویسنده: {name}"],
};
const BLOG_KEYS = ["title", "subtitle", "featuredPosts", "readingTime", "allPosts", "noPosts", "backToList", "author"];

for (const [lang, file] of Object.entries(LANG_FILES)) {
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  BLOG_KEYS.forEach((k, i) => { j["blog." + k] = BLOG[lang][i]; });
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log("updated", file);
}
