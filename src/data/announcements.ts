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
    id: "2026-10-18-visa-free-transit",
    date: "2026-10-18",
    title: L(
      "New guide: China's 240-hour visa-free transit in 2026",
      "新ガイド：2026年中国の240時間ビザ免除トランジット",
      "새 가이드: 2026년 중국 240시간 무비자 환승",
      "新指南：2026 年中国 240 小时过境免签",
      "新指南：2026 年中國 240 小時過境免簽",
      "คู่มือใหม่: การเปลี่ยนเครื่องฟรีวีซ่า 240 ชั่วโมงของจีน ปี 2026",
      "Hướng dẫn mới: Quá cảnh miễn thị thực 240 giờ tại Trung Quốc 2026",
      "Новый гид: 240-часовой безвизовый транзит в Китае в 2026 году",
      "Nouveau guide : le transit sans visa de 240 heures en Chine en 2026",
      "Neuer Ratgeber: 240 Stunden visumfreier Transit in China 2026",
      "دليل جديد: العبور بدون تأشيرة لمدة 240 ساعة في الصين 2026",
      "راهنمای جدید: ترانزیت بدون ویزای ۲۴۰ ساعته چین در سال ۲۰۲۶"
    ),
    body: L(
      "Kyrgyzstan and Vietnam joined on 20 August 2026, bringing the list to 57 countries and 65 ports. The guide covers the four mistakes that get travellers turned around at the border, plus how the 10-day transit differs from the 30-day visa-free entry most people should use instead.",
      "2026年8月20日にキルギスとベトナムが加わり、対象は57か国・65港に拡大しました。国境で足止めされる4つの典型的なミスと、10日間のトランジットと多くの人が使うべき30日間ビザ免除の違いを解説します。",
      "2026년 8월 20일 키르기스스탄과 베트남이 추가되어 57개국, 65개 항구로 확대되었습니다. 국경에서 발이 묶이는 4가지 실수와 10일 환승과 대부분이 이용해야 할 30일 무비자 입국의 차이를 정리했습니다.",
      "2026 年 8 月 20 日吉尔吉斯斯坦和越南加入，名单扩至 57 国、65 个口岸。指南讲清在边境被拦下的 4 个典型错误，以及 10 天过境免签和大多数人更该用的 30 天免签的区别。",
      "2026 年 8 月 20 日吉爾吉斯斯坦和越南加入，名單擴至 57 國、65 個口岸。指南講清在邊境被攔下的 4 個典型錯誤，以及 10 天過境免簽和大多數人更該用的 30 天免簽的區別。",
      "คีร์กีซสถานและเวียดนามเข้าร่วมเมื่อ 20 สิงหาคม 2026 ทำให้รายชื่อเพิ่มเป็น 57 ประเทศ และ 65 ด่าน คู่มือนี้อธิบายข้อผิดพลาด 4 ข้อที่ทำให้ถูกกันที่ชายแดน และความแตกต่างระหว่างการเปลี่ยนเครื่อง 10 วันกับการเข้าฟรีวีซ่า 30 วันที่คนส่วนใหญ่ควรใช้",
      "Kyrgyzstan và Việt Nam gia nhập ngày 20/8/2026, nâng danh sách lên 57 quốc gia và 65 cửa khẩu. Hướng dẫn nêu 4 sai lầm khiến du khách bị chặn ở cửa khẩu, và khác biệt giữa quá cảnh 10 ngày và miễn thị thực 30 ngày mà đa số nên dùng.",
      "Киргизия и Вьетнам присоединились 20 августа 2026 года — теперь 57 стран и 65 портов. В гиде разобраны четыре ошибки, из-за которых путешественников разворачивают на границе, и разница между 10-дневным транзитом и 30-дневным безвизовым въездом.",
      "Le Kirghizistan et le Vietnam ont rejoint la liste le 20 août 2026, portant le total à 57 pays et 65 ports. Le guide détaille les quatre erreurs qui font refuser les voyageurs à la frontière, et la différence entre le transit de 10 jours et l'entrée sans visa de 30 jours.",
      "Kirgisistan und Vietnam sind am 20. August 2026 beigetreten — jetzt 57 Länder und 65 Häfen. Der Ratgeber nennt die vier Fehler, wegen derer Reisende an der Grenze abgewiesen werden, und den Unterschied zwischen 10-Tage-Transit und 30-Tage-visumfreier Einreise.",
      "انضمت قيرغيزستان وفيتنام في 20 أغسطس 2026، ليصبح العدد 57 دولة و65 منفذًا. يشرح الدليل الأخطاء الأربعة التي تؤدي إلى إيقاف المسافرين عند الحدود، والفرق بين عبور 10 أيام والدخول بدون تأشيرة لمدة 30 يومًا.",
      "قرقیزستان و ویتنام در ۲۰ اوت ۲۰۲۶ اضافه شدند و فهرست به ۵۷ کشور و ۶۵ بندر رسید. راهنما چهار اشتباهی را توضیح می‌دهد که باعث توقف مسافران در مرز می‌شود، و تفاوت ترانزیت ۱۰ روزه با ورود بدون ویزای ۳۰ روزه."
    ),
    link: "/blog/china-240-hour-visa-free-transit-2026"
  },
  {
    id: "2026-10-18-shangri-la",
    date: "2026-10-18",
    title: L(
      "New city guide: Shangri-La, Yunnan",
      "新しい都市ガイド：雲南省シャングリラ",
      "새 도시 가이드: 윈난성 샹그릴라",
      "新增城市指南：云南香格里拉",
      "新增城市指南：雲南香格里拉",
      "คู่มือเมืองใหม่: ซางกรีลา มณฑลยูนนาน",
      "Hướng dẫn thành phố mới: Shangri-La, Vân Nam",
      "Новый путеводитель: Шангри-Ла, провинция Юньнань",
      "Nouveau guide de ville : Shangri-La, Yunnan",
      "Neuer Stadtführer: Shangri-La, Yunnan",
      "دليل مدينة جديد: شانغريلا، يونان",
      "راهنمای شهر جدید: شانگریلا، یوننان"
    ),
    body: L(
      "Shangri-La is live in 12 languages. Sitting at 3,280 m on the edge of the Tibetan Plateau, it is the only prefecture in China officially renamed after a fictional place. Includes Songzanlin Monastery, Pudacuo National Park, Dukezong old town, real ticket prices and altitude advice.",
      "シャングリラが12言語で公開されました。チベット高原の標高3,280mに位置し、架空の地名から正式に改名された中国唯一の自治州です。松賛林寺、普達措国立公園、独克宗古城、実際の入場料、高山病対策を収録。",
      "샹그릴라가 12개 언어로 공개되었습니다. 티베트 고원 끝 해발 3,280m에 있으며, 가상의 지명으로 공식 개명된 중국 유일의 자치주입니다. 송찬린 사원, 푸다추오 국립공원, 두커쭝 옛거리, 실제 입장료와 고산병 조언을 담았습니다.",
      "香格里拉 12 语言版本上线。海拔 3280 米，位于青藏高原边缘，是中国唯一以虚构地名正式更名的自治州。含松赞林寺、普达措国家公园、独克宗古城、真实门票价格和高反建议。",
      "香格里拉 12 語言版本上線。海拔 3280 公尺，位於青藏高原邊緣，是中國唯一以虛構地名正式更名的自治州。含松贊林寺、普達措國家公園、獨克宗古城、真實票價和高山症建議。",
      "ซางกรีลาเปิดให้บริการใน 12 ภาษา ตั้งอยู่ที่ระดับความสูง 3,280 เมตร ริมขอบที่ราบสูงทิเบต เป็นจังหวัดเดียวในจีนที่เปลี่ยนชื่ออย่างเป็นทางการตามสถานที่สมมติ รวมวัดซงจ้านหลิน อุทยานแห่งชาติผู่ต้าชั่ว เมืองเก่าตูเค่อจง ราคาตั๋วจริง และคำแนะนำเรื่องอาการแพ้ที่สูง",
      "Shangri-La đã có mặt bằng 12 ngôn ngữ. Nằm ở độ cao 3.280 m bên rìa cao nguyên Tây Tạng, đây là châu tự trị duy nhất của Trung Quốc được đổi tên chính thức theo một địa danh hư cấu. Bao gồm tu viện Songzanlin, vườn quốc gia Pudacuo, phố cổ Dukezong, giá vé thật và lời khuyên về say độ cao.",
      "Шангри-Ла доступен на 12 языках. Расположен на высоте 3280 м на краю Тибетского плато — единственный автономный округ Китая, официально переименованный в честь вымышленного места. Внутри: монастырь Сунцзаньлинь, нацпарк Пудацо, старый город Дукэцзун, реальные цены билетов и советы по высотной болезни.",
      "Shangri-La est disponible en 12 langues. À 3 280 m d'altitude en bordure du plateau tibétain, c'est la seule préfecture de Chine officiellement renommée d'après un lieu fictif. Comprend le monastère de Songzanlin, le parc national de Pudacuo, la vieille ville de Dukezong, les vrais prix des billets et des conseils sur le mal d'altitude.",
      "Shangri-La ist in 12 Sprachen verfügbar. Auf 3.280 m am Rand des tibetischen Plateaus gelegen, ist es die einzige Präfektur Chinas, die offiziell nach einem fiktiven Ort umbenannt wurde. Mit Songzanlin-Kloster, Pudacuo-Nationalpark, Altstadt Dukezong, echten Ticketpreisen und Höhenkrankheits-Tipps.",
      "شانغريلا متاحة بـ 12 لغة. تقع على ارتفاع 3,280 مترًا على حافة هضبة التبت، وهي المحافظة الوحيدة في الصين التي أُعيدت تسميتها رسميًا باسم مكان خيالي. تشمل دير سونغزانلين، ومنتزه بوداتسو الوطني، وبلدة دوكيزونغ القديمة، وأسعار التذاكر الحقيقية ونصائح داء المرتفعات.",
      "شانگریلا به ۱۲ زبان در دسترس است. در ارتفاع ۳۲۸۰ متری لبه فلات تبت قرار دارد و تنها ولایت چین است که رسماً به نام مکانی خیالی نام‌گذاری شده. شامل صومعه سونگزانلین، پارک ملی پوداتسو، شهر قدیمی دوکه‌زونگ، قیمت واقعی بلیت و توصیه‌های ارتفاع‌زدگی."
    ),
    link: "/city/shangri-la"
  },
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