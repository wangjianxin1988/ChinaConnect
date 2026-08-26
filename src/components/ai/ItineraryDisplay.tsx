/**
 * ItineraryDisplay Component
 * Beautiful day-by-day itinerary cards with timeline layout
 * No dangerouslySetInnerHTML - all safe rendering via React
 */

import type { DailyPlan, MealPlan, SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";

// ============================================
// Types
// ============================================

interface ItineraryDisplayProps {
  itinerary: SavedItinerary | null;
  // LABEL table is only translated for en/zh; ja/ko falls back to en at runtime.
  language?: ItineraryLang;
  onSave?: (name: string) => void;
  onExport?: (format: "text" | "json" | "pdf") => void;
  onShare?: () => void;
  onDelete?: () => void;
  onOpenDetail?: (id: string) => void;
  compact?: boolean;
}

// ============================================
// Labels
// ============================================

const LABEL = {
  "en": {
    save: "Save",
    export: "Export",
    exportPdf: "PDF",
    exportText: "Text",
    exportJson: "JSON",
    share: "Share",
    viewDetails: "View Full Details",
    viewDetailsHint: "Preview only — open the full itinerary page for complete details.",
    stops: "stops",
    delete: "Delete",
    saved: "Saved",
    overview: "Overview",
    daily: "Daily Plan",
    practical: "Practical Info",
    highlights: "Top Highlights",
    budget: "Budget Breakdown",
    total: "Total",
    day: "Day",
    details: "Plan Details",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    accommodation: "Accommodation",
    transport: "Transport",
    noItinerary: "No itinerary to display",
    generateFirst: "Generate an itinerary first by chatting with the AI.",
    dailyPending: "Daily details will appear after full planning",    perDay: "per day",
    days: "days",
    cuisine: "Cuisine",
    priceRange: "Price",
    recommended: "Recommended dishes",
    reservation: "Reservation required",
    insiderTip: "Insider tip",
    duration: "Duration",
    tickets: "Tickets",
    bookNow: "Booking required",
    from: "from",
    to: "to",
    cost: "Cost",
    perNight: "/night",
    stars: "Stars",
    nearestMetro: "Nearest metro",
    map: "View on map",
    cancel: "Cancel",
    saveItinerary: "Save Itinerary",
    itineraryName: "Itinerary name",
    accommodationLabel: "🏨 Accommodation",
    transportLabel: "🚇 Transport",
    foodLabel: "🍜 Food",
    attractionsLabel: "🎫 Attractions",
    emergencyTitle: "Emergency Contacts",
    visaTitle: "Visa Information",
    paymentTitle: "Payment",
    simTitle: "SIM Card",
    transportTitle: "Transport",
  },
  "ja": {
    save: "保存",
    export: "エクスポート",
    exportPdf: "PDF",
    exportText: "テキスト",
    exportJson: "JSON",
    share: "共有",
    viewDetails: "詳細を見る",
    viewDetailsHint: "プレビューのみ表示です。完全な内容は詳細ページでご覧ください。",
    stops: "スポット",
    delete: "削除",
    saved: "保存済み",
    overview: "概要",
    daily: "日別プラン",
    practical: "実用情報",
    highlights: "おすすめポイント",
    budget: "予算内訳",
    total: "合計",
    day: "第",
    details: "プラン詳細",
    morning: "午前",
    afternoon: "午後",
    evening: "夕方",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    accommodation: "宿泊",
    transport: "交通",
    noItinerary: "表示する行程がありません",
    generateFirst: "AIとのチャットでまず行程を生成してください。",
    dailyPending: "詳細な日別プランはプラン完成後に表示されます",    perDay: "1日あたり",
    days: "日間",
    cuisine: "料理ジャンル",
    priceRange: "価格",
    recommended: "おすすめ料理",
    reservation: "予約が必要",
    insiderTip: "地元のコツ",
    duration: "滞在時間",
    tickets: "チケット",
    bookNow: "要予約",
    from: "から",
    to: "まで",
    cost: "料金",
    perNight: "/泊",
    stars: "星評価",
    nearestMetro: "最寄り駅",
    map: "地図で見る",
    cancel: "キャンセル",
    saveItinerary: "行程を保存",
    itineraryName: "行程名",
    accommodationLabel: "🏨 宿泊",
    transportLabel: "🚇 交通",
    foodLabel: "🍜 グルメ",
    attractionsLabel: "🎫 観光スポット",
    emergencyTitle: "緊急連絡先",
    visaTitle: "ビザ情報",
    paymentTitle: "支払い",
    simTitle: "SIMカード",
    transportTitle: "交通アクセス",
  },
  "ko": {
    save: "저장",
    export: "내보내기",
    exportPdf: "PDF",
    exportText: "텍스트",
    exportJson: "JSON",
    share: "공유",
    viewDetails: "전체 보기",
    viewDetailsHint: "미리보기입니다. 전체 내용은 상세 페이지에서 확인하세요.",
    stops: "곳",
    delete: "삭제",
    saved: "저장됨",
    overview: "개요",
    daily: "일별 일정",
    practical: "실용 정보",
    highlights: "하이라이트",
    budget: "예산 내역",
    total: "합계",
    day: "Day",
    details: "일정 상세",
    morning: "오전",
    afternoon: "오후",
    evening: "저녁",
    breakfast: "아침",
    lunch: "점심",
    dinner: "저녁",
    accommodation: "숙소",
    transport: "교통",
    noItinerary: "표시할 일정이 없습니다",
    generateFirst: "AI와 채팅하여 먼저 일정을 생성하세요.",
    dailyPending: "전체 계획 후 일별 일정이 표시됩니다",    perDay: "하루 기준",
    days: "일",
    cuisine: "음식 종류",
    priceRange: "가격",
    recommended: "추천 요리",
    reservation: "예약 필요",
    insiderTip: "현지 팁",
    duration: "머무는 시간",
    tickets: "티켓",
    bookNow: "예약 필요",
    from: "부터",
    to: "까지",
    cost: "비용",
    perNight: "/박",
    stars: "별점",
    nearestMetro: "가장 가까운 지하철",
    map: "지도 보기",
    cancel: "취소",
    saveItinerary: "일정 저장",
    itineraryName: "일정 이름",
    accommodationLabel: "🏨 숙소",
    transportLabel: "🚇 교통",
    foodLabel: "🍜 맛집",
    attractionsLabel: "🎫 관광지",
    emergencyTitle: "긴급 연락처",
    visaTitle: "비자 정보",
    paymentTitle: "결제",
    simTitle: "SIM 카드",
    transportTitle: "교통",
  },
  "zh-CN": {
    save: "保存",
    export: "导出",
    exportPdf: "PDF",
    exportText: "文本",
    exportJson: "JSON",
    share: "分享",
    viewDetails: "查看完整行程",
    viewDetailsHint: "此处仅显示预览，点击上方按钮前往详情页查看完整行程。",
    stops: "个地点",
    delete: "删除",
    saved: "已保存",
    overview: "概览",
    daily: "每日行程",
    practical: "实用信息",
    highlights: "亮点",
    budget: "预算明细",
    total: "总计",
    day: "第",
    details: "行程详情",
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    accommodation: "住宿",
    transport: "交通",
    noItinerary: "暂无行程",
    generateFirst: "请先与AI对话生成行程。",
    dailyPending: "每日行程详情将在完整规划后显示",    perDay: "每天",
    days: "天",
    cuisine: "菜系",
    priceRange: "价格",
    recommended: "推荐菜品",
    reservation: "需要预约",
    insiderTip: "内行建议",
    duration: "游玩时长",
    tickets: "门票",
    bookNow: "需要预约",
    from: "从",
    to: "到",
    cost: "费用",
    perNight: "/晚",
    stars: "星级",
    nearestMetro: "最近地铁站",
    map: "查看地图",
    cancel: "取消",
    saveItinerary: "保存行程",
    itineraryName: "行程名称",
    accommodationLabel: "🏨 住宿",
    transportLabel: "🚇 交通",
    foodLabel: "🍜 餐饮",
    attractionsLabel: "🎫 景点",
    emergencyTitle: "紧急联系",
    visaTitle: "签证信息",
    paymentTitle: "支付方式",
    simTitle: "电话卡",
    transportTitle: "交通出行",
  },
  "zh-TW": {
    save: "儲存",
    export: "匯出",
    exportPdf: "PDF",
    exportText: "文字",
    exportJson: "JSON",
    share: "分享",
    viewDetails: "查看完整行程",
    viewDetailsHint: "此處僅顯示預覽，點擊上方按鈕前往詳情頁查看完整行程。",
    stops: "個景點",
    delete: "刪除",
    saved: "已儲存",
    overview: "總覽",
    daily: "每日行程",
    practical: "實用資訊",
    highlights: "行程亮點",
    budget: "預算明細",
    total: "總計",
    day: "第",
    details: "行程詳情",
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    accommodation: "住宿",
    transport: "交通",
    noItinerary: "暫無行程",
    generateFirst: "請先與 AI 對話生成行程。",
    dailyPending: "每日行程詳情將在完整規劃後顯示",    perDay: "每天",
    days: "天",
    cuisine: "菜系",
    priceRange: "價格",
    recommended: "推薦菜色",
    reservation: "需要預約",
    insiderTip: "行家建議",
    duration: "遊玩時間",
    tickets: "門票",
    bookNow: "需要預約",
    from: "從",
    to: "到",
    cost: "費用",
    perNight: "/晚",
    stars: "星級",
    nearestMetro: "最近地鐵站",
    map: "查看地圖",
    cancel: "取消",
    saveItinerary: "儲存行程",
    itineraryName: "行程名稱",
    accommodationLabel: "🏨 住宿",
    transportLabel: "🚇 交通",
    foodLabel: "🍜 美食",
    attractionsLabel: "🎫 景點",
    emergencyTitle: "緊急聯絡",
    visaTitle: "簽證資訊",
    paymentTitle: "支付方式",
    simTitle: "SIM 卡",
    transportTitle: "交通出行",
  },
  "th": {
    save: "บันทึก",
    export: "ส่งออก",
    exportPdf: "PDF",
    exportText: "ข้อความ",
    exportJson: "JSON",
    share: "แชร์",
    viewDetails: "ดูรายละเอียดทั้งหมด",
    viewDetailsHint: "นี่คือตัวอย่างเท่านั้น คลิกเพื่อดูรายละเอียดทั้งหมด",
    stops: "จุด",
    delete: "ลบ",
    saved: "บันทึกแล้ว",
    overview: "ภาพรวม",
    daily: "แผนรายวัน",
    practical: "ข้อมูลทั่วไป",
    highlights: "ไฮไลท์",
    budget: "รายละเอียดงบประมาณ",
    total: "รวม",
    day: "วันที่",
    details: "รายละเอียดแผน",
    morning: "เช้า",
    afternoon: "บ่าย",
    evening: "เย็น",
    breakfast: "อาหารเช้า",
    lunch: "อาหารกลางวัน",
    dinner: "อาหารเย็น",
    accommodation: "ที่พัก",
    transport: "การเดินทาง",
    noItinerary: "ไม่มีแผนการเดินทางที่จะแสดง",
    generateFirst: "กรุณาสร้างแผนการเดินทางก่อนด้วยการแชทกับ AI",
    dailyPending: "รายละเอียดรายวันจะแสดงหลังวางแผนเสร็จ",    perDay: "ต่อวัน",
    days: "วัน",
    cuisine: "ประเภทอาหาร",
    priceRange: "ราคา",
    recommended: "เมนูแนะนำ",
    reservation: "ต้องจองล่วงหน้า",
    insiderTip: "เคล็ดลับจากคนท้องถิ่น",
    duration: "ระยะเวลา",
    tickets: "ตั๋ว",
    bookNow: "ต้องจอง",
    from: "จาก",
    to: "ถึง",
    cost: "ค่าใช้จ่าย",
    perNight: "/คืน",
    stars: "ดาว",
    nearestMetro: "รถไฟฟ้าใกล้ที่สุด",
    map: "ดูแผนที่",
    cancel: "ยกเลิก",
    saveItinerary: "บันทึกแผนการเดินทาง",
    itineraryName: "ชื่อแผนการเดินทาง",
    accommodationLabel: "🏨 ที่พัก",
    transportLabel: "🚇 การเดินทาง",
    foodLabel: "🍜 อาหาร",
    attractionsLabel: "🎫 สถานที่ท่องเที่ยว",
    emergencyTitle: "เบอร์ติดต่อฉุกเฉิน",
    visaTitle: "ข้อมูลวีซ่า",
    paymentTitle: "การชำระเงิน",
    simTitle: "ซิมการ์ด",
    transportTitle: "การเดินทาง",
  },
  "vi": {
    save: "Lưu",
    export: "Xuất",
    exportPdf: "PDF",
    exportText: "Văn bản",
    exportJson: "JSON",
    share: "Chia sẻ",
    viewDetails: "Xem chi tiết",
    viewDetailsHint: "Chỉ là bản xem trước. Mở trang chi tiết để xem đầy đủ.",
    stops: "điểm",
    delete: "Xóa",
    saved: "Đã lưu",
    overview: "Tổng quan",
    daily: "Lịch trình hằng ngày",
    practical: "Thông tin hữu ích",
    highlights: "Điểm nổi bật",
    budget: "Chi tiết ngân sách",
    total: "Tổng cộng",
    day: "Ngày",
    details: "Chi tiết kế hoạch",
    morning: "Buổi sáng",
    afternoon: "Buổi chiều",
    evening: "Buổi tối",
    breakfast: "Bữa sáng",
    lunch: "Bữa trưa",
    dinner: "Bữa tối",
    accommodation: "Chỗ ở",
    transport: "Di chuyển",
    noItinerary: "Không có lịch trình để hiển thị",
    generateFirst: "Hãy trò chuyện với AI để tạo lịch trình trước.",
    dailyPending: "Chi tiết hằng ngày sẽ hiển thị sau khi lập kế hoạch đầy đủ",    perDay: "mỗi ngày",
    days: "ngày",
    cuisine: "Loại ẩm thực",
    priceRange: "Giá",
    recommended: "Món nên thử",
    reservation: "Cần đặt trước",
    insiderTip: "Mẹo địa phương",
    duration: "Thời gian",
    tickets: "Vé",
    bookNow: "Cần đặt vé",
    from: "từ",
    to: "đến",
    cost: "Chi phí",
    perNight: "/đêm",
    stars: "Sao",
    nearestMetro: "Ga tàu điện gần nhất",
    map: "Xem bản đồ",
    cancel: "Hủy",
    saveItinerary: "Lưu lịch trình",
    itineraryName: "Tên lịch trình",
    accommodationLabel: "🏨 Chỗ ở",
    transportLabel: "🚇 Di chuyển",
    foodLabel: "🍜 Ẩm thực",
    attractionsLabel: "🎫 Điểm tham quan",
    emergencyTitle: "Liên hệ khẩn cấp",
    visaTitle: "Thông tin visa",
    paymentTitle: "Thanh toán",
    simTitle: "SIM",
    transportTitle: "Di chuyển",
  },
  "ru": {
    save: "Сохранить",
    export: "Экспорт",
    exportPdf: "PDF",
    exportText: "Текст",
    exportJson: "JSON",
    share: "Поделиться",
    viewDetails: "Подробнее",
    viewDetailsHint: "Это только предпросмотр. Откройте страницу с полными деталями.",
    stops: "мест",
    delete: "Удалить",
    saved: "Сохранено",
    overview: "Обзор",
    daily: "Ежедневный план",
    practical: "Полезная информация",
    highlights: "Основные моменты",
    budget: "Разбивка бюджета",
    total: "Итого",
    day: "День",
    details: "Детали плана",
    morning: "Утро",
    afternoon: "День",
    evening: "Вечер",
    breakfast: "Завтрак",
    lunch: "Обед",
    dinner: "Ужин",
    accommodation: "Проживание",
    transport: "Транспорт",
    noItinerary: "Нет маршрута для отображения",
    generateFirst: "Сначала создайте маршрут в чате с ИИ.",
    dailyPending: "Детали по дням появятся после полного планирования",    perDay: "в день",
    days: "дн.",
    cuisine: "Кухня",
    priceRange: "Цена",
    recommended: "Рекомендуемые блюда",
    reservation: "Требуется бронирование",
    insiderTip: "Совет от местных",
    duration: "Длительность",
    tickets: "Билеты",
    bookNow: "Требуется бронь",
    from: "из",
    to: "до",
    cost: "Стоимость",
    perNight: "/ночь",
    stars: "Звёзды",
    nearestMetro: "Ближайшее метро",
    map: "Открыть на карте",
    cancel: "Отмена",
    saveItinerary: "Сохранить маршрут",
    itineraryName: "Название маршрута",
    accommodationLabel: "🏨 Проживание",
    transportLabel: "🚇 Транспорт",
    foodLabel: "🍜 Еда",
    attractionsLabel: "🎫 Достопримечательности",
    emergencyTitle: "Экстренные контакты",
    visaTitle: "Виза",
    paymentTitle: "Оплата",
    simTitle: "SIM-карта",
    transportTitle: "Транспорт",
  },
  "fr": {
    save: "Enregistrer",
    export: "Exporter",
    exportPdf: "PDF",
    exportText: "Texte",
    exportJson: "JSON",
    share: "Partager",
    viewDetails: "Voir les détails",
    viewDetailsHint: "Aperçu uniquement — ouvrez la page de détails pour voir tout.",
    stops: "étapes",
    delete: "Supprimer",
    saved: "Enregistré",
    overview: "Aperçu",
    daily: "Plan quotidien",
    practical: "Infos pratiques",
    highlights: "Points forts",
    budget: "Détail du budget",
    total: "Total",
    day: "Jour",
    details: "Détails du plan",
    morning: "Matin",
    afternoon: "Après-midi",
    evening: "Soir",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    accommodation: "Hébergement",
    transport: "Transport",
    noItinerary: "Aucun itinéraire à afficher",
    generateFirst: "Générez d'abord un itinéraire en discutant avec l'IA.",
    dailyPending: "Les détails quotidiens apparaîtront après la planification complète",    perDay: "par jour",
    days: "jours",
    cuisine: "Cuisine",
    priceRange: "Prix",
    recommended: "Plats recommandés",
    reservation: "Réservation requise",
    insiderTip: "Astuce de local",
    duration: "Durée",
    tickets: "Billets",
    bookNow: "Réservation requise",
    from: "de",
    to: "à",
    cost: "Coût",
    perNight: "/nuit",
    stars: "Étoiles",
    nearestMetro: "Métro le plus proche",
    map: "Voir sur la carte",
    cancel: "Annuler",
    saveItinerary: "Enregistrer l'itinéraire",
    itineraryName: "Nom de l'itinéraire",
    accommodationLabel: "🏨 Hébergement",
    transportLabel: "🚇 Transport",
    foodLabel: "🍜 Restaurants",
    attractionsLabel: "🎫 Attractions",
    emergencyTitle: "Contacts d'urgence",
    visaTitle: "Informations visa",
    paymentTitle: "Paiement",
    simTitle: "Carte SIM",
    transportTitle: "Transport",
  },
  "de": {
    save: "Speichern",
    export: "Exportieren",
    exportPdf: "PDF",
    exportText: "Text",
    exportJson: "JSON",
    share: "Teilen",
    viewDetails: "Details ansehen",
    viewDetailsHint: "Nur eine Vorschau — öffnen Sie die Detailseite für alle Details.",
    stops: "Stationen",
    delete: "Löschen",
    saved: "Gespeichert",
    overview: "Übersicht",
    daily: "Tagesplan",
    practical: "Praktische Infos",
    highlights: "Highlights",
    budget: "Budgetaufschlüsselung",
    total: "Gesamt",
    day: "Tag",
    details: "Plandetails",
    morning: "Vormittag",
    afternoon: "Nachmittag",
    evening: "Abend",
    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    accommodation: "Unterkunft",
    transport: "Transport",
    noItinerary: "Kein Reiseplan zum Anzeigen",
    generateFirst: "Erstelle zuerst einen Reiseplan im Chat mit der KI.",
    dailyPending: "Tägliche Details erscheinen nach der vollständigen Planung",    perDay: "pro Tag",
    days: "Tage",
    cuisine: "Küche",
    priceRange: "Preis",
    recommended: "Empfohlene Gerichte",
    reservation: "Reservierung erforderlich",
    insiderTip: "Lokaler Tipp",
    duration: "Dauer",
    tickets: "Tickets",
    bookNow: "Buchung erforderlich",
    from: "von",
    to: "bis",
    cost: "Kosten",
    perNight: "/Nacht",
    stars: "Sterne",
    nearestMetro: "Nächstgelegene U-Bahn",
    map: "Auf Karte ansehen",
    cancel: "Abbrechen",
    saveItinerary: "Reiseplan speichern",
    itineraryName: "Name des Reiseplans",
    accommodationLabel: "🏨 Unterkunft",
    transportLabel: "🚇 Transport",
    foodLabel: "🍜 Essen",
    attractionsLabel: "🎫 Sehenswürdigkeiten",
    emergencyTitle: "Notfallkontakte",
    visaTitle: "Visuminformationen",
    paymentTitle: "Zahlung",
    simTitle: "SIM-Karte",
    transportTitle: "Transport",
  },
  "ar": {
    save: "حفظ",
    export: "تصدير",
    exportPdf: "PDF",
    exportText: "نص",
    exportJson: "JSON",
    share: "مشاركة",
    viewDetails: "عرض التفاصيل",
    viewDetailsHint: "معاينة فقط — افتح صفحة التفاصيل لعرض المحتوى الكامل.",
    stops: "محطات",
    delete: "حذف",
    saved: "تم الحفظ",
    overview: "نظرة عامة",
    daily: "الخطة اليومية",
    practical: "معلومات عملية",
    highlights: "أبرز المعالم",
    budget: "تفاصيل الميزانية",
    total: "الإجمالي",
    day: "اليوم",
    details: "تفاصيل الخطة",
    morning: "صباحاً",
    afternoon: "ظهراً",
    evening: "مساءً",
    breakfast: "فطور",
    lunch: "غداء",
    dinner: "عشاء",
    accommodation: "إقامة",
    transport: "مواصلات",
    noItinerary: "لا توجد خطة لعرضها",
    generateFirst: "أنشئ خطة أولاً بالدردشة مع الذكاء الاصطناعي.",
    dailyPending: "ستظهر التفاصيل اليومية بعد اكتمال التخطيط",    perDay: "في اليوم",
    days: "أيام",
    cuisine: "المطبخ",
    priceRange: "السعر",
    recommended: "أطباق موصى بها",
    reservation: "يتطلب حجزاً",
    insiderTip: "نصيحة محلية",
    duration: "المدة",
    tickets: "تذاكر",
    bookNow: "يتطلب حجزاً",
    from: "من",
    to: "إلى",
    cost: "التكلفة",
    perNight: "/ليلة",
    stars: "نجوم",
    nearestMetro: "أقرب مترو",
    map: "عرض على الخريطة",
    cancel: "إلغاء",
    saveItinerary: "حفظ الخطة",
    itineraryName: "اسم الخطة",
    accommodationLabel: "🏨 إقامة",
    transportLabel: "🚇 مواصلات",
    foodLabel: "🍜 طعام",
    attractionsLabel: "🎫 معالم سياحية",
    emergencyTitle: "جهات الاتصال للطوارئ",
    visaTitle: "معلومات التأشيرة",
    paymentTitle: "الدفع",
    simTitle: "بطاقة SIM",
    transportTitle: "المواصلات",
  },
  "fa": {
    save: "ذخیره",
    export: "خروجی",
    exportPdf: "PDF",
    exportText: "متن",
    exportJson: "JSON",
    share: "اشتراک‌گذاری",
    viewDetails: "مشاهده جزئیات",
    viewDetailsHint: "فقط پیشنمایش — برای مشاهده کامل، صفحه جزئیات را باز کنید.",
    stops: "ایستگاه",
    delete: "حذف",
    saved: "ذخیره شد",
    overview: "مرور کلی",
    daily: "برنامه روزانه",
    practical: "اطلاعات کاربردی",
    highlights: "نکات برجسته",
    budget: "جزئیات بودجه",
    total: "مجموع",
    day: "روز",
    details: "جزئیات برنامه",
    morning: "صبح",
    afternoon: "بعد از ظهر",
    evening: "عصر",
    breakfast: "صبحانه",
    lunch: "ناهار",
    dinner: "شام",
    accommodation: "اقامت",
    transport: "حمل و نقل",
    noItinerary: "برنامه‌ای برای نمایش وجود ندارد",
    generateFirst: "ابتدا با گفتگو با هوش مصنوعی یک برنامه بسازید.",
    dailyPending: "جزئیات روزانه پس از برنامه‌ریزی کامل نمایش داده می‌شود",    perDay: "در روز",
    days: "روز",
    cuisine: "نوع آشپزی",
    priceRange: "قیمت",
    recommended: "غذاهای پیشنهادی",
    reservation: "نیاز به رزرو",
    insiderTip: "نکته محلی",
    duration: "مدت زمان",
    tickets: "بلیط",
    bookNow: "نیاز به رزرو",
    from: "از",
    to: "تا",
    cost: "هزینه",
    perNight: "/شب",
    stars: "ستاره",
    nearestMetro: "نزدیک‌ترین مترو",
    map: "مشاهده روی نقشه",
    cancel: "لغو",
    saveItinerary: "ذخیره برنامه",
    itineraryName: "نام برنامه",
    accommodationLabel: "🏨 اقامت",
    transportLabel: "🚇 حمل و نقل",
    foodLabel: "🍜 غذا",
    attractionsLabel: "🎫 جاذبه‌ها",
    emergencyTitle: "تماس‌های اضطراری",
    visaTitle: "اطلاعات ویزا",
    paymentTitle: "پرداخت",
    simTitle: "سیم‌کارت",
    transportTitle: "حمل و نقل",
  },
};

export type ItineraryLang =
  | "en"
  | "ja"
  | "ko"
  | "zh-CN"
  | "zh-TW"
  | "th"
  | "vi"
  | "ru"
  | "fr"
  | "de"
  | "ar"
  | "fa";


// ============================================
// Sub-components
// ============================================

const ClockIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const MapPinIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const TicketIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const StarIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg
    className={`w-3.5 h-3.5 ${filled ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ============================================
// Meal Card Component
// ============================================

const MealCard: React.FC<{
  meal: MealPlan;
  label: string;
  icon: string;
  labels: typeof LABEL.en;
}> = ({ meal, label, icon, labels }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className="font-medium text-gray-800 text-sm">{cleanMarkdown(meal.name)}</div>
    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
      <span className="text-orange-500">🍽</span>
      <span>
        {labels.cuisine}: {meal.cuisine}
      </span>
    </div>
    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
      <span className="text-green-500">💰</span>
      <span>
        {labels.priceRange}: {meal.priceRange}
      </span>
    </div>
    {meal.recommendedDishes && meal.recommendedDishes.length > 0 && (
      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">{labels.recommended}:</div>
        <div className="flex flex-wrap gap-1">
          {meal.recommendedDishes.map((dish, i) => (
            <span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {dish}
            </span>
          ))}
        </div>
      </div>
    )}
    {meal.location && (
      <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
        <MapPinIcon />
        <span>{meal.location}</span>
        {meal.distanceFromAttraction && (
          <span className="text-gray-300">· {meal.distanceFromAttraction}</span>
        )}
      </div>
    )}
    {meal.reservationRequired && (
      <div className="mt-1.5">
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
          📋 {labels.reservation}
        </span>
      </div>
    )}
  </div>
);

// ============================================
// Timeline Activity Component
// ============================================

const TimelineActivity: React.FC<{
  location: NonNullable<DailyPlan["locations"]>[number];
  index: number;
  isLast: boolean;
  labels: typeof LABEL.en;
}> = ({ location, index, isLast, labels }) => (
  <div className="flex gap-3">
    {/* Timeline line */}
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
        {index + 1}
      </div>
      {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-blue-200 to-gray-100 mt-1" />}
    </div>

    {/* Activity card */}
    <div
      className="flex-1 pb-5"
      data-lat={location.coordinates?.lat}
      data-lng={location.coordinates?.lng}
      data-name={location.name}
    >
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Time & Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
              <ClockIcon />
              <span>
                {location.bestTimeStart} – {location.bestTimeEnd}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 text-sm">{cleanMarkdown(location.name)}</h4>
            {location.nameZh && <p className="text-xs text-gray-400">{location.nameZh}</p>}
          </div>
          {location.ticketInfo?.price && (
            <span className="shrink-0 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
              🎫 {location.ticketInfo.price}
            </span>
          )}
        </div>

        {/* Duration */}
        {location.durationHours && (
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span>⏱</span>
            <span>
              {labels.duration}: {location.durationHours}h
            </span>
          </div>
        )}

        {/* Highlights */}
        {location.highlights && location.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {location.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                ✨ <LinkifyText text={h} />
              </span>
            ))}
          </div>
        )}

        {/* Booking notice */}
        {location.ticketInfo?.bookingRequired && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2">
            ⚠️ {labels.bookNow}
            {location.ticketInfo.bookingUrl && (
              <a
                href={location.ticketInfo.bookingUrl}
                target="_blank"
                rel="noopener"
                className="ml-1 underline"
              >
                →
              </a>
            )}
          </div>
        )}

        {/* Insider tip */}
        {location.insiderTip && (
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg mt-1">
            💡 <span className="font-medium">{labels.insiderTip}:</span> {location.insiderTip}
          </div>
        )}
      </div>
    </div>
  </div>
);


/** Strip common markdown markers from plain-text fields (names, meal labels). */
const cleanMarkdown = (v: string): string =>
  String(v ?? "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*/g, "")
    .trim();

/** Render text with clickable http(s) URLs (used in location/accommodation highlights). */
const LinkifyText: React.FC<{ text: string }> = ({ text }) => {
  const parts = String(text ?? "").split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

// ============================================
// Plan Text Component — renders AI markdown (headings, tables, lists, links)
// ============================================

const InlineText: React.FC<{ text: string }> = ({ text }) => {
  const nodes: React.ReactNode[] = [];
  const regex =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, code, bold, italic, link, url] = m;
    if (code) {
      nodes.push(
        <code
          key={k++}
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {code.slice(1, -1)}
        </code>,
      );
    } else if (bold) {
      nodes.push(<strong key={k++}>{bold.slice(2, -2)}</strong>);
    } else if (italic) {
      nodes.push(<em key={k++}>{italic.slice(1, -1)}</em>);
    } else if (link) {
      const lm = link.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      nodes.push(
        <a
          key={k++}
          href={lm?.[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {lm?.[1] || link}
        </a>,
      );
    } else if (url) {
      nodes.push(
        <a
          key={k++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {url}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
};

const PlanText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const blocks: React.ReactNode[] = [];
  // Strip stray ** markers from lines that have no complete **...** pair
  // (the AI sometimes emits an unclosed bold marker which renders literally).
  const cleaned = text
    .split(/\r?\n/)
    .map((l) => (/\*\*[^*\n]+\*\*/.test(l) ? l : l.replace(/\*\*/g, "")))
    .join("\n");
  const lines = cleaned.split(/\r?\n/);
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    // Table
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        if (!(cells.length > 0 && cells.every((c) => /^[-:]+$/.test(c)))) rows.push(cells);
        i++;
      }
      if (rows.length > 0) {
        const [head, ...body] = rows;
        blocks.push(
          <div key={key++} className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  {head.map((c, ci) => (
                    <th
                      key={ci}
                      className="px-2.5 py-1.5 text-left font-semibold text-gray-700 border-b border-gray-200"
                    >
                      <InlineText text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className={ri % 2 ? "bg-white" : "bg-gray-50/50"}>
                    {row.map((c, ci) => (
                      <td key={ci} className="px-2.5 py-1.5 text-gray-600 border-b border-gray-100">
                        <InlineText text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const size =
        h[1].length <= 2
          ? "text-base font-bold mt-3 mb-1"
          : h[1].length === 3
            ? "text-sm font-bold mt-2.5 mb-1"
            : "text-sm font-semibold mt-2 mb-0.5";
      blocks.push(
        <div key={key++} className={`${size} text-gray-800`}>
          <InlineText text={h[2]} />
        </div>,
      );
      i++;
      continue;
    }
    // Horizontal rule
    if (/^([-*_])\1{2,}$/.test(line)) {
      blocks.push(<hr key={key++} className="my-2 border-gray-200" />);
      i++;
      continue;
    }
    // List
    if (/^[-*•·]\s+/.test(line) || /^\d+[.、)]\s+/.test(line)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (/^[-*•·]\s+/.test(lines[i].trim()) || /^\d+[.、)]\s+/.test(lines[i].trim()))
      ) {
        items.push(
          lines[i]
            .trim()
            .replace(/^[-*•·]\s+|^\d+[.、)]\s+/, "")
            .trim(),
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1 my-1">
          {items.map((it, ix) => (
            <li key={ix} className="text-sm leading-relaxed text-gray-700">
              <InlineText text={it} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }
    // Paragraph
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("|") &&
      !/^(#{1,6})\s/.test(lines[i].trim()) &&
      !/^[-*•·]\s+/.test(lines[i].trim()) &&
      !/^([-*_])\1{2,}$/.test(lines[i].trim()) &&
      !/^\d+[.、)]\s+/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed text-gray-700 my-1">
        <InlineText text={para.join(" ")} />
      </p>,
    );
  }

  return <div className={`space-y-1 ${className || ""}`}>{blocks}</div>;
};

// Day Card Component
// ============================================

const DayCard: React.FC<{
  day: DailyPlan;
  labels: typeof LABEL.en;
  language: string;
}> = ({ day, labels, language }) => {
  const [expanded, setExpanded] = useState(day.day <= 2); // First 2 days expanded

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Day Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shrink-0">
          <span className="text-[10px] uppercase tracking-wider opacity-80">{labels.day}</span>
          <span className="text-xl font-bold leading-none">{day.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-base truncate">{day.theme}</h3>
          {day.dailyCost > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              ¥{day.dailyCost.toLocaleString()} {labels.perDay}
            </p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Transport to attractions */}
          {day.transportToAttractions && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span>🚇</span>
              <span className="font-medium">{labels.transport}:</span>
              <span>{day.transportToAttractions.route}</span>
              {day.transportToAttractions.duration && (
                <span>· {day.transportToAttractions.duration}</span>
              )}
              {day.transportToAttractions.cost && (
                <span className="text-green-600 font-medium">
                  · {day.transportToAttractions.cost}
                </span>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="ml-2">
            {day.locations && day.locations.length > 0 ? (
              day.locations.map((loc, i) => (
                <TimelineActivity
                  key={i}
                  location={loc}
                  index={i}
                  isLast={i === day.locations!.length - 1}
                  labels={labels}
                />
              ))
            ) : (
              <p className="text-sm text-gray-400 pl-10">—</p>
            )}
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {day.meals?.breakfast && (
              <MealCard
                meal={day.meals.breakfast}
                label={labels.breakfast}
                icon="🌅"
                labels={labels}
              />
            )}
            {day.meals?.lunch && (
              <MealCard meal={day.meals.lunch} label={labels.lunch} icon="☀️" labels={labels} />
            )}
            {day.meals?.dinner && (
              <MealCard meal={day.meals.dinner} label={labels.dinner} icon="🌙" labels={labels} />
            )}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏨</span>
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                  {labels.accommodation}
                </span>
              </div>
              <div className="font-medium text-gray-800">{cleanMarkdown(day.accommodation.name)}</div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < day.accommodation!.stars} />
                  ))}
                </div>
                <span className="text-indigo-600 font-medium">
                  {day.accommodation.pricePerNight}
                  {labels.perNight}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPinIcon />
                <span>{day.accommodation.location}</span>
                {day.accommodation.nearestMetro && (
                  <span className="text-gray-400">· 🚇 {day.accommodation.nearestMetro}</span>
                )}
              </div>
              {day.accommodation.highlights && day.accommodation.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {day.accommodation.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      <LinkifyText text={h} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Raw notes with links */}
          {day.notes && day.notes.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {labels.details}
              </div>
              <PlanText text={day.notes.join("\n")} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// Budget Section Component
// ============================================

const BudgetBreakdown: React.FC<{
  costBreakdown: NonNullable<SavedItinerary["data"]["summary"]["costBreakdown"]>;
  estimatedTotalCost: number;
  currency: string;
  labels: typeof LABEL.en;
}> = ({ costBreakdown, estimatedTotalCost, currency, labels }) => {
  const items = [
    {
      key: "accommodation",
      label: labels.accommodationLabel,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    {
      key: "food",
      label: labels.foodLabel,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      key: "transport",
      label: labels.transportLabel,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      key: "attractions",
      label: labels.attractionsLabel,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ] as const;

  const total = Object.values(costBreakdown).reduce((sum, v) => sum + Number(v), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-xl">💰</span>
        {labels.budget}
      </h3>

      {/* Total */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {currency === "CNY" ? "¥" : currency} {estimatedTotalCost.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">{labels.total}</div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-gray-100">
          {items.map((item) => {
            const value = Number(costBreakdown[item.key as keyof typeof costBreakdown] || 0);
            const pct = (value / total) * 100;
            return pct > 0 ? (
              <div
                key={item.key}
                className={`${item.color} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${item.label}: ${value}`}
              />
            ) : null;
          })}
        </div>
      )}

      {/* Breakdown items */}
      <div className="space-y-2">
        {items.map((item) => {
          const value = Number(costBreakdown[item.key as keyof typeof costBreakdown] || 0);
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between ${item.bgColor} rounded-lg px-3 py-2`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className={`text-sm font-medium ${item.textColor}`}>{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-800">
                  {currency === "CNY" ? "¥" : currency} {value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Practical Info Section
// ============================================

const PracticalInfoSection: React.FC<{ labels: typeof LABEL.en }> = ({ labels }) => (
  <div className="space-y-3">
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h4 className="font-semibold text-amber-800 mb-2">⚠️ {labels.visaTitle}</h4>
      <p className="text-sm text-amber-700">
        Most nationalities require a visa. Tourist (L) visa recommended. Apply 2–4 weeks before
        travel.
      </p>
    </div>
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <h4 className="font-semibold text-green-800 mb-2">💳 {labels.paymentTitle}</h4>
      <p className="text-sm text-green-700">
        Use Alipay or WeChat Pay for most payments. Keep some cash as backup. International cards
        accepted at hotels and large restaurants.
      </p>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-semibold text-blue-800 mb-2">📱 {labels.simTitle}</h4>
      <p className="text-sm text-blue-700">
        Get a local SIM at the airport or convenience stores. China Mobile, Unicom, and Telecom
        offer tourist plans.
      </p>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <h4 className="font-semibold text-gray-800 mb-2">🚇 {labels.transportTitle}</h4>
      <p className="text-sm text-gray-600">
        High-speed trains are efficient. Download Didi app for taxis. Metro available in all major
        cities.
      </p>
    </div>
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <h4 className="font-semibold text-red-800 mb-2">🆘 {labels.emergencyTitle}</h4>
      <div className="text-sm text-red-700 space-y-1">
        <div>🚑 Ambulance: 120</div>
        <div>🚔 Police: 110</div>
        <div>🔥 Fire: 119</div>
      </div>
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  itinerary,
  language = "en",
  onSave,
  onExport,
  onShare,
  onDelete,
  onOpenDetail,
  compact = false,
}) => {
  const labels = (LABEL[language] || LABEL.en) as typeof LABEL.en;
  const [activeTab, setActiveTab] = useState<"overview" | "daily" | "practical">("daily");
  const [editName, setEditName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSaveClick = useCallback(() => {
    if (!itinerary) return;
    if (itinerary.id?.startsWith("temp_")) {
      setShowSaveDialog(true);
      setEditName(itinerary.name);
    } else if (onSave) {
      onSave(itinerary.name);
    }
  }, [itinerary, onSave]);

  const handleSaveConfirm = useCallback(() => {
    if (editName.trim() && onSave) {
      onSave(editName.trim());
      setShowSaveDialog(false);
    }
  }, [editName, onSave]);

  // No itinerary
  if (!itinerary) {
    return (
      <div className={`${compact ? "p-4" : "p-8"} bg-gray-50 rounded-xl text-center`}>
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="font-semibold text-gray-700 mb-2">{labels.noItinerary}</h3>
        <p className="text-sm text-gray-500">{labels.generateFirst}</p>
      </div>
    );
  }

  const summary = itinerary.data?.summary;
  const daily = itinerary.data?.dailyItinerary || [];
  const practical = itinerary.data?.practicalInfo || [];
  const isSaved = !itinerary.id?.startsWith("temp_");

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${compact ? "" : "shadow-sm"}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{itinerary.name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {summary?.destination || itinerary.destination} · {itinerary.days} {labels.days}
            </p>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
              ✓ {labels.saved}
            </span>
          )}
        </div>

        {!compact && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveClick}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {labels.save}
          </button>
          <div className="relative flex-1">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {labels.export}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30">
                {(
                  [
                    { key: "pdf", label: labels.exportPdf },
                    { key: "text", label: labels.exportText },
                    { key: "json", label: labels.exportJson },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setShowExportMenu(false);
                      onExport?.(opt.key);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isSaved && (
            <button
              onClick={onShare}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              {labels.share}
            </button>
          )}
          {isSaved && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-lg text-sm transition-colors"
              title={labels.delete}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
        )}
      </div>

      {/* Compact preview mode */}
      {compact ? (
        <div className="p-4">
          {/* Primary CTA — open the full detail page */}
          {itinerary.id && !itinerary.id.startsWith("local_") && onOpenDetail && (
            <>
              <button
                type="button"
                onClick={() => onOpenDetail(itinerary.id as string)}
                className="w-full mb-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
              >
                {labels.viewDetails}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-[11px] text-gray-400 text-center mb-3">{labels.viewDetailsHint}</p>
            </>
          )}

          {/* Preview */}
          {summary?.topHighlights && summary.topHighlights.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {labels.highlights}
              </div>
              {summary.topHighlights.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 mb-1">
                  <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                  <span className="truncate">{h}</span>
                </div>
              ))}
            </div>
          )}
          {daily.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {labels.daily}
              </div>
              <div className="text-xs text-gray-600">
                {daily.length} {labels.days} ·{" "}
                {daily.reduce((a, d) => a + (d.locations?.length || 0), 0)}{" "}
                {labels.stops || "stops"}
              </div>
            </div>
          )}
          {itinerary.data?.rawPlan && (
            <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">
              {itinerary.data.rawPlan.replace(/[#*`|>\s]+/g, " ").replace(/\s+/g, " ").slice(0, 120)}
              …
            </p>
          )}

          {/* Secondary actions — save / export / share / delete */}
          <div className="flex gap-1.5 mt-1">
            {onSave && !isSaved && (
              <button
                onClick={handleSaveClick}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {labels.save}
              </button>
            )}
            {onExport && (
              <div className="relative flex-1">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {labels.export}
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30">
                    {(
                      [
                        { key: "pdf", label: labels.exportPdf },
                        { key: "text", label: labels.exportText },
                        { key: "json", label: labels.exportJson },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setShowExportMenu(false);
                          onExport?.(opt.key);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isSaved && onShare && (
              <button
                onClick={onShare}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {labels.share}
              </button>
            )}
            {isSaved && onDelete && (
              <button
                onClick={onDelete}
                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                title={labels.delete}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        <nav className="flex px-2">
          {(["daily", "overview", "practical"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {labels[tab as keyof typeof labels] || tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className={`p-4 ${compact ? "max-h-96" : "max-h-[70vh]"} overflow-y-auto`}>
        {/* Daily Tab */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            {daily.length === 0 ? (
              itinerary.data?.rawPlan ? (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📋</span>
                    <h3 className="font-semibold text-gray-800 text-sm">{labels.details}</h3>
                  </div>
                  <PlanText text={itinerary.data.rawPlan} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-gray-500 text-sm">
                    {labels.dailyPending}
                  </p>
                </div>
              )
            ) : (
              daily.map((day: DailyPlan) => (
                <DayCard key={day.day} day={day} labels={labels} language={language} />
              ))
            )}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Highlights */}
            {summary?.topHighlights && summary.topHighlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">⭐</span> {labels.highlights}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {summary.topHighlights.slice(0, 6).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget */}
            {summary?.estimatedTotalCost && summary?.costBreakdown && (
              <BudgetBreakdown
                costBreakdown={summary.costBreakdown}
                estimatedTotalCost={summary.estimatedTotalCost}
                currency={summary.currency || "CNY"}
                labels={labels}
              />
            )}

            {/* Tips */}
            {summary?.travelTips && summary.travelTips.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> Travel Tips
                </h3>
                <ul className="space-y-2">
                  {summary.travelTips.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Practical Tab */}
        {activeTab === "practical" && <PracticalInfoSection labels={labels} />}
      </div>


        </>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-96 shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">{labels.saveItinerary}</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={labels.itineraryName}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveConfirm()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleSaveConfirm}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {labels.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;
