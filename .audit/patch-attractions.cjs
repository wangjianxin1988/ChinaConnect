const fs = require("fs");
const p = "src/pages/[lang]/city/[slug]/attractions.astro";
let src = fs.readFileSync(p, "utf8");

// 1) Insert CAT_LABELS into frontmatter after "const categories = ..." line
const anchor = "const categories = [...new Set(city.attractions.map((a: any) => a.category))].sort();";
const CAT_LABELS = `const CAT_LABELS: Record<string, Record<string, string>> = {
  adventure: { en: "Adventure", ja: "アドベンチャー", ko: "모험", "zh-CN": "探险", "zh-TW": "探險", th: "การผจญภัย", vi: "Phiêu lưu", ru: "Приключения", fr: "Aventure", de: "Abenteuer", ar: "مغامرة", fa: "ماجراجویی" },
  aquarium: { en: "Aquarium", ja: "水族館", ko: "수족관", "zh-CN": "水族馆", "zh-TW": "水族館", th: "พิพิธภัณฑ์สัตว์น้ำ", vi: "Thủy cung", ru: "Аквариум", fr: "Aquarium", de: "Aquarium", ar: "حوض أسماك", fa: "آکواریوم" },
  beach: { en: "Beach", ja: "ビーチ", ko: "해변", "zh-CN": "海滩", "zh-TW": "海灘", th: "ชายหาด", vi: "Bãi biển", ru: "Пляж", fr: "Plage", de: "Strand", ar: "شاطئ", fa: "ساحل" },
  cultural: { en: "Cultural", ja: "文化", ko: "문화", "zh-CN": "文化", "zh-TW": "文化", th: "วัฒนธรรม", vi: "Văn hóa", ru: "Культурный", fr: "Culturel", de: "Kulturell", ar: "ثقافي", fa: "فرهنگی" },
  culture: { en: "Culture", ja: "文化", ko: "문화", "zh-CN": "文化", "zh-TW": "文化", th: "วัฒนธรรม", vi: "Văn hóa", ru: "Культура", fr: "Culture", de: "Kultur", ar: "ثقافة", fa: "فرهنگ" },
  entertainment: { en: "Entertainment", ja: "エンターテイメント", ko: "연예", "zh-CN": "娱乐", "zh-TW": "娛樂", th: "บันเทิง", vi: "Giải trí", ru: "Развлечения", fr: "Divertissement", de: "Unterhaltung", ar: "ترفيه", fa: "سرگرمی" },
  family: { en: "Family", ja: "家族向け", ko: "가족", "zh-CN": "亲子", "zh-TW": "親子", th: "ครอบครัว", vi: "Gia đình", ru: "Семейный", fr: "Familial", de: "Familie", ar: "عائلي", fa: "خانوادگی" },
  festival: { en: "Festival", ja: "祭り", ko: "축제", "zh-CN": "节庆", "zh-TW": "節慶", th: "เทศกาล", vi: "Lễ hội", ru: "Фестиваль", fr: "Festival", de: "Festival", ar: "مهرجان", fa: "جشنواره" },
  historical: { en: "Historical", ja: "歴史", ko: "역사", "zh-CN": "历史", "zh-TW": "歷史", th: "ประวัติศาสตร์", vi: "Lịch sử", ru: "Исторический", fr: "Historique", de: "Historisch", ar: "تاريخي", fa: "تاریخی" },
  island: { en: "Island", ja: "島", ko: "섬", "zh-CN": "岛屿", "zh-TW": "島嶼", th: "เกาะ", vi: "Đảo", ru: "Остров", fr: "Île", de: "Insel", ar: "جزيرة", fa: "جزیره" },
  landmark: { en: "Landmark", ja: "ランドマーク", ko: "랜드마크", "zh-CN": "地标", "zh-TW": "地標", th: "สถานที่สำคัญ", vi: "Địa danh", ru: "Достопримечательность", fr: "Monument", de: "Wahrzeichen", ar: "معلم", fa: "بنای تاریخی" },
  market: { en: "Market", ja: "市場", ko: "시장", "zh-CN": "市场", "zh-TW": "市集", th: "ตลาด", vi: "Chợ", ru: "Рынок", fr: "Marché", de: "Markt", ar: "سوق", fa: "بازار" },
  modern: { en: "Modern", ja: "モダン", ko: "현대", "zh-CN": "现代", "zh-TW": "現代", th: "ทันสมัย", vi: "Hiện đại", ru: "Современный", fr: "Moderne", de: "Modern", ar: "حديث", fa: "مدرن" },
  museum: { en: "Museum", ja: "博物館", ko: "박물관", "zh-CN": "博物馆", "zh-TW": "博物館", th: "พิพิธภัณฑ์", vi: "Bảo tàng", ru: "Музей", fr: "Musée", de: "Museum", ar: "متحف", fa: "موزه" },
  natural: { en: "Natural", ja: "自然", ko: "자연", "zh-CN": "自然", "zh-TW": "自然", th: "ธรรมชาติ", vi: "Thiên nhiên", ru: "Природа", fr: "Naturel", de: "Natur", ar: "طبيعي", fa: "طبیعی" },
  nature: { en: "Nature", ja: "自然", ko: "자연", "zh-CN": "自然", "zh-TW": "自然", th: "ธรรมชาติ", vi: "Thiên nhiên", ru: "Природа", fr: "Nature", de: "Natur", ar: "طبيعة", fa: "طبیعت" },
  park: { en: "Park", ja: "公園", ko: "공원", "zh-CN": "公园", "zh-TW": "公園", th: "สวนสาธารณะ", vi: "Công viên", ru: "Парк", fr: "Parc", de: "Park", ar: "حديقة", fa: "پارک" },
  resort: { en: "Resort", ja: "リゾート", ko: "리조트", "zh-CN": "度假区", "zh-TW": "度假區", th: "รีสอร์ท", vi: "Khu nghỉ dưỡng", ru: "Курорт", fr: "Station balnéaire", de: "Resort", ar: "منتجع", fa: "تفرجگاه" },
  seasonal: { en: "Seasonal", ja: "季節限定", ko: "계절", "zh-CN": "季节性", "zh-TW": "季節性", th: "ตามฤดูกาล", vi: "Theo mùa", ru: "Сезонный", fr: "Saisonnier", de: "Saisonal", ar: "موسمي", fa: "فصلی" },
  shopping: { en: "Shopping", ja: "ショッピング", ko: "쇼핑", "zh-CN": "购物", "zh-TW": "購物", th: "ช้อปปิ้ง", vi: "Mua sắm", ru: "Шоппинг", fr: "Shopping", de: "Einkaufen", ar: "تسوق", fa: "خرید" },
  sports: { en: "Sports", ja: "スポーツ", ko: "스포츠", "zh-CN": "运动", "zh-TW": "運動", th: "กีฬา", vi: "Thể thao", ru: "Спорт", fr: "Sport", de: "Sport", ar: "رياضة", fa: "ورزش" },
  street: { en: "Street", ja: "ストリート", ko: "거리", "zh-CN": "街区", "zh-TW": "街區", th: "ถนน", vi: "Phố", ru: "Улица", fr: "Rue", de: "Straße", ar: "شارع", fa: "خیابان" },
  temple: { en: "Temple", ja: "寺院", ko: "사찰", "zh-CN": "寺庙", "zh-TW": "寺廟", th: "วัด", vi: "Chùa", ru: "Храм", fr: "Temple", de: "Tempel", ar: "معبد", fa: "معبد" },
  "theme-park": { en: "Theme Park", ja: "テーマパーク", ko: "테마파크", "zh-CN": "主题公园", "zh-TW": "主題公園", th: "สวนสนุก", vi: "Công viên giải trí", ru: "Тематический парк", fr: "Parc à thème", de: "Themenpark", ar: "مدينة ملاهي", fa: "شهربازی" },
  wellness: { en: "Wellness", ja: "ウェルネス", ko: "웰니스", "zh-CN": "养生", "zh-TW": "養生", th: "สุขภาพดี", vi: "Sức khỏe", ru: "Оздоровление", fr: "Bien-être", de: "Wellness", ar: "عافية", fa: "تندرستی" },
};`;
if (!src.includes("const CAT_LABELS")) {
  src = src.split(anchor).join(anchor + "\n" + CAT_LABELS);
}

// 2) Replace the inline catLabels object block and its usage
const inlineStart = src.indexOf("const catLabels = {");
if (inlineStart >= 0) {
  const blockEnd = src.indexOf("};", inlineStart) + 2;
  const inlineBlock = src.slice(inlineStart, blockEnd);
  src = src.slice(0, inlineStart) + "const catLabels = CAT_LABELS;" + src.slice(blockEnd);
}
fs.writeFileSync(p, src);
console.log("attractions.astro patched:", src.includes("const CAT_LABELS"), src.includes("const catLabels = CAT_LABELS;"));
