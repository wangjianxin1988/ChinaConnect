// Site announcements shown in the entry popup (homepage).
//
// 工作流：每次网站更新新内容（新功能、新文章、新城市等）时，
// 在此数组最前面新增一条公告，id 用 YYYY-MM-DD-<slug> 格式（必须唯一）。
// 前端会按 id 记住用户已读列表，新公告会自动在下一次进站时弹出，
// 并在 12 种语言（en/ja/ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa）下各自显示。
export interface Announcement {
  id: string;
  date: string; // YYYY-MM-DD
  title: Record<string, string>;
  body: Record<string, string>;
  link?: string;
}

function L(
  en: string, ja: string, ko: string, zhCN: string, zhTW: string,
  th: string, vi: string, ru: string, fr: string, de: string, ar: string, fa: string,
): Record<string, string> {
  return { en, ja, ko, "zh-CN": zhCN, "zh-TW": zhTW, th, vi, ru, fr, de, ar, fa };
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "2026-08-17-i18n-ai-blog",
    date: "2026-08-17",
    title: L(
      "Major update: 12 languages, new AI page & blog images",
      "大型アップデート：12言語対応、AIページ新設、ブログ画像追加",
      "대규모 업데이트: 12개 언어 지원, 새 AI 페이지, 블로그 이미지 추가",
      "重大更新：12 种语言、全新 AI 页面、博客配图",
      "重大更新：12 種語言、全新 AI 頁面、部落格配圖",
      "อัปเดตครั้งใหญ่: 12 ภาษา, หน้า AI ใหม่ และรูปภาพบล็อก",
      "Cập nhật lớn: 12 ngôn ngữ, trang AI mới và ảnh blog",
      "Большое обновление: 12 языков, новая страница ИИ и изображения для блога",
      "Grande mise à jour : 12 langues, nouvelle page IA et images de blog",
      "Großes Update: 12 Sprachen, neue KI-Seite und Blog-Bilder",
      "تحديث كبير: 12 لغة، صفحة ذكاء اصطناعي جديدة وصور للمدونة",
      "بهروزرسانی بزرگ: ۱۲ زبان، صفحه هوش مصنوعی جدید و تصاویر وبلاگ"
    ),
    body: L(
      "All 12 language versions are now fully localized — city guides, restaurants, attractions, hotels, emergency info and blog articles display in your language. The AI page is now browsable without an account (sign in only when you want to chat), and all blog articles have topic-matched cover images.",
      "12言語すべてのバージョンが完全にローカライズされました。都市ガイド、レストラン、観光スポット、ホテル、緊急連絡先、ブログ記事がすべてあなたの言語で表示されます。AIページはアカウントなしで閲覧できるようになりました（チャットを始めるときだけログインが必要です）。また、すべてのブログ記事にテーマに合ったカバー画像が追加されています。",
      "12개 언어 버전이 모두 완전히 로컬라이즈되었습니다. 도시 가이드, 레스토랑, 관광 명소, 호텔, 긴급 연락처, 블로그 글이 모두 여러분의 언어로 표시됩니다. AI 페이지는 이제 계정 없이도 둘러볼 수 있습니다(채팅을 시작할 때만 로그인 필요). 또한 모든 블로그 글에 주제에 맞는 커버 이미지가 추가되었습니다.",
      "全部 12 种语言版本现已完全本地化——城市指南、餐厅、景点、酒店、紧急联系方式和博客文章都以你的语言显示。AI 页面现在无需登录即可浏览（仅在你想聊天时才需要登录），并且所有博客文章都配有与主题匹配的封面图片。",
      "全部 12 種語言版本現已完全在地化——城市指南、餐廳、景點、飯店、緊急聯絡方式和部落格文章都以你的語言顯示。AI 頁面現在無需登入即可瀏覽（僅在你想聊天時才需要登入），而且所有部落格文章都配有與主題相符的封面圖片。",
      "เนื้อหาทั้ง 12 ภาษาได้รับการแปลอย่างสมบูรณ์แล้ว ไม่ว่าจะเป็นคู่มือเมือง ร้านอาหาร สถานที่ท่องเที่ยว โรงแรม ข้อมูลฉุกเฉิน และบทความบล็อก ทั้งหมดแสดงเป็นภาษาของคุณ หน้า AI ตอนนี้สามารถเข้าชมได้โดยไม่ต้องมีบัญชี (เข้าสู่ระบบเฉพาะเมื่อต้องการแชท) และบทความบล็อกทุกบทความมีภาพปกที่ตรงกับหัวข้อ",
      "Toàn bộ 12 phiên bản ngôn ngữ đã được bản địa hóa hoàn toàn — hướng dẫn thành phố, nhà hàng, điểm tham quan, khách sạn, thông tin khẩn cấp và bài viết blog đều hiển thị bằng ngôn ngữ của bạn. Trang AI giờ có thể xem mà không cần tài khoản (chỉ cần đăng nhập khi bạn muốn trò chuyện), và mọi bài viết blog đều có ảnh bìa phù hợp với chủ đề.",
      "Все 12 языковых версий теперь полностью локализованы — путеводители по городам, рестораны, достопримечательности, отели, экстренная информация и статьи блога отображаются на вашем языке. Страницу ИИ теперь можно просматривать без аккаунта (вход нужен только для чата), а все статьи блога получили тематические обложки.",
      "Les 12 versions linguistiques sont entièrement localisées — guides de villes, restaurants, attractions, hôtels, informations d'urgence et articles de blog s'affichent dans votre langue. La page IA est désormais consultable sans compte (connexion requise uniquement pour discuter), et tous les articles de blog ont des images adaptées à leur thème.",
      "Alle 12 Sprachversionen sind vollständig lokalisiert — Stadtführer, Restaurants, Sehenswürdigkeiten, Hotels, Notfallinformationen und Blogartikel werden in Ihrer Sprache angezeigt. Die KI-Seite ist jetzt ohne Konto durchstöberbar (Anmeldung nur zum Chatten), und alle Blogartikel haben passende Titelbilder.",
      "جميع النسخ اللغوية الـ 12 أصبحت مترجمة بالكامل — أدلة المدن والمطاعم والمعالم والفنادق ومعلومات الطوارئ ومقالات المدونة تعرض الآن بلغتك. يمكنك الآن تصفح صفحة الذكاء الاصطناعي دون حساب (تحتاج فقط إلى تسجيل الدخول عند الرغبة في الدردشة)، وجميع مقالات المدونة تحتوي على صور غلاف مناسبة لموضوعها.",
      "هر ۱۲ نسخه زبانی بهطور کامل بومیسازی شدهاند — راهنمای شهرها، رستورانها، جاذبهها، هتلها، اطلاعات اضطراری و مقالات وبلاگ به زبان شما نمایش داده میشوند. صفحه هوش مصنوعی اکنون بدون حساب کاربری قابل مشاهده است (فقط هنگام گفتگو نیاز به ورود دارید) و همه مقالات وبلاگ تصویر جلد متناسب با موضوع دارند."
    )
  }
];