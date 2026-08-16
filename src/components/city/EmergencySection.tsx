import {
  type EmergencyNumber,
  getNationalEmergencyNumbers,
} from "@/data/emergency/global-contacts";
import React from "react";
import { ct } from "@/i18n/components-strings";
import { getEmergencyOverride } from "@/i18n/app-overrides";
import { CityMap } from "./CityMap";
import { EmergencyCard, type EmergencyContact } from "./EmergencyCard";
import { QuickDialGrid } from "./EmergencyCard";

interface EmergencySectionProps {
  contacts: EmergencyContact[];
  city?: any;
  lang?: string;
}

const STRINGS: Record<string, Record<string, string>> = {
  en: {
    emergencyTitle: "Emergency Numbers",
    quickDialHeading: "Quick Dial (Inside China)",
    sosNote: "Note:",
    sosDesc: "The SOS button in the bottom-right corner of any page provides instant access to emergency services with translation and GPS location sharing.",
    forForeignHeading: "For Foreign Visitors (Reachable Internationally)",
    forForeignDesc: "These numbers work from outside mainland China. They are the right first-call for tourists who lose their passport, are arrested, need medical help with a foreign card, or face any other emergency.",
    hospitalsHeading: "Hospitals",
    embassiesHeading: "Embassies & Consulates",
    otherHeading: "Other Emergency Numbers",
    touristComplaint: "Tourist Complaint & Help",
    culturalMarketIP: "Cultural Market (IP)",
    governmentService: "Government Service",
    trafficPoliceService: "Traffic Police Service",
    notePrefix: "Note:",
    shortCodeInside: "(Inside China: {code})",
    callAriaSuffix: " - call ",
  },
  ja: {
    emergencyTitle: "緊急番号",
    quickDialHeading: "中国国内のクイックダイヤル",
    sosNote: "注意：",
    sosDesc: "ページ右下のSOSボタンは、翻訳とGPS位置情報共有機能を備えた緊急サービスへの即時アクセスを提供します。",
    forForeignHeading: "外国人旅行者向け（国際的に連絡可能）",
    forForeignDesc: "これらの番号は中国本土の外からも繋がります。パスポート紛失、逮捕、外国カードでの医療支援、その他あらゆる緊急事態において、最初の連絡先に適しています。",
    hospitalsHeading: "病院",
    embassiesHeading: "大使館・領事館",
    otherHeading: "その他の緊急番号",
    touristComplaint: "観光客苦情・相談",
    culturalMarketIP: "文化市場（知的財産）",
    governmentService: "政府サービス",
    trafficPoliceService: "交警サービス",
    notePrefix: "注意：",
    shortCodeInside: "（中国国内: {code}）",
    callAriaSuffix: "）に電話",
  },
  ko: {
    emergencyTitle: "비상 번호",
    quickDialHeading: "중국 내 빠른 전화",
    sosNote: "참고:",
    sosDesc: "페이지 우하단의 SOS 버튼은 번역 및 GPS 위치 공유 기능을 갖춘 응급 서비스에 즉각 접근할 수 있도록 합니다.",
    forForeignHeading: "외국인 방문객용 (해외에서 연결 가능)",
    forForeignDesc: "이 번호들은 중국 본토 밖에서도 연결됩니다. 여권 분실, 체포, 외국 카드로 의료 지원 필요 또는 기타 응급 상황에 첫 번째 연락처로 적합합니다.",
    hospitalsHeading: "병원",
    embassiesHeading: "대사관 및 영사관",
    otherHeading: "기타 응급 번호",
    touristComplaint: "관광객 민원 및 지원",
    culturalMarketIP: "문화 시장 (지적 재산)",
    governmentService: "정부 서비스",
    trafficPoliceService: "교통 경찰 서비스",
    notePrefix: "참고:",
    shortCodeInside: "(중국 내: {code})",
    callAriaSuffix: "에 전화",
  },
  "zh-CN": {
    emergencyTitle: "紧急号码",
    quickDialHeading: "中国境内快速拨号",
    sosNote: "注意：",
    sosDesc: "页面右下角的 SOS 按钮提供即时访问紧急服务,支持翻译和 GPS 位置共享。",
    forForeignHeading: "外国访客专用 (可从境外拨打)",
    forForeignDesc: "这些号码可从中国大陆以外拨打。适用于护照丢失、被捕、需要外国卡医疗救助或其他任何紧急情况时的首选联络方式。",
    hospitalsHeading: "医院",
    embassiesHeading: "大使馆与领事馆",
    otherHeading: "其他紧急号码",
    touristComplaint: "游客投诉与援助",
    culturalMarketIP: "文化市场 (知识产权)",
    governmentService: "政府服务",
    trafficPoliceService: "交警服务",
    notePrefix: "注意：",
    shortCodeInside: "(中国境内: {code})",
    callAriaSuffix: " 电话",

  },
  "zh-TW": {
    emergencyTitle: "緊急號碼",
    quickDialHeading: "中國境內快速撥號",
    sosNote: "注意：",
    sosDesc: "頁面右下角的 SOS 按鈕提供即時訪問緊急服務,支援翻譯和 GPS 位置共用。",
    forForeignHeading: "外國訪客專用 (可從境外撥打)",
    forForeignDesc: "這些號碼可從中國大陸以外撥打。適用於護照遺失、被捕、需要外國卡醫療救助或其他任何緊急情況時的首選聯絡方式。",
    hospitalsHeading: "醫院",
    embassiesHeading: "大使館與領事館",
    otherHeading: "其他緊急號碼",
    touristComplaint: "遊客投訴與援助",
    culturalMarketIP: "文化市場 (智慧財產權)",
    governmentService: "政府服務",
    trafficPoliceService: "交警服務",
    notePrefix: "注意：",
    shortCodeInside: "(中國境內: {code})",
    callAriaSuffix: " 電話",

  },
  th: {
    emergencyTitle: "หมายเลขฉุกเฉิน",
    quickDialHeading: "โทรด่วนในจีน",
    sosNote: "หมายเหตุ:",
    sosDesc: "ปุ่ม SOS ที่มุมล่างขวาของหน้าให้การเข้าถึงบริการฉุกเฉินทันทีพร้อมการแปลและการแชร์ตำแหน่ง GPS",
    forForeignHeading: "สำหรับผู้มาเยือนต่างชาติ (ติดต่อได้จากต่างประเทศ)",
    forForeignDesc: "หมายเลขเหล่านี้ใช้ได้จากนอกจีนแผ่นดินใหญ่ เหมาะสำหรับการโทรแรกเมื่อนักท่องเที่ยวทำหนังสือเดินทางหาย ถูกจับ ต้องการความช่วยเหลือทางการแพทย์ด้วยบัตรต่างประเทศ หรือเหตุฉุกเฉินอื่นๆ",
    hospitalsHeading: "โรงพยาบาล",
    embassiesHeading: "สถานทูตและสถานกงสุล",
    otherHeading: "หมายเลขฉุกเฉินอื่นๆ",
    touristComplaint: "ร้องเรียนและช่วยเหลือนักท่องเที่ยว",
    culturalMarketIP: "ตลาดวัฒนธรรม (ทรัพย์สินทางปัญญา)",
    governmentService: "บริการภาครัฐ",
    trafficPoliceService: "บริการตำรวจจราจร",
    notePrefix: "หมายเหตุ:",
    shortCodeInside: "(ภายในจีน: {code})",
    callAriaSuffix: " โทร ",
  },
  vi: {
    emergencyTitle: "Số khẩn cấp",
    quickDialHeading: "Gọi nhanh tại Trung Quốc",
    sosNote: "Lưu ý:",
    sosDesc: "Nút SOS ở góc dưới bên phải của bất kỳ trang nào cung cấp quyền truy cập tức thì vào các dịch vụ khẩn cấp với tính năng dịch thuật và chia sẻ vị trí GPS.",
    forForeignHeading: "Dành cho khách nước ngoài (Có thể gọi từ quốc tế)",
    forForeignDesc: "Các số này hoạt động từ bên ngoài Trung Quốc đại lục. Đây là cuộc gọi đầu tiên phù hợp cho khách du lịch bị mất hộ chiếu, bị bắt, cần trợ giúp y tế bằng thẻ nước ngoài, hoặc bất kỳ trường hợp khẩn cấp nào khác.",
    hospitalsHeading: "Bệnh viện",
    embassiesHeading: "Đại sứ quán và Lãnh sự quán",
    otherHeading: "Số khẩn cấp khác",
    touristComplaint: "Khiếu nại và hỗ trợ khách du lịch",
    culturalMarketIP: "Thị trường văn hóa (Sở hữu trí tuệ)",
    governmentService: "Dịch vụ chính phủ",
    trafficPoliceService: "Dịch vụ cảnh sát giao thông",
    notePrefix: "Lưu ý:",
    shortCodeInside: "(Tại Trung Quốc: {code})",
    callAriaSuffix: " gọi ",
  },
  ru: {
    emergencyTitle: "Экстренные номера",
    quickDialHeading: "Быстрый набор в Китае",
    sosNote: "Примечание:",
    sosDesc: "Кнопка SOS в правом нижнем углу любой страницы обеспечивает мгновенный доступ к экстренным службам с переводом и обменом местоположением по GPS.",
    forForeignHeading: "Для иностранных посетителей (доступны из-за рубежа)",
    forForeignDesc: "Эти номера работают за пределами материкового Китая. Это правильный первый звонок для туристов, потерявших паспорт, арестованных, нуждающихся в медицинской помощи с иностранной картой, или столкнувшихся с любой другой чрезвычайной ситуацией.",
    hospitalsHeading: "Больницы",
    embassiesHeading: "Посольства и консульства",
    otherHeading: "Другие экстренные номера",
    touristComplaint: "Жалобы и помощь туристам",
    culturalMarketIP: "Культурный рынок (ИС)",
    governmentService: "Государственная служба",
    trafficPoliceService: "Дорожная полиция",
    notePrefix: "Примечание:",
    shortCodeInside: "(в Китае: {code})",
    callAriaSuffix: " позвонить ",
  },
  fr: {
    emergencyTitle: "Numéros d\u2019urgence",
    quickDialHeading: "Numéros rapides en Chine",
    sosNote: "Note :",
    sosDesc: "Le bouton SOS en bas à droite de chaque page donne un accès instantané aux services d\u2019urgence avec traduction et partage de position GPS.",
    forForeignHeading: "Pour les visiteurs étrangers (joignables depuis l\u2019étranger)",
    forForeignDesc: "Ces numéros fonctionnent depuis l\u2019extérieur de la Chine continentale. Ils sont le premier appel à passer pour les touristes qui perdent leur passeport, sont arrêtés, ont besoin d\u2019une aide médicale avec une carte étrangère, ou font face à toute autre urgence.",
    hospitalsHeading: "Hôpitaux",
    embassiesHeading: "Ambassades et consulats",
    otherHeading: "Autres numéros d\u2019urgence",
    touristComplaint: "Réclamations et aide aux touristes",
    culturalMarketIP: "Marché culturel (PI)",
    governmentService: "Service gouvernemental",
    trafficPoliceService: "Service de police de la route",
    notePrefix: "Note :",
    shortCodeInside: "(en Chine : {code})",
    callAriaSuffix: " appeler ",
  },
  de: {
    emergencyTitle: "Notrufnummern",
    quickDialHeading: "Schnellwahl in China",
    sosNote: "Hinweis:",
    sosDesc: "Die SOS-Schaltfläche unten rechts auf jeder Seite bietet sofortigen Zugang zu Notdiensten mit Übersetzung und GPS-Standortfreigabe.",
    forForeignHeading: "Für ausländische Besucher (aus dem Ausland erreichbar)",
    forForeignDesc: "Diese Nummern funktionieren von außerhalb des chinesischen Festlands. Sie sind der richtige erste Anruf für Touristen, die ihren Reisepass verlieren, verhaftet werden, medizinische Hilfe mit einer ausländischen Karte benötigen oder einer anderen Notlage ausgesetzt sind.",
    hospitalsHeading: "Krankenhäuser",
    embassiesHeading: "Botschaften und Konsulate",
    otherHeading: "Weitere Notrufnummern",
    touristComplaint: "Beschwerden und Hilfe für Touristen",
    culturalMarketIP: "Kulturmarkt (IP)",
    governmentService: "Regierungsdienst",
    trafficPoliceService: "Verkehrspolizei",
    notePrefix: "Hinweis:",
    shortCodeInside: "(in China: {code})",
    callAriaSuffix: " anrufen ",
  },
  ar: {
    emergencyTitle: "أرقام الطوارئ",
    quickDialHeading: "الاتصال السريع داخل الصين",
    sosNote: "ملاحظة:",
    sosDesc: "يوفر زر SOS في الزاوية اليمنى السفلية من أي صفحة وصولاً فوريًا إلى خدمات الطوارئ مع الترجمة ومشاركة موقع GPS.",
    forForeignHeading: "للزوار الأجانب (يمكن الاتصال دوليًا)",
    forForeignDesc: "تعمل هذه الأرقام من خارج البر الرئيسي للصين. وهي المكالمة الأولى المناسبة للسياح الذين يفقدون جواز سفرهم، أو يتم القبض عليهم، أو يحتاجون إلى مساعدة طبية ببطاقة أجنبية، أو يواجهون أي حالة طوارئ أخرى.",
    hospitalsHeading: "المستشفيات",
    embassiesHeading: "السفارات والقنصليات",
    otherHeading: "أرقام طوارئ أخرى",
    touristComplaint: "شكاوى السياح والمساعدة",
    culturalMarketIP: "السوق الثقافي (الملكية الفكرية)",
    governmentService: "الخدمة الحكومية",
    trafficPoliceService: "خدمة شرطة المرور",
    notePrefix: "ملاحظة:",
    shortCodeInside: "(داخل الصين: {code})",
    callAriaSuffix: " اتصل ",
  },
  fa: {
    emergencyTitle: "شماره‌های اضطراری",
    quickDialHeading: "شماره‌گیر سریع در چین",
    sosNote: "توجه:",
    sosDesc: "دکمه SOS در گوشه پایین سمت راست هر صفحه، دسترسی فوری به خدمات اضطراری را با ترجمه و اشتراک‌گذاری موقعیت GPS فراهم می‌کند.",
    forForeignHeading: "برای بازدیدکنندگان خارجی (از خارج از کشور قابل تماس)",
    forForeignDesc: "این شماره‌ها از خارج از سرزمین اصلی چین کار می‌کنند. آنها اولین تماس مناسب برای گردشگرانی هستند که گذرنامه خود را گم کرده‌اند، دستگیر شده‌اند، به کمک پزشکی با کارت خارجی نیاز دارند، یا با هر وضعیت اضطراری دیگری روبرو هستند.",
    hospitalsHeading: "بیمارستان‌ها",
    embassiesHeading: "سفارت‌ها و کنسولگری‌ها",
    otherHeading: "سایر شماره‌های اضطراری",
    touristComplaint: "شکایات و کمک به گردشگران",
    culturalMarketIP: "بازار فرهنگی (مالکیت معنوی)",
    governmentService: "خدمات دولتی",
    trafficPoliceService: "خدمات پلیس راهنمایی و رانندگی",
    notePrefix: "توجه:",
    shortCodeInside: "(داخل چین: {code})",
    callAriaSuffix: " تماس ",
  },
};

function tt(lang: string, key: string, fallbackEn: string): string {
  const l = STRINGS[lang] || STRINGS.en;
  return l[key] ?? STRINGS.en[key] ?? fallbackEn;
}

/**
 * Render a single national-level emergency number as a card.
 * Uses tel: scheme (already sanitized in EmergencyCard.getPhoneHref).
 */
function NationalEmergencyCard({ item, lang = "en" }: { item: EmergencyNumber; lang?: string }) {
  const telHref = `tel:${item.phone.replace(/[^\d+]/g, "")}`;
  return (
    <a
      href={telHref}
      className="flex items-start gap-3 p-4 bg-white border border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
      aria-label={`${lang === "ja" ? item.nameJa || item.name : getEmergencyOverride(lang, `ename:${item.phone}`) || item.name}${tt(lang, "callAriaSuffix", " - call ")}${item.phone}`}
    >
      <span className="text-2xl shrink-0" aria-hidden>
        {item.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-gray-900">{lang === "ja" ? item.nameJa || item.name : getEmergencyOverride(lang, `ename:${item.phone}`) || item.name}</h4>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            {ct(lang, "qd_intl", "Intl")}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{lang === "ja" ? item.descriptionJa || item.description : getEmergencyOverride(lang, `edesc:${item.phone}`) || item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-blue-700">{item.phone}</span>
          {item.shortCode && (
            <span className="text-xs text-gray-500">{tt(lang, "shortCodeInside", "(Inside China: {code})").replace("{code}", item.shortCode)}</span>
          )}
        </div>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <span>📞</span>
        <span>{ct(lang, "qd_call", "Call")}</span>
      </span>
    </a>
  );
}

export function EmergencySection({ contacts, city, lang = "en" }: EmergencySectionProps) {
  const nationalNumbers = getNationalEmergencyNumbers();

  return (
    <div>
      {/* Emergency Map */}
      {city && (
        <div className="mb-6">
          <CityMap city={city} activeTab="emergency" height="350px" lang={lang} />
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <p className="text-red-800 font-medium">
          ⚠️ {ct(lang, "sos_warning_main", "In an emergency, call the appropriate number immediately. English-speaking operators may be available in China.")}
        </p>
        <p className="text-red-700 text-sm mt-2">
          💡 {ct(lang, "sos_hotline_hint", "Foreign travelers in China should also save")}{" "}
          <a href="tel:+861012308" className="font-bold underline">
            +86-10-12308
          </a>
          {" "}
          {ct(lang, "sos_hotline_desc", "— the Consular Protection Hotline, a 24/7 English line run by China’s Foreign Ministry.")}
        </p>
      </div>

      {/* Quick Dial Grid — domestic 110/120/119 */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4">{tt(lang, "quickDialHeading", "Quick Dial (Inside China)")}</h3>
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-bold">{tt(lang, "sosNote", "Note:")}</span>{" "}
            {tt(lang, "sosDesc", "The SOS button in the bottom-right corner of any page provides instant access to emergency services with translation and GPS location sharing.")}
          </p>
        </div>
        <QuickDialGrid showAmbulance={true} showPolice={true} showFire={true} showTraffic={false} lang={lang} />
      </div>

      {/* National numbers for foreigners — 12308, 12301, 12345 etc. */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🌐</span> {tt(lang, "forForeignHeading", "For Foreign Visitors (Reachable Internationally)")}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {tt(lang, "forForeignDesc", "These numbers work from outside mainland China. They are the right first-call for tourists who lose their passport, are arrested, need medical help with a foreign card, or face any other emergency.")}
        </p>
        <div className="space-y-3">
          {nationalNumbers.map((item) => (
            <NationalEmergencyCard key={item.phone} item={item} lang={lang} />
          ))}
        </div>
      </div>

      {/* Per-city contacts grouped by type */}
      <div className="space-y-6">
        {(() => {
          const hospitals = contacts.filter((c) => c.type === "hospital");
          const embassies = contacts.filter((c) => c.type === "embassy");
          const others = contacts.filter((c) => c.type !== "hospital" && c.type !== "embassy");

          return (
            <>
              {hospitals.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏥</span> {tt(lang, "hospitalsHeading", "Hospitals")}
                  </h3>
                  <div className="space-y-3">
                    {hospitals.map((h) => (
                      <EmergencyCard key={h.phone} contact={h} lang={lang} />
                    ))}
                  </div>
                </div>
              )}
              {embassies.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏛️</span> {tt(lang, "embassiesHeading", "Embassies & Consulates")}
                  </h3>
                  <div className="space-y-3">
                    {embassies.map((e) => (
                      <EmergencyCard key={e.phone} contact={e} lang={lang} />
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>📞</span> {tt(lang, "otherHeading", "Other Emergency Numbers")}
                  </h3>
                  <div className="space-y-3">
                    {others.map((o) => (
                      <EmergencyCard key={o.phone} contact={o} lang={lang} />
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default EmergencySection;
