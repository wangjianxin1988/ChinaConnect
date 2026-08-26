/**
 * TripView — public shared-itinerary view.
 * Resolves a share token to an ai_routes row (or a same-browser local route)
 * and renders the full ItineraryDisplay.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase/config";
import { extractedRouteToSavedItinerary, routeRowToSavedItinerary } from "@/lib/ai/itinerary-builder";
import type { SavedItinerary } from "@/lib/ai/types";
import { ItineraryDisplay } from "@/components/ai/ItineraryDisplay";

const TRIP_LABELS: Record<string, { loading: string; notFound: string; notFoundDesc: string; cta: string; shared: string; plan: string; days: string }> = {
  en: { loading: "Loading itinerary…", notFound: "Itinerary not found", notFoundDesc: "{TRIP_LABELS[lang]?.notFoundDesc || TRIP_LABELS.en.notFoundDesc}", cta: "{TRIP_LABELS[lang]?.cta || TRIP_LABELS.en.cta}", shared: "{TRIP_LABELS[lang]?.shared || TRIP_LABELS.en.shared}", plan: "{TRIP_LABELS[lang]?.plan || TRIP_LABELS.en.plan}", days: "day(s)" },
  ja: { loading: "行程を読み込み中…", notFound: "行程が見つかりません", notFoundDesc: "この共有リンクは無効か、行程が削除された可能性があります。所有者に新しいリンクを依頼してください。", cta: "✨ ChinaGuide AI で新しい旅行を計画", shared: "共有された行程 · chinaengage.org", plan: "✨ ChinaGuide AI で自分の旅行を計画", days: "日間" },
  ko: { loading: "일정을 불러오는 중…", notFound: "일정을 찾을 수 없습니다", notFoundDesc: "이 공유 링크가 유효하지 않거나 일정이 삭제되었습니다. 소유자에게 새 링크를 요청하세요.", cta: "✨ ChinaGuide AI로 새 여행 계획하기", shared: "공유된 일정 · chinaengage.org", plan: "✨ ChinaGuide AI로 나만의 여행 계획하기", days: "일" },
  "zh-CN": { loading: "正在加载行程…", notFound: "行程未找到", notFoundDesc: "此分享链接无效或行程已被删除，请联系所有者获取新链接。", cta: "✨ 用 ChinaGuide AI 规划新行程", shared: "分享的行程 · chinaengage.org", plan: "✨ 用 ChinaGuide AI 规划你的行程", days: "天" },
  "zh-TW": { loading: "正在載入行程…", notFound: "找不到行程", notFoundDesc: "此分享連結無效或行程已被刪除，請聯絡擁有者取得新連結。", cta: "✨ 使用 ChinaGuide AI 規劃新行程", shared: "分享的行程 · chinaengage.org", plan: "✨ 使用 ChinaGuide AI 規劃你的行程", days: "天" },
  th: { loading: "กำลังโหลดแผนการเดินทาง…", notFound: "ไม่พบแผนการเดินทาง", notFoundDesc: "ลิงก์นี้ไม่ถูกต้องหรือแผนการเดินทางถูกลบแล้ว กรุณาขอลิงก์ใหม่จากเจ้าของ", cta: "✨ วางแผนทริปใหม่กับ ChinaGuide AI", shared: "แผนการเดินทางที่แชร์ · chinaengage.org", plan: "✨ วางแผนทริปของคุณกับ ChinaGuide AI", days: "วัน" },
  vi: { loading: "Đang tải lịch trình…", notFound: "Không tìm thấy lịch trình", notFoundDesc: "Liên kết chia sẻ này không hợp lệ hoặc lịch trình đã bị xóa. Vui lòng yêu cầu chủ sở hữu cung cấp liên kết mới.", cta: "✨ Lên kế hoạch chuyến đi mới với ChinaGuide AI", shared: "Lịch trình được chia sẻ · chinaengage.org", plan: "✨ Lên kế hoạch chuyến đi của bạn với ChinaGuide AI", days: "ngày" },
  ru: { loading: "Загрузка маршрута…", notFound: "Маршрут не найден", notFoundDesc: "Эта ссылка недействительна или маршрут был удалён. Попросите владельца прислать новую ссылку.", cta: "✨ Спланируйте новую поездку с ChinaGuide AI", shared: "Общий маршрут · chinaengage.org", plan: "✨ Спланируйте свою поездку с ChinaGuide AI", days: "дн." },
  fr: { loading: "Chargement de l'itinéraire…", notFound: "Itinéraire introuvable", notFoundDesc: "Ce lien de partage est invalide ou l'itinéraire a été supprimé. Demandez un nouveau lien au propriétaire.", cta: "✨ Planifiez un nouveau voyage avec ChinaGuide AI", shared: "Itinéraire partagé · chinaengage.org", plan: "✨ Planifiez votre propre voyage avec ChinaGuide AI", days: "jour(s)" },
  de: { loading: "Reiseplan wird geladen…", notFound: "Reiseplan nicht gefunden", notFoundDesc: "Dieser Freigabelink ist ungültig oder der Reiseplan wurde entfernt. Bitte bitten Sie den Besitzer um einen neuen Link.", cta: "✨ Neue Reise mit ChinaGuide AI planen", shared: "Geteilter Reiseplan · chinaengage.org", plan: "✨ Eigene Reise mit ChinaGuide AI planen", days: "Tag(e)" },
  ar: { loading: "جارٍ تحميل خطة السفر…", notFound: "لم يتم العثور على الخطة", notFoundDesc: "رابط المشاركة هذا غير صالح أو تم حذف الخطة. يرجى طلب رابط جديد من المالك.", cta: "✨ خطط لرحلة جديدة مع ChinaGuide AI", shared: "خطة سفر مشتركة · chinaengage.org", plan: "✨ خطط لرحلتك الخاصة مع ChinaGuide AI", days: "أيام" },
  fa: { loading: "در حال بارگذاری برنامه سفر…", notFound: "برنامه سفر یافت نشد", notFoundDesc: "این لینک اشتراک‌گذاری نامعتبر است یا برنامه حذف شده است. لطفاً از مالک لینک جدیدی بخواهید.", cta: "✨ برنامه‌ریزی سفر جدید با ChinaGuide AI", shared: "برنامه سفر مشترک · chinaengage.org", plan: "✨ برنامه‌ریزی سفر خود با ChinaGuide AI", days: "روز" },
};

interface TripViewProps {
  token?: string;
}

type LoadState = "loading" | "ready" | "notfound";

const TRIP_LOCALES = new Set([
  "en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa",
]);

function resolveToken(tokenProp?: string): string {
  if (tokenProp) return tokenProp;
  if (typeof window === "undefined") return "";
  const fromQuery = new URLSearchParams(window.location.search).get("token");
  if (fromQuery) return fromQuery;
  const segs = window.location.pathname.split("/").filter(Boolean);
  // /trip/<token> or /<locale>/trip/<token>
  if (segs[0] === "trip") return segs[1] || "";
  if (TRIP_LOCALES.has(segs[0]) && segs[1] === "trip") return segs[2] || "";
  return "";
}

export function TripView({ token: tokenProp }: TripViewProps) {
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [lang, setLang] = useState<string>(() => detectLang());
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    const token = resolveToken(tokenProp);
    if (!token) {
      setState("notfound");
      return;
    }
    (async () => {
      // 1. Same-browser local routes (offline / not-yet-synced shares)
      try {
        const rawIndex = localStorage.getItem("cc_ai_share_index");
        const rawRoutes = localStorage.getItem("cc_ai_saved_routes");
        if (rawIndex && rawRoutes) {
          const index = JSON.parse(rawIndex) as Record<string, string>;
          const localId = index[token];
          if (localId) {
            const routes = JSON.parse(rawRoutes) as Array<Record<string, unknown>>;
            const route = routes.find((r) => r.id === localId);
            if (route) {
              const it = extractedRouteToSavedItinerary(route as never);
              if (typeof route.createdAt === "string") it.createdAt = route.createdAt;
              if (!cancelled) {
                setItinerary(it);
                setState("ready");
              }
              return;
            }
          }
        }
      } catch {
        // fall through to Supabase
      }

      // 2. Server-side public share (anon key, RLS allows is_public=true rows)
      try {
        const { data, error } = await supabase
          .from("ai_routes")
          .select(
            "id, title, title_zh, summary, summary_zh, days, route_data, created_at, updated_at",
          )
          .eq("share_token", token)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setState("notfound");
          return;
        }
        setItinerary(routeRowToSavedItinerary(data as never));
        setState("ready");
      } catch {
        if (!cancelled) setState("notfound");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenProp]);

  if (state === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          {/* label */}<p className="text-gray-500 text-sm">{TRIP_LABELS[lang]?.loading || TRIP_LABELS.en.loading}</p>
        </div>
      </div>
    );
  }

  if (state === "notfound" || !itinerary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{TRIP_LABELS[lang]?.notFound || TRIP_LABELS.en.notFound}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {TRIP_LABELS[lang]?.notFoundDesc || TRIP_LABELS.en.notFoundDesc}
          </p>
          <a href="/ai" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm">
            {TRIP_LABELS[lang]?.cta || TRIP_LABELS.en.cta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[60vh]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-5">
          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
            {TRIP_LABELS[lang]?.shared || TRIP_LABELS.en.shared}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{itinerary.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {itinerary.destination || "China"} · {itinerary.days} {TRIP_LABELS[lang]?.days || "day(s)"}
          </p>
        </div>
        <ItineraryDisplay itinerary={itinerary} language={lang as never} />
        <div className="mt-8 text-center">
          <a
            href="/ai"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            {TRIP_LABELS[lang]?.plan || TRIP_LABELS.en.plan}
          </a>
        </div>
      </div>
    </div>
  );
}

function detectLang(): string {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem("chinaconnect_language");
    if (stored && TRIP_LABELS[stored]) return stored;
  } catch {
    // ignore
  }
  const html = document.documentElement.lang;
  if (html && TRIP_LABELS[html]) return html;
  const nav = navigator.language || "en";
  if (TRIP_LABELS[nav]) return nav;
  const prefix = nav.split("-")[0];
  for (const key of Object.keys(TRIP_LABELS)) {
    if (key.toLowerCase().startsWith(prefix)) return key;
  }
  return "en";
}

export default TripView;
