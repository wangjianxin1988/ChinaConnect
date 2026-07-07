const fs = require('fs');
const text = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const NL = '\r\n';

// 12 个 features 块（顺序: en/ja/ko/zh-CN/zh-TW/th/vi/ru/fr/de/ar/fa）
// keys: restaurantGuide, restaurantGuideDesc, attractions, attractionsDesc, transport, transportDesc,
//       emergency, emergencyDesc, payment, paymentDesc, accommodation, accommodationDesc,
//       culturalTips, culturalTipsDesc, aiAssistant, aiAssistantDesc
const data = {
  en: ['Restaurant Guide','Michelin stars, Black Pearl rankings, and local favorites with detailed reviews',
       'Attractions','Top-rated attractions with opening hours, tickets, and local tips',
       'Transport','How to get there and around - flights, trains, metro, and local tips',
       'Emergency','Hospital, police, embassy contacts and important phone numbers',
       'Payment Guide','Alipay, WeChat Pay, cash tips, and card acceptance info',
       'Accommodation','Hotel recommendations for every budget from luxury to budget',
       'Cultural Tips','Local customs, etiquette, and cultural insights for each city',
       'AI Assistant','Ask questions in English, get instant answers about China travel'],
  ja: ['レストランガイド','ミシュラン星、黒真珠ランキング、地元のお気に入りを詳細レビュー付きで紹介',
       '観光名所','営業時間、チケット、現地 tips を含むトップ評価の観光名所',
       '交通','行き方と移動手段 - 飛行機、電車、地下鉄、現地 tips',
       '緊急時','病院、警察、大使館の連絡先と重要な電話番号',
       '支払いガイド','Alipay、WeChat Pay、現金 tips、カード利用情報',
       '宿泊','高級から予算まで、あらゆる予算のホテル推奨',
       '文化 tips','現地の習慣、エチケット、各都市の文化的な洞察',
       'AI アシスタント','中国旅行について英語で質問し、すぐに回答を得る'],
  ko: ['레스토랑 가이드','미슐랭 스타, 블랙펄 랭킹, 그리고 상세한 리뷰와 함께하는 현지 인기 식당',
       '관광 명소','운영 시간, 티켓, 현지 팁이 포함된 최고 평점 관광 명소',
       '교통','가는 법과 이동 수단 - 항공편, 기차, 지하철, 현지 팁',
       '긴급 상황','병원, 경찰, 대사관 연락처 및 중요한 전화번호',
       '결제 가이드','Alipay, WeChat Pay, 현금 팁, 카드 사용 정보',
       '숙박','럭셔리부터 예산까지 모든 예산의 호텔 추천',
       '문화 팁','현지 관습, 에티켓, 각 도시의 문화 통찰',
       'AI 어시스턴트','중국 여행에 대한 질문을 영어로 하고 즉각적인 답변 받기'],
  'zh-CN': ['餐厅指南','米其林星级、黑珍珠排名和本地最爱，配有详细评价',
            '景点','顶级景点，附带开放时间、门票和本地贴士',
            '交通','如何到达和出行 - 航班、火车、地铁和本地贴士',
            '紧急联系','医院、警察、大使馆联系方式和重要电话号码',
            '支付指南','支付宝、微信支付、现金贴士和刷卡信息',
            '住宿','从豪华到经济型，各类预算的酒店推荐',
            '文化贴士','各地风俗、礼仪和每个城市的文化见解',
            'AI 助手','用中文提问，立刻获得中国旅行相关解答'],
  'zh-TW': ['餐廳指南','米其林星級、黑珍珠排名和本地最愛，附有詳細評論',
            '景點','頂級景點，附帶開放時間、門票和本地貼士',
            '交通','如何到達和出行 - 航班、火車、地鐵和本地貼士',
            '緊急聯絡','醫院、警察、大使館聯絡方式和重要電話號碼',
            '支付指南','支付寶、微信支付、現金貼士和刷卡資訊',
            '住宿','從豪華到經濟型，各類預算的飯店推薦',
            '文化貼士','各地風俗、禮儀和每個城市的文化見解',
            'AI 助理','用中文提問，立即獲得中國旅行相關解答'],
  th: ['คู่มือร้านอาหาร','ดาวมิชลิน, Black Pearl และร้านโปรดท้องถิ่น พร้อมรีวิวละเอียด',
       'สถานที่ท่องเที่ยว','สถานที่ท่องเที่ยวยอดนิยมพร้อมเวลาเปิด ตั๋ว และเคล็ดลับท้องถิ่น',
       'การเดินทาง','วิธีไปและท่องเที่ยว - เครื่องบิน รถไฟ รถไฟใต้ดิน และเคล็ดลับท้องถิ่น',
       'ฉุกเฉิน','โรงพยาบาล ตำรวจ สถานทูต และหมายเลขโทรศัพท์สำคัญ',
       'คู่มือการชำระเงิน','Alipay, WeChat Pay, เงินสด และข้อมูลการใช้บัตร',
       'ที่พัก','คำแนะนำโรงแรมสำหรับทุกงบประมาณ ตั้งแต่หรูหราจนถึงประหยัด',
       'เคล็ดลับวัฒนธรรม','ประเพณีท้องถิ่น มารยาท และข้อมูลเชิงลึกทางวัฒนธรรมของแต่ละเมือง',
       'ผู้ช่วย AI','ถามคำถามเกี่ยวกับการท่องเที่ยวจีน ได้รับคำตอบทันที'],
  vi: ['Hướng dẫn nhà hàng','Sao Michelin, xếp hạng Black Pearl và các món địa phương yêu thích kèm đánh giá chi tiết',
       'Điểm tham quan','Điểm tham quan hàng đầu với giờ mở cửa, vé và mẹo địa phương',
       'Phương tiện','Cách đi và di chuyển - máy bay, tàu hỏa, tàu điện ngầm và mẹo địa phương',
       'Khẩn cấp','Bệnh viện, cảnh sát, đại sứ quán và các số điện thoại quan trọng',
       'Hướng dẫn thanh toán','Alipay, WeChat Pay, mẹo tiền mặt và thông tin thẻ',
       'Chỗ ở','Đề xuất khách sạn cho mọi ngân sách từ sang trọng đến tiết kiệm',
       'Mẹo văn hóa','Phong tục địa phương, nghi thức và hiểu biết văn hóa cho mỗi thành phố',
       'Trợ lý AI','Đặt câu hỏi về du lịch Trung Quốc, nhận câu trả lời ngay'],
  ru: ['Гид по ресторанам','Звезды Мишлен, рейтинг Black Pearl и местные фавориты с подробными обзорами',
       'Достопримечательности','Лучшие достопримечательности с часами работы, билетами и местными советами',
       'Транспорт','Как добраться и передвигаться - рейсы, поезда, метро и местные советы',
       'Экстренные случаи','Больницы, полиция, посольства и важные телефонные номера',
       'Гид по оплате','Alipay, WeChat Pay, советы по наличным и информация о картах',
       'Проживание','Рекомендации отелей для любого бюджета - от роскошных до бюджетных',
       'Культурные советы','Местные обычаи, этикет и культурные особенности каждого города',
       'ИИ-ассистент','Задавайте вопросы о путешествиях по Китаю на английском, получайте мгновенные ответы'],
  fr: ['Guide des restaurants','Étoiles Michelin, classement Black Pearl et favoris locaux avec avis détaillés',
       'Attractions','Attractions les mieux notées avec horaires, billets et conseils locaux',
       'Transport','Comment s\u2019y rendre et se déplacer - vols, trains, métro et conseils locaux',
       'Urgence','Hôpitaux, police, contacts ambassade et numéros de téléphone importants',
       'Guide de paiement','Alipay, WeChat Pay, astuces espèces et informations sur les cartes',
       'Hébergement','Recommandations d\u2019hôtels pour tous les budgets, du luxe à l\u2019économique',
       'Conseils culturels','Coutumes locales, étiquette et perspectives culturelles pour chaque ville',
       'Assistant IA','Posez des questions en anglais sur les voyages en Chine, obtenez des réponses instantanées'],
  de: ['Restaurantführer','Michelin-Sterne, Black-Pearl-Bewertung und lokale Favoriten mit ausführlichen Bewertungen',
       'Sehenswürdigkeiten','Top-bewertete Attraktionen mit Öffnungszeiten, Tickets und lokalen Tipps',
       'Transport','Anreise und Fortbewegung - Flüge, Züge, U-Bahn und lokale Tipps',
       'Notfälle','Krankenhaus, Polizei, Botschaftskontakte und wichtige Telefonnummern',
       'Zahlungsführer','Alipay, WeChat Pay, Bargeldtipps und Karteninformationen',
       'Unterkunft','Hotelempfehlungen für jedes Budget, von luxuriös bis preiswert',
       'Kulturelle Tipps','Lokale Bräuche, Etikette und kulturelle Einblicke für jede Stadt',
       'KI-Assistent','Stellen Sie Fragen auf Englisch zu China-Reisen und erhalten Sie sofort Antworten'],
  ar: ['دليل المطاعم','نجوم ميشلان، ترتيب بلاك بيرل والمفضلات المحلية مع مراجعات مفصلة',
       'المعالم','أفضل المعالم مع ساعات العمل والتذاكر والنصائح المحلية',
       'النقل','كيفية الوصول والتنقل - الرحلات الجوية، القطارات، المترو والنصائح المحلية',
       'الطوارئ','المستشفى، الشرطة، جهات اتصال السفارة وأرقام الهواتف المهمة',
       'دليل الدفع','Alipay، WeChat Pay، نصائح نقدية ومعلومات البطاقات',
       'الإقامة','توصيات الفنادق لكل ميزانية من الفاخر إلى الاقتصادي',
       'نصائح ثقافية','العادات المحلية، آداب السلوك والرؤى الثقافية لكل مدينة',
       'مساعد الذكاء الاصطناعي','اطرح أسئلة حول السفر إلى الصين واحصل على إجابات فورية'],
  fa: ['راهنمای رستوران','ستارهای میشلن، رتبه‌بندی بلک پرل و موارد دلخواه محلی با نقد و بررسی دقیق',
       'جاذبه‌ها','جاذبه‌های برتر با ساعات کار، بلیط و نکات محلی',
       'حمل و نقل','چگونگی رسیدن و گشت و گذار - پروازها، قطارها، مترو و نکات محلی',
       'اورژانس','بیمارستان، پلیس، تماس‌های سفارت و شماره تلفن‌های مهم',
       'راهنمای پرداخت','Alipay، WeChat Pay، نکات نقدی و اطلاعات کارت',
       'اقامت','توصیه‌های هتل برای هر بودجه‌ای از لوکس تا اقتصادی',
       'نکات فرهنگی','آداب و رسوم محلی، آداب معاشرت و بینش‌های فرهنگی برای هر شهر',
       'دستیار هوش مصنوعی','سوالاتی درباره سفر به چین بپرسید و پاسخ‌های فوری دریافت کنید'],
};

let out = text;

// 在每个语言块中，recents 后面插入 features 块
// 找到每个语言 recents: { ... }, 然后插入 features
const langs = Object.keys(data);
let inserted = 0;

for (const lang of langs) {
  // 找该语言的 recents 块
  const langMarker = '\n  ' + lang + ': {';
  const langStart = out.indexOf(langMarker);
  if (langStart < 0) { console.log('Lang not found:', lang); continue; }
  
  // 在该语言块内找 recents 块结束
  const recentsStart = out.indexOf('recents: {', langStart);
  if (recentsStart < 0) { console.log('recents not found in', lang); continue; }
  // 找 recents 块结束 - 匹配 "  }," 后接 "    // " 注释或 features
  // 简化: 找到 recents 开始后, 累计括号, 找到配对 '},'
  let depth = 0;
  let i = out.indexOf('{', recentsStart);
  let recentsEnd = -1;
  for (; i < out.length; i++) {
    if (out[i] === '{') depth++;
    else if (out[i] === '}') {
      depth--;
      if (depth === 0) { recentsEnd = i; break; }
    }
  }
  if (recentsEnd < 0) { console.log('recents end not found in', lang); continue; }
  
  // 找到 recentsEnd 后面的 "," 位置
  let commaPos = recentsEnd;
  while (commaPos < out.length && (out[commaPos] === '}' || out[commaPos] === ' ' || out[commaPos] === '\t' || out[commaPos] === '\r' || out[commaPos] === '\n')) commaPos++;
  if (out[commaPos] === ',') commaPos++;
  
  // 构造 features 块
  const arr = data[lang];
  const featuresBlock = NL + '    // Features section' + NL + '    features: {' + NL +
    '      restaurantGuide: ' + JSON.stringify(arr[0]) + ',' + NL +
    '      restaurantGuideDesc: ' + JSON.stringify(arr[1]) + ',' + NL +
    '      attractions: ' + JSON.stringify(arr[2]) + ',' + NL +
    '      attractionsDesc: ' + JSON.stringify(arr[3]) + ',' + NL +
    '      transport: ' + JSON.stringify(arr[4]) + ',' + NL +
    '      transportDesc: ' + JSON.stringify(arr[5]) + ',' + NL +
    '      emergency: ' + JSON.stringify(arr[6]) + ',' + NL +
    '      emergencyDesc: ' + JSON.stringify(arr[7]) + ',' + NL +
    '      payment: ' + JSON.stringify(arr[8]) + ',' + NL +
    '      paymentDesc: ' + JSON.stringify(arr[9]) + ',' + NL +
    '      accommodation: ' + JSON.stringify(arr[10]) + ',' + NL +
    '      accommodationDesc: ' + JSON.stringify(arr[11]) + ',' + NL +
    '      culturalTips: ' + JSON.stringify(arr[12]) + ',' + NL +
    '      culturalTipsDesc: ' + JSON.stringify(arr[13]) + ',' + NL +
    '      aiAssistant: ' + JSON.stringify(arr[14]) + ',' + NL +
    '      aiAssistantDesc: ' + JSON.stringify(arr[15]) + ',' + NL +
    '    },';
  
  out = out.substring(0, commaPos) + featuresBlock + out.substring(commaPos);
  inserted++;
}

console.log('Inserted features into', inserted, 'langs');
fs.writeFileSync('src/i18n/translations.ts', out, 'utf8');
